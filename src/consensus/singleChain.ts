import * as bigInt from "big-integer"
import { getLogger } from "log4js"
import { Address } from "../common/address"
import { AsyncLock } from "../common/asyncLock"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { PublicKey } from "../common/publicKey"
import { TxPool } from "../common/txPool"
import { SignedTx } from "../common/txSigned"
import { Server } from "../server"
import * as utils from "../util/difficulty"
import { Graph } from "../util/graph"
import { Hash } from "../util/hash"
import { Account } from "./database/account"
import { Database } from "./database/database"
import { DBBlock } from "./database/dbblock"
import { IStateTransition, WorldState } from "./database/worldState"
import { IConsensus, NewBlockCallback } from "./iconsensus"
import { BlockStatus } from "./sync"

const logger = getLogger("SingleChain Concensus")
export class SingleChain implements IConsensus {
    private server: Server
    private newBlockCallbacks: NewBlockCallback[]
    private db: Database
    private worldState: WorldState
    private blockTips: DBBlock[]
    private headerTips: DBBlock[]
    private txUnit: number = 1000
    private forkHeight: number
    private graph = new Graph() // For debug

    constructor(server: Server, dbPath: string, wsPath: string, filePath: string) {
        this.server = server
        this.newBlockCallbacks = []
        this.db = new Database(dbPath, filePath)
        this.worldState = new WorldState(wsPath)
        this.blockTips = []
        this.headerTips = []
        this.forkHeight = -1
    }

    public async init(): Promise<void> {
        try {
            await this.db.init()
            const genesis = GenesisBlock.loadFromFile()
            const genesisHash = new Hash(genesis.header)
            const genesisInDB = await this.db.getBlockHeader(genesisHash)
            if (genesisInDB === undefined) {
                const transition = await this.worldState.first(genesis)
                await this.worldState.putPending(transition.batch, transition.mapAccount)
                genesis.header.stateRoot = transition.currentStateRoot
                await this.worldState.print(transition.currentStateRoot)
                await this.putBlock(genesis)
                this.graph.initGraph(genesis.header)
            } else {
                // TODO : Check txDB status.( Init from file ?)
                if (!(new Hash(genesisInDB).equals(genesisHash))) {
                    logger.error(`Genesis in DB and file are not matched.`)
                    return Promise.reject(`Genesis in DB and file are not matched.`)
                }
                const tops = await this.db.getTop()
                this.blockTips = tops
                this.headerTips = tops
            }
            this.server.txPool.onTopTxChanges(10, (txs: SignedTx[]) => this.createCandidateBlock(txs))
            logger.debug(`Initialization of singlechain is over.`)
        } catch (e) {
            logger.error(`Initialization fail in singleChain : ${e}`)
            process.exit(1)
        }
    }

    public async putBlock(block: AnyBlock): Promise<boolean> {
        try {
            // TODO : Check reorganization condition.
            logger.info(`Put Block : ${new Hash(block.header)}`)
            let blockTxs: SignedTx[] = []
            // Have to check db existence before verify(In header verify, calculate cryptonight)????
            if (block instanceof Block) {
                blockTxs = block.txs
                const verifyResult = await this.verifyBlock(block)
                if (!verifyResult.isVerified) { return false }
                const transitionResult = verifyResult.stateTransition
                await this.worldState.putPending(transitionResult.batch, transitionResult.mapAccount)
                this.graph.addToGraph(block.header, this.graph.color.outgoing)
            }
            const { current, currentHash, previous } = await this.db.putBlock(block)

            // Update headerTopTip first, then update blockTopTip
            this.updateTopTip(this.headerTips, current, previous)
            const { prevTip, isTopTip } = this.updateTopTip(this.blockTips, current, previous)
            const txs = this.server.txPool.updateTxs(blockTxs, this.txUnit)

            this.newBlock(block)
            if (isTopTip) { this.createCandidateBlock(txs) }
            return true
        } catch (e) {
            logger.error(e)
        }
        return false
    }
    public async putHeader(header: AnyBlockHeader): Promise<boolean> {
        try {
            // Have to check db existence before verify(In header verify, calculate cryptonight)????
            if (header instanceof BlockHeader) {
                if (!this.verifyHeader(header)) { return Promise.resolve(false) }
            }
            const { current, currentHash, previous } = await this.db.putHeader(header)

            this.updateTopTip(this.headerTips, current, previous)
            return Promise.resolve(true)
        } catch (e) {
            return Promise.reject(e)
        }
    }
    public addCallbackNewBlock(callback: (block: AnyBlock) => void, priority?: number): void {
        if (priority) {
            this.newBlockCallbacks.splice(priority, 0, callback)
        } else {
            this.newBlockCallbacks.push(callback)
        }
    }
    public removeCallbackNewBlock(callback: (block: AnyBlock) => void): void {
        for (let i = 0; i < this.newBlockCallbacks.length;) {
            if (this.newBlockCallbacks[i] === callback) {
                this.newBlockCallbacks.splice(i, 1)
            } else {
                i++
            }
        }
    }
    public async getBlockByHash(hash: Hash): Promise<AnyBlock> {
        try {
            return await this.db.getBlock(hash)
        } catch (e) {
            logger.error(`Fail to getBlockByHash : ${e}`)
            Promise.reject(e)
        }
    }
    public async getHeaderByHash(hash: Hash): Promise<AnyBlockHeader> {
        try {
            const header = await this.db.getBlockHeader(hash)
            if (header === undefined) { return Promise.reject(`Not found header ${hash.toString()}`) }
            return Promise.resolve(header)
        } catch (e) {
            logger.error(`Fail to getHeaderByHash : ${e}`)
            Promise.reject(e)
        }
    }

