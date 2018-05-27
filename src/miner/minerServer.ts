import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { IConsensus } from "../consensus/iconsensus"
import { INetwork } from "../network/inetwork"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"
import { CpuMiner } from "./cpuMiner"
import { StratumServer } from "./stratumServer"

const logger = getLogger("Miner")

export class MinerServer {
    public static async checkNonce(preHash: Uint8Array, nonce: Long, difficulty: Difficulty): Promise<boolean> {
        const buffer = Buffer.allocUnsafe(72)
        buffer.fill(preHash, 0, 64)
        buffer.writeUInt32LE(nonce.getLowBitsUnsigned(), 64)
        buffer.writeUInt32LE(nonce.getHighBitsUnsigned(), 68)
        return difficulty.acceptable(await Hash.hashCryptonight(buffer))
    }

    private consensus: IConsensus
    private network: INetwork
    private stratumServer: StratumServer
    private cpuMiner: CpuMiner

    public constructor(consensus: IConsensus, network: INetwork, cpuMiners: number, stratumPort: number) {
        this.consensus = consensus
        this.network = network
        this.stratumServer = new StratumServer(this, stratumPort)
        this.cpuMiner = new CpuMiner(this, cpuMiners)
        this.consensus.on("candidate", (block: Block) => this.candidate(block))
    }

    public async submitBlock(block: Block) {
        this.stop()
        if (await this.consensus.putBlock(block)) {
            this.network.broadcastBlocks([block])
        }
    }
    public stop(): void {
        this.cpuMiner.stop()
        this.stratumServer.stop()
    }
    private candidate(block: Block): void {
        const prehash = block.header.preHash()
        const difficulty = Difficulty.decode(block.header.difficulty)
        logger.info(`New Candidate Block Hash: ${new Hash(block).toString()}, Difficulty: 0x${difficulty.getMantissa().toString(16)} e${difficulty.getExponent()} Target: ${difficulty.getMinerTarget()}`)
        this.cpuMiner.putWork(block, prehash, difficulty)
        this.stratumServer.putWork(block, prehash, difficulty, this.cpuMiner.minerCount)
    }
}
