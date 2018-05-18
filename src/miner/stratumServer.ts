
import { getLogger } from "log4js"
import { zeroPad } from "../util/commonUtil"
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

    public start() {
        this.prehash = undefined
        this.difficulty = undefined
    }
    public stop() {
        this.prehash = undefined
        this.difficulty = undefined
    }

    public putWork(prehash: Uint8Array, difficulty: Difficulty, minersCount: number) {
        logger.debug(`>>>>>>>>>Put Work in stratumServer : ${Buffer.from(prehash.buffer).toString("hex")}`)
        this.prehash = prehash
        this.difficulty = difficulty
        const target = difficulty.getMinerTarget()

        for (let index = 0; index < this.socketsId.length; index++) {
            const socket = this.mapSocket.get(this.socketsId[index])
            if (socket !== undefined) {
                socket.notify([
                    index + (MinerServer.useCpuMiner ? 1 : 0),      // job_id
                    new Buffer(this.prehash).toString("hex"),       // prehash
                    target,                                         // difficulty (2byte hex)
                    minersCount,                                    // job_unit
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
        const self = this
        this.net.on("mining", async (req: any, deferred: any, socket: any) => {
            if (self.socketsId.indexOf(socket.id) === -1) {
                logger.info(`New miner socket(${socket.id}) connected`)
                self.socketsId.push(socket.id)
                self.mapSocket.set(socket.id, socket)
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
                    const result = await self.completeWork(req.params.nonce)
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
            self.mapSocket.delete(socketId)
            self.socketsId.splice(self.socketsId.indexOf(socketId), 1)
        })
    }

    private async completeWork(nonce: string): Promise<boolean> {
        try {
            if (this.prehash === undefined || this.difficulty === undefined) {
                logger.debug(`This Block is already confirm (NONCE : ${nonce})`)
                return Promise.resolve(false)
            } else {
                return await this.minerServer.submitNonce(nonce)
            }
        } catch (e) {
            return Promise.reject(`Fail to submit nonce : ${e}`)
        }
    }

}
