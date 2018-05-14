import * as bigInt from "big-integer"
import { getLogger } from "log4js"
import Long = require("long")
import { Address } from "../common/address"
import { AsyncLock } from "../common/asyncLock"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { PublicKey } from "../common/publicKey"
import { GenesisSignedTx } from "../common/txGenesisSigned"
import { TxPool } from "../common/txPool"
import { SignedTx } from "../common/txSigned"
import { CpuMiner } from "../miner/cpuMiner"
import { MinerServer } from "../miner/minerSever"
import { Server } from "../server"
import * as utils from "../util/difficulty"
import { Graph } from "../util/graph"
import { Hash } from "../util/hash"
import { Account } from "./database/account"
import { Database } from "./database/database"
import { DBBlock } from "./database/dbblock"
import { TxDatabase } from "./database/txDatabase"
import { TxList } from "./database/txList"
import { IStateTransition, WorldState } from "./database/worldState"
import { AnySignedTx, IConsensus, NewBlockCallback } from "./iconsensus"
import { BlockStatus } from "./sync"

const logger = getLogger("SingleChain Concensus")
export class SingleChain implements IConsensus {
    private server: Server
    private newBlockCallbacks: NewBlockCallback[]
    private db: Database
    private worldState: WorldState
    private blockTip: DBBlock
    private headerTip: DBBlock
    private txUnit: number
    private graph: Graph // For debug
    private txdb?: TxDatabase
    constructor(server: Server, dbPath: string, wsPath: string, filePath: string, txPath?: string) {
        this.server = server
        this.newBlockCallbacks = []
        this.db = new Database(dbPath, filePath)
        this.worldState = new WorldState(wsPath)
        this.txUnit = 1000
        this.graph = new Graph()
        if (txPath) { this.txdb = new TxDatabase(txPath) }
    }
    public async getNonce(address: Address): Promise<number> {
        const account = await this.worldState.getAccount(this.blockTip.header.stateRoot, address)
        //  logger.info(`Found account(${address.toString()}): {balance: ${account.balance}, nonce: ${account.nonce}}`)
        return account.nonce
    }

    public async init(): Promise<void> {
        try {
            await this.db.init()
            this.blockTip = await this.db.getBlockTip()
            this.headerTip = await this.db.getHeaderTip()

            if (this.blockTip === undefined) {
                const genesis = await this.initGenesisBlock()
                this.graph.initGraph(genesis.header)
            }

            this.headerTip = await this.db.getHeaderTip()
            if (this.headerTip === undefined || this.blockTip === undefined) {
                throw new Error("Could not initialize DB with genesis block")
            }

            if (this.txdb) {
                // TODO : TxDB Init
            }

            this.server.txPool.onTopTxChanges(10, (txs: SignedTx[]) => this.createCandidateBlock(txs))
            this.server.miner.addCallbackNewBlock((block: Block) => this.putBlock(block))
            logger.debug(`Initialization of singlechain is over.`)
        } catch (e) {
            logger.error(`Initialization fail in singleChain : ${e}`)
            process.exit(1)
        }
    }
    public async putBlock(block: Block): Promise<boolean> {
        try {
            const blockHash = new Hash(block.header)
            logger.info(`Put Block : ${blockHash}`)

            const blockStatus = await this.getBlockStatus(blockHash)
            if (blockStatus === BlockStatus.Rejected) {
                logger.warn(`Already rejected Block : ${blockHash}`)
                return false
            } else if (blockStatus === BlockStatus.MainChain || blockStatus === BlockStatus.Block) {
                logger.warn(`Already exsited Header : ${blockHash}`)
                return false
            }

            const previousHeader = await this.db.getBlockHeader(block.header.previousHash[0])
            if (previousHeader === undefined) {
                logger.info(`Previous Header not Found`)
                return false
            }

            const verifyResult = await this.verifyBlock(block, previousHeader)
            if (!verifyResult.isVerified) {
                logger.error(`Invalid Block Rejected : ${blockHash}`)
                this.server.sync.onPreviousNotFound(new Hash(previousHeader))
                await this.db.setBlockStatus(blockHash, BlockStatus.Rejected)
                return false
            }

            const transitionResult = verifyResult.stateTransition
            await this.worldState.putPending(transitionResult.batch, transitionResult.mapAccount)
            const { current, previous } = await this.db.putBlock(blockHash, block)
            if (this.txdb) { await this.txdb.putTxs(blockHash, block.txs) }

            await this.organizeChains(blockHash, current, block, this.txUnit)

            return true
        } catch (e) {
            logger.error(e)
            return false
        }
    }

