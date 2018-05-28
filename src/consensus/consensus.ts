import { EventEmitter } from "events"
import fs = require("fs")
import { getLogger } from "log4js"
import { Address } from "../common/address"
import { AsyncLock } from "../common/asyncLock"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { DelayQueue } from "../common/delayQueue"
import { ITxPool } from "../common/itxPool"
import { SignedTx } from "../common/txSigned"
import { globalOptions } from "../main"
import { Hash } from "../util/hash"
import { Account } from "./database/account"
import { Database } from "./database/database"
import { DBBlock } from "./database/dbblock"
import { Tx } from "./database/tx"
import { TxDatabase } from "./database/txDatabase"
import { TxList } from "./database/txList"
import { TxValidity, WorldState } from "./database/worldState"
import { IConsensus, IStatusChange } from "./iconsensus"
import { BlockStatus } from "./sync"
import { Verify } from "./verify"
const logger = getLogger("Consensus")

export class Consensus extends EventEmitter implements IConsensus {
    private txdb?: TxDatabase
    private txPool: ITxPool
    private worldState: WorldState
    private db: Database
    private blockTip: DBBlock
    private headerTip: DBBlock
    private lock: AsyncLock

    private futureBlockQueue: DelayQueue

    constructor(txPool: ITxPool, dbPath: string, wsPath: string, filePath: string, txPath?: string) {
        super()
        this.txPool = txPool
        this.db = new Database(dbPath, filePath)
        if (txPath) { this.txdb = new TxDatabase(txPath) }
        this.worldState = new WorldState(wsPath, txPool)
        this.futureBlockQueue = new DelayQueue(10)
    }

    public async init(): Promise<void> {
        if (this.lock !== undefined) {
            throw new Error("Multiple calls to init")
        }
        this.lock = new AsyncLock(true)
        try {
            await this.db.init()
            this.blockTip = await this.db.getBlockTip()
            this.headerTip = await this.db.getHeaderTip()

            if (this.txdb !== undefined) {
                await this.txdb.init(this, this.blockTip === undefined ? undefined :  this.blockTip.height)
            }

            if (this.blockTip === undefined) {
                const genesis = await this.initGenesisBlock()
            }

            this.txPool.onTopTxChanges(10, (txs: SignedTx[]) => this.createCandidateBlock()) // TODO: move/remove?
            this.createCandidateBlock()
            logger.info(`Initialization of consensus is over.`)
        } catch (e) {
            logger.error(`Initialization failure in consensus: ${e}`)
            process.exit(1)
        } finally {
            this.lock.releaseLock()
        }
    }

    public putBlock(block: Block): Promise<IStatusChange> {
        return this.put(block.header, block)
    }

    public putHeader(header: BlockHeader): Promise<IStatusChange> {
        return this.put(header)
    }