    public getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]> {
        try {
            const blockArray = this.db.getBlocksRange(fromHeight, count)
            return Promise.resolve(blockArray)
        } catch (e) {
            logger.error(`Fail to getBlocksRange : ${e}`)
            Promise.reject(e)
        }
    }

    public async getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]> {
        try {
            if (this.forkHeight < fromHeight) { return Promise.resolve([]) }
            const dbBlocks = await this.db.getDBBlocksRange(fromHeight, count)
            if (this.forkHeight === -1) {
                const headers = []
                for (const dbBlock of dbBlocks) {
                    headers.push(dbBlock.header)
                }
                return Promise.resolve(headers)
            } else {
                const toHeight = this.forkHeight - 1
                const headers = []
                for (const dbBlock of dbBlocks) {
                    if (dbBlocks[dbBlocks.length - 1].height <= toHeight) {
                        headers.push(dbBlock.header)
                    }
                }
                return Promise.resolve(headers)
            }
        } catch (e) {
            logger.error(`Fail to getHeadersRange : ${e}`)
            Promise.reject(e)
        }
    }

    public async getAccount(address: Address): Promise<Account> {
        try {
            if (this.blockTips.length > 0) {
                const account = await this.worldState.getAccount(this.blockTips[0].header.stateRoot, address)
                return Promise.resolve(account)
            } else {
                logger.error(`There is not any tips`)
                return Promise.reject(`There is not any tips`)
            }
        } catch (e) {
            logger.error(`Fail to getAccount : ${e}`)
            return Promise.reject(e)
        }
    }

    public getLastTxs(address: Address, count?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }

    public getBlockStatus(hash: Hash): Promise<BlockStatus> {
        return this.db.getBlockStatus(hash)
    }
    public getHeaderTip(): { hash: Hash; height: number } {
        const block = this.headerTips[0]
        return { hash: new Hash(block.header), height: block.height }
    }
    public getBlocksTip(): { hash: Hash; height: number } {
        const block = this.blockTips[0]
        return { hash: new Hash(block.header), height: block.height }
    }

    public isTxValid(tx: SignedTx): Promise<boolean> {
        // TODO : Check existence in DB.
        return Promise.resolve(true)
    }

    public async testMakeBlock(txs: SignedTx[]): Promise<Block> {
        return Promise.resolve(await this.createCandidateBlock(txs))
    }

    private newBlock(block: AnyBlock): void {
        for (const callback of this.newBlockCallbacks) {
            callback(block)
        }
    }

    // tslint:disable-next-line:max-line-length
    private updateTopTip(tips: DBBlock[], block: DBBlock, previous?: DBBlock): { prevTip: Hash | undefined, isTopTip: boolean } {
        let prevTip
        let isTopTip = false
        if (block.header instanceof BlockHeader) {
            if (previous) {
                const previousHash = block.header.previousHash[0].toString()
                const tipHash = new Hash(tips[0].header)
                if (tipHash.toString() === previousHash || tips[0].height < block.height) {
                    prevTip = tipHash
                    tips.splice(0, 1)
                    tips.unshift(block)
                    isTopTip = true
                } else {
                    if (this.forkHeight === -1) {
                        this.forkHeight = block.height
                    } else {
                        if (this.forkHeight > block.height) { this.forkHeight = block.height }
                    }
                }
            } else {
                throw new Error(`Previous block undefined in updateTopTip`)
            }
        } else {
            tips.push(block)
            isTopTip = true
        }
        return { prevTip, isTopTip }
    }
    private async createCandidateBlock(txs: SignedTx[]): Promise<Block> {
        try {
            const previousHash: Hash[] = []
            for (const tip of this.headerTips) { previousHash.push(new Hash(tip.header)) }
            const difficulty = utils.getTargetDifficulty()
            const header = new BlockHeader({
                difficulty,
                merkleRoot: new Hash(),
                nonce: -1,
                previousHash,
                stateRoot: new Hash(),
                timeStamp: Date.now(),
            })
            // TODO : get Miner address
            const miner = new Address(1)
            const newBlock = new Block({ header, txs, miner })
            newBlock.updateMerkleRoot()
            const previousHeader = await this.db.getBlockHeader(newBlock.header.previousHash[0])
            const newState = await this.worldState.next(newBlock, previousHeader.stateRoot)
            newBlock.header.stateRoot = newState.currentStateRoot

            if (!await this.verifyPreBlock(newBlock)) { throw new Error("Not verified.") }
            // TODO : Send to miner new Block
            return Promise.resolve(newBlock)
        } catch (e) {
            logger.error(`Fail to createCandidateBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    private async verifyHeader(header: BlockHeader): Promise<boolean> {
        try {
            // const cryptonightHash = await Miner.hash(header.preHash(), header.nonce)
            // const diff = utils.unforcedInt(header.difficulty)
            // const hexDifficulty = utils.difficulty(diff)
            // const cryptoHex = Buffer.from(cryptonightHash).toString("hex")
            // if (bigInt(cryptoHex) >= bigInt(hexDifficulty)) {
            //     return Promise.resolve(false)
            // }

            return Promise.resolve(true)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async verifyBlock(block: Block): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        if (!await this.verifyHeader(block.header)) { return Promise.resolve({ isVerified: false }) }

        const verifyResult = await this.verifyPreBlock(block)
        if (!verifyResult.isVerified) { return Promise.resolve({ isVerified: false }) }

        return Promise.resolve(verifyResult)
    }

    private async verifyPreBlock(block: Block): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        const txVerify = block.txs.every((tx) => this.verifyTx(tx))
        if (!txVerify) { return Promise.resolve({ isVerified: false }) }

        const merkleRootVerify = block.calculateMerkleRoot().equals(block.header.merkleRoot)
        if (!merkleRootVerify) { return Promise.resolve({ isVerified: false }) }
        const previousHeader = await this.db.getBlockHeader(block.header.previousHash[0])
        const newState = await this.worldState.next(block, previousHeader.stateRoot)
        if (!newState.currentStateRoot.equals(block.header.stateRoot)) {
            return Promise.resolve({ isVerified: false })
        }

        return Promise.resolve({ isVerified: true, stateTransition: newState })
    }

    private verifyTx(tx: SignedTx): boolean {
        const pubkey = new PublicKey(tx)
        return pubkey.verify(tx)
    }

    private async reorganization(): Promise<void> {
        try {
            logger.debug(`Reorganization Started`)
            if (this.forkHeight === -1) { return Promise.resolve(undefined) }
            const tip = this.blockTips[0]
            const result = await this.db.getDBBlockMapByHeights(this.forkHeight, tip.height)
            const bmap = result.blockMap
            const hmap = result.hashMap

            if (bmap.get(tip.height).length !== 1) {
            } else {
                const mainChain: DBBlock[] = []
                let block = tip
                for (let i = tip.height; i >= this.forkHeight; i--) {
                    mainChain.push(block)
                    const blocks = bmap.get(i)
                    for (let index = 0; index < blocks.length; index++) {
                        if (new Hash(blocks[index].header).equals(new Hash(block.header))) {
                            blocks.splice(index, 1)
                            break
                        }
                    }
                    if (block.header instanceof BlockHeader) { block = hmap.get(block.header.previousHash[0].toString()) }
                }

                for (let i = tip.height - 1; i >= this.forkHeight; i--) {
                    for (const b of bmap.get(i)) {
                        const hash = new Hash(b.header)
                        const blk = await this.getBlockByHash(hash)
                        if (blk instanceof Block) { await this.server.txPool.putTxs(blk.txs) }
                        if (blk instanceof Block) { this.graph.removeFromGraph(blk.header) }
                    }
                }
                for (const b of mainChain) {
                    const blk = await this.getBlockByHash(new Hash(b.header))
                    if (blk instanceof Block) { this.server.txPool.updateTxs(blk.txs, 0) }
                }
                this.forkHeight = -1
            }
        } catch (e) {
            return Promise.reject(`Fail to reorganization : ${e}`)
        }
    }
}
