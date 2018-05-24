
import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Difficulty } from "./../consensus/difficulty"
import { MinerServer } from "./minerServer"

// tslint:disable-next-line:no-var-requires
const LibStratum = require("stratum").Server
const logger = getLogger("Stratum")

interface ICandidateBlock {
    block: Block,
    difficulty: Difficulty,
    jobId: number,
    prehash: Uint8Array,
}

export class StratumServer {
    private jobId: number = 0
    private readonly maxMapCount = 10
    private minerServer: MinerServer

    private port: number
    private net: any = undefined
    private socketsId: any[] = []
    private mapSocket: Map<string, any> = new Map<string, any>()

    private mapCandidateBlock: Map<number, ICandidateBlock>

    constructor(minerServer: MinerServer, port: number = 9081) {
        logger.debug(`Stratum Server`)
        this.minerServer = minerServer
        this.port = port
        this.net = new LibStratum({ settings: { port: this.port } })
        this.mapCandidateBlock = new Map<number, ICandidateBlock>()
        this.jobId = 0
        this.initialize()
    }

    public getMinerCount() {
        return this.socketsId.length

    }
    public stop() {
        this.mapCandidateBlock.clear()
    }

    public putWork(block: Block, prehash: Uint8Array, difficulty: Difficulty, minerOffset: number) {
        const jobId = this.newJob({ jobId: this.jobId, prehash, difficulty, block })

        for (let index = 0; index < this.socketsId.length; index++) {
            const socket = this.mapSocket.get(this.socketsId[index])
            if (socket !== undefined) {
                socket.notify([
                    index + minerOffset,      // job_prefix
                    Buffer.from(prehash as Buffer).toString("hex"),
                    difficulty.getMinerTarget(),
                    jobId,
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
                    logger.debug(`Submit job id : ${req.params.job_id} / nonce : ${req.params.nonce} / result : ${req.params.result}`)
                    const jobId: number = Number(req.params.job_id)
                    let result = false
                    if (this.jobId !== jobId) {
                        deferred.resolve([result])
                        break
                    }
                    result = await this.completeWork(jobId, req.params.nonce)
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
    private async completeWork(jobId: number, nonceStr: string): Promise<boolean> {
        try {
            if (nonceStr.length !== 16) {
                logger.debug(`Invalid Nonce (NONCE : ${nonceStr})`)
                return false
            }

            const candiate = this.mapCandidateBlock.get(jobId)
            if (candiate === undefined) {
                return false
            }

            const nonce = this.hexToLongLE(nonceStr)

            if (!(await MinerServer.checkNonce(candiate.prehash, nonce, candiate.difficulty))) {
                return false
            }

            if (!this.mapCandidateBlock.has(jobId)) {
                return false
            }

            const minedBlock = new Block(candiate.block)
            minedBlock.header.nonce = nonce
            this.minerServer.submitBlock(minedBlock)
            return true
        } catch (e) {
            throw new Error(`Fail to submit nonce : ${e}`)
        }
    }

    private newJob(block: ICandidateBlock) {
        this.jobId++
        if (this.jobId > 0xFFFFFFFF) { this.jobId = 0 }
        this.mapCandidateBlock.delete(this.jobId - this.maxMapCount)
        this.mapCandidateBlock.set(this.jobId, block)
        return this.jobId
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
