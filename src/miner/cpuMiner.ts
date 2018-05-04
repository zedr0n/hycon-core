import { getLogger } from "log4js"
import Long = require("long")
import { zeroPad } from "../util/commonUtil"
import { Hash } from "../util/hash"
import { MinerServer } from "./minerSever"
const logger = getLogger("CpuMiner")

export class CpuMiner {
    private minerServer: MinerServer
    private prehash: Uint8Array | undefined
    private target: Uint8Array | undefined
    private nonce: Long | undefined
    private lastNonce: Long | undefined

    private isMining: boolean

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
            if (this.prehash === undefined || this.target === undefined || this.isMining === false) {
                await sleep(1000)
            } else {
                this.nonce = Long.UZERO

                while (this.nonce.compare(this.lastNonce)) {
                    const result = await CpuMiner.hash(this.prehash, this.nonce.toString(16))

                    if ( (result[0] < this.target[0]) || ( (result[0] === this.target[0]) && (result[1] < this.target[1]) ) ) {
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
            bufBlock.set(new Uint8Array(prehash).reverse())

            // set nonce
            const strNonce = (nonce.length >= MinerServer.LEN_NONCE) ? nonce : new Array(MinerServer.LEN_NONCE - nonce.length + 1).join("0") + nonce
            const bufNonce = new Uint8Array(Buffer.from(strNonce, "hex"))
            bufBlock.set(bufNonce.reverse(), prehash.length)

            // run hash
            const ret = Hash.hashCryptonight(bufBlock)
            return Promise.resolve(ret)

        } catch (e) {
            logger.error(`Fail to hash in Miner : ${e}`)
            return Promise.reject(e)
        }
    }

    public putWork(prehash: Uint8Array, target: Uint8Array, lastNonce: Long) {
        this.prehash = prehash
        this.target = target
        this.nonce = Long.UZERO
        this.lastNonce = lastNonce
    }

    private init() {
        this.prehash = undefined
        this.target = undefined
        this.nonce = undefined
        this.lastNonce = undefined
    }
}

function sleep(ms = 0) {
    return new Promise((r) => setTimeout(r, ms))
}
