import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Server } from "../server"
import { zeroPad } from "../util/commonUtil"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"
import { CpuMiner } from "./cpuMiner"
import { IMiner } from "./iminer"
import { StratumServer } from "./stratumServer"

const logger = getLogger("Miner")

export class MinerServer implements IMiner {

    public static async checkNonce(preHash: Uint8Array, nonce: Long, difficulty: Difficulty): Promise<boolean> {
        const buffer = Buffer.allocUnsafe(72)
        buffer.fill(preHash.buffer, 0, 64)
        buffer.writeUInt32LE(nonce.low, 64)
        buffer.writeUInt32LE(nonce.high, 68)
        return difficulty.acceptable(await Hash.hashCryptonight(buffer))
    }

    private server: Server
    private stratumServer: StratumServer
    private cpuMiner: CpuMiner
    private listCallBackNewBlock: (block: Block) => void

    public constructor(server: Server, stratumPort: number) {
        this.server = server

        this.stratumServer = new StratumServer(this, stratumPort)
        this.cpuMiner = new CpuMiner(this, Server.globalOptions.cpuMiners)
    }

    public newCandidateBlock(candidateBlock: Block): void {
        if (Server.syncOnly) { return }
        const prehash = candidateBlock.header.preHash()
        const difficulty = Difficulty.decode(candidateBlock.header.difficulty)
        const minersCount = this.getMinersCount()

        logger.info(`New Candidate Block Hash: ${new Hash(candidateBlock).toString()}, Difficulty: 0x${difficulty.getMantissa().toString(16)} e${difficulty.getExponent()} Target: ${difficulty.getMinerTarget()}`)
        this.cpuMiner.putWork(candidateBlock, prehash, difficulty)
        this.stratumServer.putWork(candidateBlock, prehash, difficulty, this.cpuMiner.minerCount)
    }
    public submitBlock(block: Block) {
        logger.info(`Mined Block Hash: ${new Hash(block).toString()}`)
        this.stop()
        if (this.listCallBackNewBlock !== undefined) {
            this.listCallBackNewBlock(block)
        }
    }
    public stop(): void {
        this.cpuMiner.stop()
        this.stratumServer.stop()
    }
    public addCallbackNewBlock(callback: (block: Block) => void, priority?: number): void {
        this.listCallBackNewBlock = callback
    }
    public removeCallbackNewBlock(callback: (block: Block) => void): void {
        this.listCallBackNewBlock = undefined
    }

    private getMinersCount(): number {
        const miners = this.stratumServer.getMinerCount() + this.cpuMiner.minerCount
        return miners
    }
}
