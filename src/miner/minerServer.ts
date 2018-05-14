import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Server } from "../server"
import { zeroPad } from "../util/commonUtil"
import * as util from "../util/difficultyUtil"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"
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
    private difficulty: Difficulty
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
        this.difficulty = Difficulty.decode(target)
        const params = this.difficulty.getMinerParameters()
        // check miner count
        const minersCount = this.getMinersCount()

        logger.info(`Send candidate block to miner - prehash : ${Buffer.from(candidateBlock.header.preHash().buffer).toString("hex")} / offset : ${params.offset} target : ${params.target}`)

        // notify cpuminer and stratum server
        if (MinerServer.useCpuMiner) {
            this.cpuMiner.putWork(this.prehash, this.difficulty, minersCount)
        }
        this.stratumServer.putWork(this.prehash, this.difficulty, minersCount)
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

                if (this.listCallBackNewBlock !== undefined) {
                    this.listCallBackNewBlock(this.block)
                    logger.debug(`Block Hash: ${new Hash(this.block.header).toHex()}`)
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
        this.difficulty = undefined
    }

    private async checkNonce(nonce: string): Promise<boolean> {
        if (this.prehash === undefined) {
            return false
        }
        const result = await CpuMiner.hash(this.prehash, nonce)

        if ( !(this.difficulty.greaterThan(result) ) ) {
            logger.debug(`HASH Result : ${Buffer.from(result.buffer).toString("hex")}`)
            return true
        } else {
            logger.debug(`HASH Result : ${Buffer.from(result.buffer).toString("hex")}`)
            return false
        }
    }

    private getMinersCount(): number {
        const miners = this.stratumServer.getMinerCount() + (MinerServer.useCpuMiner ? 1 : 0)

        return miners
    }
}