    public async putHeader(header: BlockHeader): Promise<boolean> {
        try {
            const blockHash = new Hash(header)
            const blockStatus = await this.getBlockStatus(new Hash(header))
            if (blockStatus === BlockStatus.Rejected) {
                logger.warn(`Already rejected Block : ${blockHash}`)
                return false
            } else if (blockStatus === BlockStatus.MainChain || blockStatus === BlockStatus.Block || blockStatus === BlockStatus.Header) {
                logger.warn(`Already exsited Header : ${blockHash}`)
                return false
            }

            if (!await this.verifyHeader(header)) {
                logger.error(`Invalid Header Rejected : ${blockHash}`)
                await this.db.setBlockStatus(blockHash, BlockStatus.Rejected)
                return false
            }

            const { current, previous } = await this.db.putHeader(blockHash, header)
            await this.organizeChains(blockHash, current)

            return true
        } catch (e) {
            logger.error(`Fail to putHeader in SingleChain : ${e}`)
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
            return header
        } catch (e) {
            logger.error(`Fail to getHeaderByHash : ${e}`)
            Promise.reject(e)
        }
    }

    public getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]> {
        try {
            const blockArray = this.db.getBlocksRange(fromHeight, count)
            return blockArray
        } catch (e) {
            logger.error(`Fail to getBlocksRange : ${e}`)
            Promise.reject(e)
        }
    }

    public async getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]> {
        return await this.db.getHeadersRange(fromHeight, count)
    }

    public async getAccount(address: Address): Promise<Account> {
        try {
            if (this.blockTip !== undefined) {
                const account = await this.worldState.getAccount(this.blockTip.header.stateRoot, address)
                return account
            } else {
                logger.error(`There is not any tips`)
                return Promise.reject(`There is not any tips`)
            }
        } catch (e) {
            logger.error(`Fail to getAccount : ${e}`)
            return Promise.reject(e)
        }
    }

    public async getLastTxs(address: Address, count?: number): Promise<TxList[]> {
        try {
            if (this.txdb) {
                return await this.txdb.getLastTxs(address, count)
            } else {
                return Promise.reject(`The database to get txs does not exist.`)
            }
        } catch (e) {
            return Promise.reject(`Fail to get Last txs : ${e}`)
        }
    }

    public getBlockStatus(hash: Hash): Promise<BlockStatus> {
        return this.db.getBlockStatus(hash)
    }
    public getHeaderTip(): { hash: Hash; height: number } {
        const block = this.headerTip
        return { hash: new Hash(block.header), height: block.height }
    }
    public getBlocksTip(): { hash: Hash; height: number } {
        const block = this.blockTip
        return { hash: new Hash(block.header), height: block.height }
    }

    public async isTxValid(tx: SignedTx): Promise<boolean> {
        // TODO : Check existence in DB.
        return true
    }

    public async getTx(hash: Hash): Promise<TxList | undefined> {
        if (this.txdb) {
            return await this.txdb.getTx(hash)
        } else {
            logger.error(`User not use txDatabase for RestAPI`)
            return undefined
        }
    }
    public async getHash(height: number): Promise<Hash> {
        return await this.db.getHashAtHeight(height)
    }

    public async testMakeBlock(txs: SignedTx[]): Promise<Block> {
        return await this.createCandidateBlock(txs)
    }

    private newBlock(block: AnyBlock): void {
        for (const callback of this.newBlockCallbacks) {
            callback(block)
        }
    }

    private async initGenesisBlock(): Promise<GenesisBlock> {
        try {
            const genesis = GenesisBlock.loadFromFile()
            let genesisHash = new Hash(genesis.header)
            const transition = await this.worldState.first(genesis)
            await this.worldState.putPending(transition.batch, transition.mapAccount)
            genesis.header.stateRoot = transition.currentStateRoot
            // Test wallets
            const testWalletTransition = await this.worldState.createTestAddresses(transition.currentStateRoot)
            await this.worldState.putPending(testWalletTransition.batch, testWalletTransition.mapAccount)
            genesis.header.stateRoot = testWalletTransition.currentStateRoot
            await this.worldState.print(testWalletTransition.currentStateRoot)
            genesisHash = new Hash(genesis.header)
            const { current } = await this.db.putBlock(genesisHash, genesis)
            const block = await this.db.getBlockHeader(genesisHash)
            this.headerTip = current
            this.blockTip = current
            await this.db.setBlockStatus(genesisHash, BlockStatus.MainChain)
            await this.db.setHashAtHeight(0, genesisHash)
            await this.db.setHeaderTip(genesisHash)
            await this.db.setBlockTip(genesisHash)
            if (this.txdb) {
                await this.txdb.putTxs(genesisHash, genesis.txs)
            }
            return genesis
        } catch (e) {
            logger.error(`Fail to initGenesisBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    // tslint:disable-next-line:max-line-length
    private updateTopTip(tip: DBBlock, block: DBBlock, previous?: DBBlock): { newTip: DBBlock, prevTip: Hash | undefined, isTopTip: boolean } {
        try {
            let prevTip
            let isTopTip = false
            if (block.header instanceof BlockHeader) {
                if (previous) {
                    const previousHash = block.header.previousHash[0].toString()
                    const tipHash = new Hash(tip.header)
                    if (tipHash.toString() === previousHash || tip.height < block.height) {
                        prevTip = tipHash
                        tip = block
                        isTopTip = true
                    } else {
                        // TODO : Change reorg logic.
                    }
                } else {
                    throw new Error(`Previous block undefined in updateTopTip`)
                }
            } else {
                tip = block
                isTopTip = true
            }
            return { newTip: tip, prevTip, isTopTip }
        } catch (e) {
            logger.error(`Fail to updateTopTip : ${e}`)
            throw new Error(e)
        }
    }
    private async createCandidateBlock(txs: SignedTx[]): Promise<Block> {
        try {
            const previousHash = new Hash(this.blockTip.header)
            // TODO : get Miner address -> If miner is undefined, occur error
            const miner: Address = undefined
            const previousHeader = await this.db.getBlockHeader(previousHash)
            txs.sort((txA, txB) => txA.nonce - txB.nonce)
            const worldStateResult = await this.worldState.next(txs, previousHeader.stateRoot, miner)
            const header = new BlockHeader({
                difficulty: utils.getTargetDifficulty(),
                merkleRoot: new Hash(),
                nonce: -1,
                previousHash: [previousHash],
                stateRoot: worldStateResult.stateTransition.currentStateRoot,
                timeStamp: Date.now(),
            })
            const newBlock = new Block({ header, txs: worldStateResult.validTxs, miner })
            newBlock.updateMerkleRoot()

            if (!await this.verifyPreBlock(newBlock, previousHeader)) { throw new Error("Not verified.") }
            this.server.miner.newCandidateBlock(newBlock)
            return newBlock
        } catch (e) {
            logger.error(`Fail to createCandidateBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    private async verifyBlock(block: Block, previousHeader: AnyBlockHeader): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        const isValidHeader = await this.verifyHeader(block.header)
        if (!isValidHeader) {
            logger.warn(`Invalid header`)
            return { isVerified: false }
        }

        const verifyResult = await this.verifyPreBlock(block, previousHeader)
        if (!verifyResult.isVerified) {
            return { isVerified: false }
        }

        return verifyResult
    }

    private async verifyPreBlock(block: Block, previousHeader: AnyBlockHeader): Promise<{ isVerified: boolean, stateTransition?: IStateTransition }> {
        const txVerify = block.txs.every((tx) => verifyTx(tx))
        if (!txVerify) { return { isVerified: false } }

        const merkleRootVerify = block.calculateMerkleRoot().equals(block.header.merkleRoot)
        if (!merkleRootVerify) {
            logger.warn(`Invalid merkleRoot`)
            return { isVerified: false }
        }
        const { stateTransition, validTxs, invalidTxs } = await this.worldState.next(block.txs, previousHeader.stateRoot, block.miner)
        if (!stateTransition.currentStateRoot.equals(block.header.stateRoot)) {
            logger.warn(`State root is incorrect`)
            return { isVerified: false }
        }
        if (invalidTxs.length > 0) {
            logger.warn(`Block contains invalid Txs`)
            return { isVerified: false }
        }

        if (validTxs.length !== block.txs.length) {
            logger.warn(`Not all txs were valid`)
            return { isVerified: false }
        }

        return { isVerified: true, stateTransition }
    }

    private async verifyHeader(header: BlockHeader): Promise<boolean> {
        const preHash = header.preHash()
        const cryptoHash = await CpuMiner.hash(preHash, header.nonce.toString(16))
        const difficulty = header.difficulty
        const bufTarget = Buffer.from(utils.difficulty(utils.unforcedInt(difficulty)), "hex")
        const target = new Uint8Array(bufTarget).subarray(0, MinerServer.LEN_TARGET)

        if ((cryptoHash[0] < target[0]) || ((cryptoHash[0] === target[0]) && (cryptoHash[1] < target[1]))) {
            return true
        }
        logger.warn(`Fail to verifyHeader with difficulty nonce.`)
        return false
    }

    private async organizeChains(newBlockHash: Hash, dbBlock: DBBlock, block?: Block, txCount: number = 0): Promise<void> {
        logger.info(`Reorg logic should be implemented`)

        if (this.headerTip === undefined || this.headerTip.height < dbBlock.height) {
            this.headerTip = dbBlock
            await this.db.setHeaderTip(newBlockHash)
        }

        if (block !== undefined) {
            if (this.blockTip === undefined || this.blockTip.height < dbBlock.height) {
                const txs = await this.reorganize(newBlockHash, block, dbBlock.height, txCount)
                this.blockTip = dbBlock // TODO: Reorganize first
                await this.db.setBlockTip(newBlockHash)
                utils.processBlock(dbBlock.header.difficulty)
                this.createCandidateBlock(txs)
            } else {
                await this.db.setBlockStatus(newBlockHash, BlockStatus.Block)
                this.graph.addToGraph(block.header, BlockStatus.Block)
            }
        } else {
            await this.db.setBlockStatus(newBlockHash, BlockStatus.Header)
            this.graph.addToGraph(block.header, BlockStatus.Header)
        }
    }

    private async reorganize(newBlockHash: Hash, newBlock: Block, newBlockHeight: number, txCount: number): Promise<SignedTx[]> {
        const newBlockHashes: Hash[] = []
        const newBlocks: Block[] = []
        let popStopHeight = newBlockHeight
        let hash = newBlockHash
        let block: Block = newBlock
        while (popStopHeight > 0) {
            newBlockHashes.push(hash)
            newBlocks.push(block)

            hash = block.header.previousHash[0]
            if (await this.getBlockStatus(hash) === BlockStatus.MainChain) {
                break
            }
            const tmpBlock = await this.db.getBlock(hash)
            if (!(tmpBlock instanceof Block)) {
                throw new Error("Error trying to reorganize past the genesis block")
            }
            block = tmpBlock
            popStopHeight -= 1
        }

        let popHeight = this.blockTip.height
        let popHash = new Hash(this.blockTip.header)
        while (popHeight >= popStopHeight) {
            const popBlock = await this.db.getBlock(popHash)
            if (!(popBlock instanceof Block)) {
                throw new Error("Error trying to reorganize past the genesis block")
            }
            await this.db.setBlockStatus(popHash, BlockStatus.Block)
            this.graph.addToGraph(block.header, BlockStatus.Block)
            this.server.txPool.putTxs(popBlock.txs)
            popHash = popBlock.header.previousHash[0]
            popHeight -= 1
        }

        if (newBlocks.length !== newBlockHashes.length) {
            throw new Error("Error during reorganization")
        }

        let txs: SignedTx[] = []
        let pushHeight = popStopHeight
        while (newBlockHashes.length > 0) {
            hash = newBlockHashes.pop()
            await this.db.setBlockStatus(hash, BlockStatus.MainChain)
            this.graph.addToGraph(block.header, BlockStatus.MainChain)
            await this.db.setHashAtHeight(pushHeight, hash)
            pushHeight += 1
            block = newBlocks.pop()
            txs = this.server.txPool.updateTxs(block.txs, newBlockHashes.length > 0 ? 0 : txCount)
            this.newBlock(block)
        }
        return txs
    }
}

export function verifyTx(tx: SignedTx | GenesisSignedTx): boolean {
    try {
        const pubKey = new PublicKey(tx)
        if (!pubKey.verify(tx)) { return false }
        return true
    } catch (e) { return false }
}
