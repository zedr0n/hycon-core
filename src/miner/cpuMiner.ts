import * as bigInteger from 'big-integer'
type BigInteger = bigInteger.BigInteger
import { MinerServer } from "./minerSever"
import { Hash } from "../util/hash"
import { getLogger } from 'log4js'
const logger = getLogger('CpuMiner')

export class CpuMiner {
    private minerServer: MinerServer
    private prehash: Uint8Array | undefined
    private target: Uint8Array | undefined
    private nonce: BigInteger | undefined
    private lastNonce: BigInteger | undefined

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
        while(true) {
            if(this.prehash === undefined || this.target === undefined || this.isMining === false) {
                await sleep(1000)
            } else {
                this.nonce = bigInteger(0)

                while(this.nonce.compare(this.lastNonce)) {
                    const result = await CpuMiner.hash(this.prehash, this.nonce.toString(16))

                    if( (result[0] < this.target[0]) || ( (result[0] == this.target[0]) && (result[1] < this.target[1]) ) ) {
                        logger.debug(`>>>>>>>>Submit nonce : ${this.nonce.toString(16)}`)
                        this.minerServer.submitNonce(this.nonce.toString(16))
                    }

                    this.nonce = this.nonce.add(1)
                }

                this.isMining = false
            }
        }
    }

    public static async hash(prehash: Uint8Array, nonce: string): Promise<Uint8Array> {
        try {
            const bufBlock = new Uint8Array(MinerServer.LEN_BLOB)
            
            // set prehash
            bufBlock.set(prehash)

            // set nonce
            const strNonce = (nonce.length >= MinerServer.LEN_NONCE) ? nonce : new Array(MinerServer.LEN_NONCE - nonce.length + 1).join('0') + nonce;
            let bufNonce = new Uint8Array(Buffer.from(strNonce, 'hex'))
            bufBlock.set(bufNonce.reverse(), prehash.length)

            // run hash
            const ret = Hash.hashCryptonight(bufBlock)
            return Promise.resolve(ret)

        } catch(e) {
            logger.error(`Fail to hash in Miner : ${e}`)
            return Promise.reject(e)
        }
    }

    public putWork(prehash: Uint8Array, target: Uint8Array, lastNonce: BigInteger) {
        this.prehash = prehash
        this.target = target
        this.nonce = bigInteger(0)
        this.lastNonce = lastNonce
    }

    private init(){
        this.prehash = undefined
        this.target = undefined
        this.nonce = undefined
        this.lastNonce = undefined
    }
}

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}