import { IMiner } from "./miner"
import { CpuMiner } from "./cpuMiner"
import { StratumServer } from "./stratumServer"
import { Block } from "../common/block"
import * as util from '../util/miningUtil'
import * as bigInteger from 'big-integer'
type BigInteger = bigInteger.BigInteger
import { getLogger } from 'log4js'
import { Hash } from "../util/hash";
const logger = getLogger('Miner')

// TODO 
type StateTransition = any

export class MinerServer implements IMiner{
    
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
    public static useCpuMiner: boolean = true
    private stratumServer: StratumServer
    private cpuMiner: CpuMiner
    private block: Block | undefined
    private prehash: Uint8Array | undefined
    private stateTransition: StateTransition| undefined
    private target: Uint8Array
    private listCallBackNewBlock: Function[]

    public constructor() {
        this.init()

        this.stratumServer = new StratumServer(this)
        if(MinerServer.useCpuMiner) {
            this.cpuMiner = new CpuMiner(this)
        }
    }

    public newCandidateBlock(candidateBlock: Block, stateTransition: StateTransition): void {
        logger.info(`Send candidate block to miner : ${candidateBlock.header.preHash().toString()}`)
        
        // check same block
        const hash = candidateBlock.header.preHash()
        if(this.prehash === hash) {
            logger.debug(`Receive same block`)
            return
        }
        this.block = candidateBlock
        this.prehash = hash
        this.stateTransition = stateTransition

        // set Target
        const target = candidateBlock.header.difficulty
        const bufTarget = Buffer.from(util.difficulty(util.unforcedInt(target)), 'hex')
        this.target = new Uint8Array(bufTarget).subarray(0, MinerServer.LEN_TARGET)

        // check miner count
        const jobUnit = this.calculateJobUnit()

        // notify cpuminer and stratum server
        if(MinerServer.useCpuMiner) {
            this.cpuMiner.putWork(this.prehash, this.target, jobUnit)
        }
        this.stratumServer.putWork(this.prehash, this.target, jobUnit)
    }
    public async submitNonce(nonce: string): Promise<boolean> {
        if(this.block && this.prehash && this.stateTransition) {
            if(!(await this.checkNonce(nonce))) {
                logger.info(`Fail to search nonce !!! - PREHASH : ${this.prehash}   NONCE : ${nonce}`)
                return false
            }

            logger.info(`Success to search nonce !!! - PREHASH : ${this.prehash}   NONCE : ${nonce}`)

            this.block.header.nonce = bigInteger(nonce, 16)

            // TODO Server.trackIncomingBlock()
            this.listCallBackNewBlock[0](this.block, this.stateTransition)

            this.stop()

            return Promise.resolve(true)
        } else {
            return Promise.reject(false)
        }
    }
    public start(): void {
        this.init()

        if(MinerServer.useCpuMiner) {
            this.cpuMiner.start()
        }
        this.stratumServer.start()
    }
    public stop(): void {
        this.init()
        
        if(MinerServer.useCpuMiner) {
            this.cpuMiner.stop()
        }
        this.stratumServer.stop()
    }
    public addCallbackNewBlock(callback: (block: any) => void, priority?: number): void {
        this.listCallBackNewBlock.push(callback);
    }
    public removeCallbackNewBlock(callback: (block: any) => void): void {
        this.listCallBackNewBlock.pop()
    }

    private init() {
        this.block = undefined
        this.prehash = undefined
        this.stateTransition = undefined
        this.target = undefined
    }

    private async checkNonce(nonce: string): Promise<boolean> {
        try{
            if(this.prehash === undefined) {
                return Promise.resolve(false)
            }

            const result = await CpuMiner.hash(this.prehash, nonce)
            if( (result[0] < this.target[0] || ((result[0] == this.target[0]) && (result[1] < this.target[1])))) {
                logger.debug(`HASH : ${result}`)
                return Promise.resolve(true)
            } else {
                return Promise.resolve(true)
            }
        } catch(e) {
            return Promise.reject(`Fail to check nonce !!! : ${e}`)
        }
    }

    private calculateJobUnit(): bigInt.BigInteger {
        
        let miners = this.stratumServer.getMinerCount() + (MinerServer.useCpuMiner ? 1 : 0)
        let maxNonce = bigInteger('FFFFFFFFFFFFFFFF', 16)
        let unit = maxNonce.divide(miners)
        return unit
    }
}