import { getLogger } from "log4js"
import Long = require("long")
import { Block } from "../common/block"
import { Difficulty } from "../consensus/difficulty"
import { Hash } from "../util/hash"
import { MinerServer } from "./minerServer"
const logger = getLogger("CpuMiner")

interface IAsyncCpuMiner {
    nonce: Promise<Long>
    inspect: () => number
    stop: () => Promise<void | number>
}

export class CpuMiner {
    public static mine(preHash: Uint8Array, difficulty: Difficulty, prefix: number, currentNonce: number = 0, maxNonce: number = 0xFFFFFFFF): IAsyncCpuMiner {
        let calculate = true
        const nonce = new Promise<Long>(async (resolve, reject) => {
            try {
                const buffer = new Buffer(72)
                const preHashBuf: any = preHash // Typescript's type defs are out of date
                buffer.copy(preHashBuf, 0, 0, 64)
                buffer.writeUInt32LE(prefix, 64)

                while (currentNonce < maxNonce && calculate) {
                    buffer.writeUInt32LE(currentNonce, 68)
                    if (difficulty.acceptable(await Hash.hashCryptonight(buffer))) {
                        const low = buffer.readInt32LE(64)
                        const high = buffer.readInt32LE(68)
                        resolve(Long.fromBits(low, high, true))
                        return
                    }
                    currentNonce++
                }
                reject(currentNonce)
            } catch (e) {
                reject(new Error(`CPU Miner failed: ${e}`))
            }
        })

        return {
            inspect: () => currentNonce,
            nonce,
            stop: async () => {
                calculate = false
                try {
                    await nonce
                    return currentNonce
                } catch (e) {
                    if (typeof e === "number" && e < 0xFFFFFFFF) {
                        return e
                    }
                }
            },
        }
    }

    public minerCount: number
    private miners: IAsyncCpuMiner[]
    private minerServer: MinerServer

    constructor(minerServer: MinerServer, minerCount: number = 0) {
        logger.debug(`CPU Miner`)
        this.minerServer = minerServer
        this.minerCount = minerCount
        this.miners = []
        setInterval(() => this.hashRate(), 10000)
    }

    public hashRate() {
        const startingNonces = this.miners.map((m) => m.inspect())
        setTimeout(() => {
            const endingNonces = this.miners.map((m) => m.inspect())
            let hashCount = 0
            for (let i = 0; i < Math.min(endingNonces.length, startingNonces.length); i++) {
                const delta = endingNonces[i] - startingNonces[i]
                hashCount += Math.max(delta, 0)
            }
            if (hashCount > 0) {
                logger.info(`CPU Hashrate: ${hashCount} H/s`)
            }
        }, 1000)
    }

    public async stop() {
        const promises: Array<Promise<number | void>> = []
        for (const miner of this.miners) {
            promises.push(miner.stop())
        }
        await Promise.all(promises)
    }

    public async putWork(block: Block, prehash: Uint8Array, difficulty: Difficulty) {
        await this.stop()
        this.miners = []
        for (let i = 0; i < this.minerCount; i++) {
            const miner = CpuMiner.mine(prehash, difficulty, i)
            miner.nonce.then((nonce) => {
                const minedBlock = new Block(block)
                minedBlock.header.nonce = nonce
                this.minerServer.submitBlock(minedBlock)
            }).catch(() => { })
            this.miners.push(miner)
        }
    }
}
