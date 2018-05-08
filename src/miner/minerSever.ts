import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Server } from "../server"
import { zeroPad } from "../util/commonUtil"
import * as util from "../util/difficulty"
import { Hash } from "../util/hash"
import { CpuMiner } from "./cpuMiner"
import { IMiner } from "./iminer"
import { StratumServer } from "./stratumServer"

const logger = getLogger("Miner")

export class MinerServer implements IMiner {

    // constant
    public static readonly LEN_BLOB: number = 72
    public static readonly LEN_HEX_BLOB: number = 144
    public static readonly LEN_PRE_HASH: number = 64
    public static readonly LEN_HEX_PRE_HASH: number = 128
    public static readonly LEN_NONCE: number = 8
    public static readonly LEN_HEX_NONCE: number = 16
    public static readonly LEN_TARGET: number = 2
    public static readonly LEN_HEX_TARGET: number = 4
    public static readonly LEN_RESULT: number = 32
    public static readonly LEN_HEX_RESULT: number = 64

    // variable
    public static useCpuMiner: boolean = false
    private server: Server
    private stratumServer: StratumServer
    private cpuMiner: CpuMiner
    private block: Block | undefined
    private prehash: Uint8Array | undefined
    private target: Uint8Array
    private listCallBackNewBlock: (block: Block) => void

    public constructor(server: Server, stratumPort: number) {
        this.init()

        this.server = server

        this.stratumServer = new StratumServer(this, stratumPort)
        this.cpuMiner = new CpuMiner(this)
    }

    public newCandidateBlock(candidateBlock: Block): void {
        this.start()

        // check same block
        const hash = candidateBlock.header.preHash()
        if (this.prehash === hash) {
            logger.debug(`Receive same block`)
            return
        }
        this.block = candidateBlock
        this.prehash = hash

        // set Target
        const target = candidateBlock.header.difficulty
        const bufTarget = Buffer.from(util.difficulty(util.unforcedInt(target)), "hex")
        this.target = new Uint8Array(bufTarget).subarray(0, MinerServer.LEN_TARGET)

        // check miner count
        const jobUnit = this.calculateJobUnit()

        logger.info(`Send candidate block to miner - prehash : ${Buffer.from(candidateBlock.header.preHash().buffer).toString("hex")} / target : ${Buffer.from(this.target.buffer).toString("hex")}`)

        // notify cpuminer and stratum server
        if (MinerServer.useCpuMiner) {
            this.cpuMiner.putWork(this.prehash, this.target, jobUnit)
        }
        this.stratumServer.putWork(this.prehash, this.target, jobUnit)
    }
    public async submitNonce(nonce: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            if (this.block === undefined || this.prehash === undefined) {
                return resolve(false)
            }

            const result = await this.checkNonce(nonce)
            if (result) {
                logger.info(`Success to search nonce !!! - PREHASH : ${Buffer.from(this.prehash.buffer).toString("hex")} /  NONCE : ${zeroPad(nonce, MinerServer.LEN_HEX_NONCE)}`)

                this.block.header.nonce = Long.fromString(nonce, true, 16)

                // TODO Server.trackIncomingBlock()
                if (this.listCallBackNewBlock !== undefined) {
                    this.listCallBackNewBlock(this.block)
                }

                resolve(true)

                this.stop()
            } else {
                logger.info(`Fail to search nonce !!! - PREHASH : ${Buffer.from(this.prehash.buffer).toString("hex")} /  NONCE : ${zeroPad(nonce, MinerServer.LEN_HEX_NONCE)}`)
                resolve(false)
            }
        })
    }
    public start(): void {
        this.init()

        if (MinerServer.useCpuMiner) {
            this.cpuMiner.start()
        }
        this.stratumServer.start()
    }
    public stop(): void {
        this.init()

        if (MinerServer.useCpuMiner) {
            this.cpuMiner.stop()
        }
        this.stratumServer.stop()
    }
    public addCallbackNewBlock(callback: (block: Block) => void, priority?: number): void {
        this.listCallBackNewBlock = callback
    }
    public removeCallbackNewBlock(callback: (block: Block) => void): void {
        this.listCallBackNewBlock = undefined
    }

    private init() {
        this.block = undefined
        this.prehash = undefined
        this.target = undefined
    }

    private async checkNonce(nonce: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            if (this.prehash === undefined) {
                return resolve(false)
            }
            const result = await CpuMiner.hash(this.prehash, nonce)
            if ((result[0] < this.target[0] || ((result[0] === this.target[0]) && (result[1] < this.target[1])))) {
                logger.debug(`HASH Result : ${Buffer.from(result.buffer).toString("hex")}`)
                resolve(true)
            } else {
                logger.debug(`HASH Result : ${Buffer.from(result.buffer).toString("hex")}`)
                resolve(false)
            }
        })
    }

    private calculateJobUnit(): Long {

        const miners = this.stratumServer.getMinerCount() + (MinerServer.useCpuMiner ? 1 : 0)
        const maxNonce = Long.MAX_UNSIGNED_VALUE
        const unit = maxNonce.divide(miners)
        return unit
    }
}
