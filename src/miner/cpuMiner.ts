import { getLogger } from "log4js"
import Long = require("long")
import { Difficulty } from "../consensus/difficulty"
import { zeroPad } from "../util/commonUtil"
import { Hash } from "../util/hash"
import { MinerServer } from "./minerSever"
const logger = getLogger("CpuMiner")

export class CpuMiner {
    private minerServer: MinerServer
    private prehash: Uint8Array | undefined
    private difficulty: Difficulty | undefined
    private nonce: Long | undefined
    private lastNonce: Long | undefined
    private isMining: boolean

    private wakeup: () => void

    constructor(minerServer: MinerServer) {
        logger.debug(`CPU Miner`)
        this.minerServer = minerServer
        this.isMining = false

        this.mine()
    }

    public start() {
        this.init()
        this.isMining = true
    }

    public stop() {
        this.init()
        this.isMining = false
    }

    public async mine() {
        while (true) {
            if (this.prehash === undefined || this.difficulty === undefined || this.isMining === false) {
                await new Promise<void>((resolve) => {this.wakeup = resolve})
            } else {
                this.nonce = Long.UZERO

                while (this.nonce !== undefined && this.nonce.compare(this.lastNonce)) {
                    const result = await CpuMiner.hash(this.prehash, this.nonce.toString(16))
                    if (this.difficulty === undefined) {
                        logger.info(`Already mined block`)
                        break
                    }

                    if ( ! (this.difficulty.greaterThan(result) ) ) {
                        logger.debug(`>>>>>>>>Submit - nonce : ${zeroPad(this.nonce.toString(16), MinerServer.LEN_HEX_NONCE)} / hash : ${Buffer.from(result.buffer).toString("hex")}`)
                        this.minerServer.submitNonce(this.nonce.toString(16))
                    }
                    this.nonce = this.nonce.add(Long.UONE)
                }
                this.isMining = false
            }
        }
    }

    // tslint:disable-next-line:member-ordering
    public static async hash(prehash: Uint8Array, nonce: string): Promise<Uint8Array> {
        try {
            const bufBlock = new Uint8Array(MinerServer.LEN_BLOB)

            // set prehash
            bufBlock.set(new Uint8Array(prehash))

            // set nonce
            const strNonce = (nonce.length >= MinerServer.LEN_NONCE) ? nonce : new Array(MinerServer.LEN_NONCE - nonce.length + 1).join("0") + nonce
            const bufNonce = new Uint8Array(Buffer.from(strNonce, "hex"))
            bufBlock.set(bufNonce.reverse(), prehash.length)

            // run hash
            const ret = await Hash.hashCryptonight(bufBlock)
            return Promise.resolve(ret)

        } catch (e) {
            logger.error(`Fail to hash in Miner : ${e}`)
            return Promise.reject(e)
        }
    }

    public putWork(prehash: Uint8Array, difficulty: Difficulty, minersCount: number) {
        this.prehash = prehash
        this.difficulty = difficulty
        this.nonce = Long.UZERO
        this.lastNonce = minersCount === 0 ? Long.MAX_UNSIGNED_VALUE : Long.MAX_UNSIGNED_VALUE.divide(minersCount)
        this.wakeup()
    }

    private init() {
        this.prehash = undefined
        this.difficulty = undefined
        this.nonce = undefined
        this.lastNonce = undefined
    }
}