    public getBlockByHash(hash: Hash): Promise<AnyBlock> {
        return this.db.getBlock(hash)
    }
    public async getHeaderByHash(hash: Hash): Promise<AnyBlockHeader | undefined> {
        const dbBlock = await this.db.getDBBlock(hash)
        if (dbBlock === undefined) { return undefined }
        return dbBlock.header
    }
    public async getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]> {
        try {
            const dbblocks = await this.db.getDBBlocksRange(fromHeight, count)
            const blockPromises = dbblocks.map((dbblock) => this.db.dbBlockToBlock(dbblock))
            return Promise.all(blockPromises)
        } catch (e) {
            logger.error(`getBlocksRange failed\n${e}`)
            throw e
        }

    }
    public async getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]> {
        try {
            const dbblocks = await this.db.getDBBlocksRange(fromHeight, count)
            return dbblocks.map((dbblock) => dbblock.header)
        } catch (e) {
            logger.error(`getHeadersRange failed\n${e}`)
            throw e
        }
    }
    public getAccount(address: Address): Promise<Account> {
        if (this.blockTip === undefined) {
            throw new Error(`There is not any tips`)
        }
        return this.worldState.getAccount(this.blockTip.header.stateRoot, address)
    }
    public getLastTxs(address: Address, count?: number) {
        if (this.txdb === undefined) {
            throw new Error(`The database to get txs does not exist.`)
        }
        const result: Array<{tx: Tx}> = []
        const idx: number = 0
        return this.txdb.getLastTxs(address, result, idx, count)
    }

    public async getNextTxs(address: Address, txHash: Hash, count?: number): Promise<Array<{ tx: Tx }>> {
        try {
            if (this.txdb) {
                const result: Array<{tx: Tx}> = []
                const idx: number = 0
                return await this.txdb.getNextTxs(address, txHash, result, idx, count)
            } else {
                return Promise.reject(`The database to get txs does not exist.`)
            }
        } catch (e) {
            logger.error(`Fail to getNextTxs : ${e}`)
            return e
        }
    }
    public getBlockStatus(hash?: Hash): Promise<BlockStatus> {
        if (hash === undefined) {
            return Promise.resolve(BlockStatus.Nothing)
        }
        return this.db.getBlockStatus(hash)
    }
    public getHeaderTip(): { hash: Hash; height: number } {
        return { hash: new Hash(this.headerTip.header), height: this.headerTip.height }
    }
    public getBlocksTip(): { hash: Hash; height: number } {
        return { hash: new Hash(this.blockTip.header), height: this.blockTip.height }
    }
    public txValidity(tx: SignedTx): Promise<TxValidity> {
        return this.worldState.validateTx(this.blockTip.header.stateRoot, tx)
    }
    public getTx(hash: Hash) {
        if (this.txdb === undefined) {
            throw new Error(`The database to get txs does not exist.`)
        }
        return this.txdb.getTx(hash)
    }
    public getHash(height: number): Promise<Hash | undefined> {
        return this.db.getHashAtHeight(height)
    }
    public async getBlockHeight(hash: Hash): Promise<number> {
        const block = await this.db.getDBBlock(hash)
        return (block !== undefined) ? block.height : undefined
    }
    private async put(header: BlockHeader, block?: Block): Promise<IStatusChange> {
        if (header.timeStamp > Date.now()) {
            await this.futureBlockQueue.waitUntil(header.timeStamp)
        }
        return this.lock.critical(async () => {
            const hash = new Hash(header)
            const { oldStatus, status, dbBlock, dbBlockHasChanged } = await this.process(hash, header, block)
            if (status !== undefined && oldStatus !== status) {
                await this.db.setBlockStatus(hash, status)
            }
            if (dbBlockHasChanged) {
                if (dbBlock === undefined) {
                    logger.warn("dbBlock has become undefined")
                } else {
                    await this.db.putDBBlock(hash, dbBlock)
                }

                if (this.headerTip === undefined || dbBlock.totalWork.greaterThan(this.headerTip.totalWork)) {
                    this.headerTip = dbBlock
                    await this.db.setHeaderTip(hash)
                }

                if (block !== undefined && (this.blockTip === undefined || dbBlock.totalWork.greaterThan(this.blockTip.totalWork))) {
                    await this.reorganize(hash, block, dbBlock)
                    await this.db.setBlockTip(hash)
                    this.createCandidateBlock(this.blockTip, hash)
                }

                logger.info(`Put ${block ? "Block" : "Header"}`
                    + ` ${hash}(${dbBlock.height}, ${dbBlock.totalWork.getMantissa()}e${dbBlock.totalWork.getExponent()}),`
                    + ` BTip(${this.blockTip.height}, ${this.blockTip.totalWork.getMantissa()}e${this.blockTip.totalWork.getExponent()}),`
                    + ` HTip(${this.headerTip.height}, ${this.headerTip.totalWork.getMantissa()}e${this.headerTip.totalWork.getExponent()})`)
            }
            return { oldStatus, status }
        })
    }
    private async process(hash: Hash, header: BlockHeader, block?: Block)
        : Promise<{
            oldStatus: BlockStatus,
            status?: BlockStatus,
            dbBlock?: DBBlock,
            dbBlockHasChanged?: boolean,
        }> {
        const oldStatus = await this.db.getBlockStatus(hash)
        let status = oldStatus
        if (oldStatus === BlockStatus.Rejected) {
            return { oldStatus, status }
        }

        if (header.previousHash.length <= 0) {
            logger.warn(`Rejecting block(${hash.toString()}): No previousHash`)
            status = BlockStatus.Rejected
            return { oldStatus, status }
        }

        let dbBlock: DBBlock
        let dbBlockHasChanged = false
        const previousHash = header.previousHash[0]
        const previousDBBlock = await this.db.getDBBlock(previousHash)
        if (previousDBBlock === undefined) {
            return { oldStatus, status }
        }
        if (oldStatus === BlockStatus.Nothing) {
            const headerResult = await Verify.processHeader(previousDBBlock, header, hash)
            status = headerResult.newStatus
            dbBlock = headerResult.dbBlock
            dbBlockHasChanged = true

            if (status === BlockStatus.Rejected) {
                return { oldStatus, status }
            }
        }

        if (block === undefined) {
            return { oldStatus, status, dbBlock, dbBlockHasChanged }
        }

        if (oldStatus === BlockStatus.Nothing || oldStatus === BlockStatus.Header) {
            if (dbBlock === undefined) {
                dbBlock = await this.db.getDBBlock(hash)
            }
            const result = await Verify.processBlock(block, dbBlock, hash, header, previousDBBlock, this.db, this.worldState)
            if (result.newStatus === BlockStatus.Rejected) {
                return { oldStatus, status }
            }
            dbBlockHasChanged = dbBlockHasChanged || result.dbBlockHasChanged
            status = result.newStatus
        }

        return { oldStatus, status, dbBlock, dbBlockHasChanged }

    }

    private async reorganize(newBlockHash: Hash, newBlock: Block, newDBBlock: DBBlock) {
        const newBlockHashes: Hash[] = []
        const newBlocks: Block[] = []
        let popStopHeight = newDBBlock.height
        let hash = newBlockHash
        let block: Block = newBlock
        while (popStopHeight > 0) {
            newBlockHashes.push(hash)
            newBlocks.push(block)

            hash = block.header.previousHash[0]
            if (await this.db.getBlockStatus(hash) === BlockStatus.MainChain) {
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
        const popCount = popHeight - popStopHeight + 1
        if (popCount >= 1) {
            logger.info(`Reorganizing, removing ${popCount} blocks for ${newBlocks.length} new blocks on a longer chain, `
                + `new tip ${newBlockHash.toString()}(${newDBBlock.height}, ${newDBBlock.totalWork.getMantissa()}e${newDBBlock.totalWork.getExponent()}), `
                + `previous tip ${popHash.toString()}(${popHeight}, ${this.blockTip.totalWork.getMantissa()}e${this.blockTip.totalWork.getExponent()}`)
        }

        while (popHeight >= popStopHeight) {
            const popBlock = await this.db.getBlock(popHash)
            if (!(popBlock instanceof Block)) {
                throw new Error("Error trying to reorganize past the genesis block")
            }
            await this.db.setBlockStatus(popHash, BlockStatus.Block)
            this.emit("txs", popBlock.txs)
            this.txPool.putTxs(popBlock.txs)
            popHash = popBlock.header.previousHash[0]
            popHeight -= 1
        }

        if (newBlocks.length !== newBlockHashes.length) {
            throw new Error("Error during reorganization")
        }

        let pushHeight = popStopHeight
        while (newBlockHashes.length > 0) {
            hash = newBlockHashes.pop()
            block = newBlocks.pop()
            await this.db.setBlockStatus(hash, BlockStatus.MainChain)
            await this.db.setHashAtHeight(pushHeight, hash)
            pushHeight += 1
            this.txPool.updateTxs(block.txs, 0)
            if (this.txdb) { await this.txdb.putTxs(hash, block.header.timeStamp, block.txs) }
            this.emit("block", block)
        }

        this.blockTip = newDBBlock
    }

    private async createCandidateBlock(previousDBBlock: DBBlock = this.blockTip, previousHash: Hash = new Hash(previousDBBlock.header)) {
        try {
            const timeStamp = Date.now()
            if (globalOptions.minerAddress === undefined || globalOptions.minerAddress === "") {
                logger.info("Can't mine without miner address")
                return
            }
            const miner: Address = new Address(globalOptions.minerAddress)
            const { stateTransition: { currentStateRoot }, validTxs, invalidTxs } = await this.worldState.next(previousDBBlock.header.stateRoot, miner)
            const newBlock = new Block({
                header: new BlockHeader({
                    difficulty: previousDBBlock.nextDifficulty.encode(),
                    merkleRoot: Block.calculateMerkleRoot(validTxs),
                    miner,
                    nonce: -1,
                    previousHash: [previousHash],
                    stateRoot: currentStateRoot,
                    timeStamp,
                }),
                txs: validTxs,
            })
            this.emit("candidate", newBlock)
        } catch (e) {
            logger.error(`Fail to createCandidateBlock: ${e}`)
            throw e
        }
    }

    private async initGenesisBlock(): Promise<GenesisBlock> {
        try {
            const genesis = GenesisBlock.loadFromFile()
            const transition = await this.worldState.first(genesis)
            await this.worldState.putPending(transition.batch, transition.mapAccount)
            genesis.header.stateRoot = transition.currentStateRoot // TODO: Investigate
            genesis.header.difficulty = 0x08000001
            genesis.header.merkleRoot = new Hash("Centralization is the root of all evil.")
            const genesisHash = new Hash(genesis.header)
            const { fileNumber, length, filePosition, offset } = await this.db.writeBlock(genesis)
            const dbBlock = new DBBlock({ fileNumber, header: genesis.header, height: 0, length, offset, timeEMA: 0, totalWork: 0, nextDifficulty: 0 })
            await this.db.putDBBlock(genesisHash, dbBlock)
            this.blockTip = this.headerTip = dbBlock
            await this.db.setBlockStatus(genesisHash, BlockStatus.MainChain)
            await this.db.setHashAtHeight(0, genesisHash)
            await this.db.setHeaderTip(genesisHash)
            await this.db.setBlockTip(genesisHash)
            if (this.txdb) {
                await this.txdb.putTxs(genesisHash, genesis.header.timeStamp, genesis.txs)
            }
            return genesis
        } catch (e) {
            logger.error(`Fail to initGenesisBlock : ${e}`)
            throw e
        }
    }
}
