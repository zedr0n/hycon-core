
import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Difficulty } from "./../consensus/difficulty"
import { MinerServer } from "./minerServer"

// tslint:disable-next-line:no-var-requires
const LibStratum = require("stratum").Server
const logger = getLogger("Stratum")

export class StratumServer {
    private minerServer: MinerServer

    private port: number
    private net: any = undefined

    private prehash: Uint8Array | undefined
    private difficulty: Difficulty | undefined
    private block: Block | undefined
    private socketsId: any[] = []
    private mapSocket: Map<string, any> = new Map<string, any>()

    constructor(minerServer: MinerServer, port: number = 9081) {
        logger.debug(`Stratum Server`)
        this.minerServer = minerServer
        this.port = port
        this.net = new LibStratum({ settings: { port: this.port } })

        this.initialize()
    }

    public getMinerCount() {
        return this.socketsId.length

    }
    public stop() {
        this.prehash = undefined
        this.difficulty = undefined
    }

    public putWork(block: Block, prehash: Uint8Array, difficulty: Difficulty, minerOffset: number) {
        this.prehash = Uint8Array.from(prehash)
        this.difficulty = difficulty
        this.block = block
        const target = difficulty.getMinerTarget()

        for (let index = 0; index < this.socketsId.length; index++) {
            const socket = this.mapSocket.get(this.socketsId[index])
            if (socket !== undefined) {
                socket.notify([
                    index + minerOffset,      // job_id
                    Buffer.from(this.prehash as Buffer).toString("hex"),       // prehash
                    target,                                         // difficulty (2byte hex)
                    0,
                    "0", // empty
                    "0", // empty
                    "0", // empty
                    "0", // empty
                    true, // empty
                ]).then(
                    () => {
                        logger.debug(`Put work - ${index} miner success `)
                    },
                    () => {
                        logger.debug(`Put work - ${index} miner fail `)
                    },
                )
            }
        }
    }

    private initialize() {
        this.net.on("mining", async (req: any, deferred: any, socket: any) => {
            if (this.socketsId.indexOf(socket.id) === -1) {
                logger.info(`New miner socket(${socket.id}) connected`)
                this.socketsId.push(socket.id)
                this.mapSocket.set(socket.id, socket)
            }
            logger.debug(req)
            switch (req.method) {
                case "subscribe":
                    deferred.resolve([
                        socket.id.toString(), // socket id
                        "0", // empty
                        "0", // empty
                        4, // empty
                    ])
                    break
                case "authorize":
                    logger.info(`Authorizing worker id : ${req.params[0]} /  pw : ${req.params[1]}`)
                    deferred.resolve([true])
                    deferred.promise.then(() => { })
                    break
                case "submit":
                    logger.debug(`Submit id : ${req.id} / nonce : ${req.params.nonce} / result : ${req.params.result}`)
                    const result = await this.completeWork(req.params.nonce)
                    deferred.resolve([result])
                    break
                default:
                    deferred.reject(LibStratum.errors.METHOD_NOT_FOUND)
            }
        })

        this.net.on("mining.error", (error: any, socket: any) => {
            logger.error("Mining error: ", error)
        })

        this.net.listen().done((msg: any) => {
            logger.debug(msg)
        })

        this.net.on("close", (socketId: any) => {
            logger.info(`Miner socket(${socketId}) closed `)
            this.mapSocket.delete(socketId)
            this.socketsId.splice(this.socketsId.indexOf(socketId), 1)
        })
    }
    private async completeWork(nonceStr: string): Promise<boolean> {
        try {
            if (this.prehash === undefined || this.difficulty === undefined || this.block === undefined) {
                logger.debug(`This Block is already confirm (NONCE : ${nonceStr})`)
                return false
            } else if (nonceStr.length !== 16) {
                logger.debug(`Invalid Nonce (NONCE : ${nonceStr})`)
                return false
            } else {
                const nonce = this.hexToLongLE(nonceStr)
                logger.debug(`before checkNonce ${Buffer.from(this.prehash.buffer).toString("hex")} ${nonceStr})`)
                if (await MinerServer.checkNonce(this.prehash, nonce, this.difficulty)) {
                    this.block.header.nonce = nonce
                    this.minerServer.submitBlock(this.block)
                    this.block = undefined
                    this.prehash = undefined
                    this.difficulty = undefined
                    return true
                } else {
                    return false
                }
            }
        } catch (e) {
            throw new Error(`Fail to submit nonce : ${e}`)
        }
    }

    private hexToLongLE(val: string): Long {
        const buf = new Uint8Array(Buffer.from(val, "hex"))
        let high = 0
        let low = 0
        for (let idx = 7; idx >= 4; --idx) {
            high *= 256
            high += buf[idx]
            low *= 256
            low += buf[idx - 4]
        }
        return new Long(low, high, true)
    }

}
