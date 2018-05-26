import { EventEmitter } from "events"
import fs = require("fs")
import { stat } from "fs"
import { getLogger } from "log4js"
import { Address } from "../common/address"
import { AsyncLock } from "../common/asyncLock"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { ITxPool } from "../common/itxPool"
import { SignedTx } from "../common/txSigned"
import { IMiner } from "../miner/iminer"
import { MinerServer } from "../miner/minerServer"
import { INetwork } from "../network/inetwork"
import { Hash } from "../util/hash"
import { Account } from "./database/account"
import { BlockFile } from "./database/blockFile"
import { Database } from "./database/database"
import { DBBlock } from "./database/dbblock"
import { TxDatabase } from "./database/txDatabase"
import { TxList } from "./database/txList"
import { TxValidity, WorldState } from "./database/worldState"
import { Difficulty } from "./difficulty"
import { DifficultyAdjuster } from "./difficultyAdjuster"
import { IConsensus, IStatusChange, NewBlockCallback } from "./iconsensus"
import { BlockStatus } from "./sync"
import { Verify } from "./verify"
const logger = getLogger("Consensus")
const conf = JSON.parse(fs.readFileSync("./data/config.json", "utf-8"))

export class Consensus extends EventEmitter implements IConsensus {
    private txdb?: TxDatabase
    private miner: IMiner
    private txPool: ITxPool
    private worldState: WorldState
    private db: Database
    private blockTip: DBBlock
    private headerTip: DBBlock
    private newBlockCallbacks: NewBlockCallback[]
    private lock: AsyncLock

    constructor(miner: IMiner, txPool: ITxPool, dbPath: string, wsPath: string, filePath: string, txPath?: string) {
        super()
        this.miner = miner
        this.txPool = txPool
        this.db = new Database(dbPath, filePath)
        if (txPath) { this.txdb = new TxDatabase(txPath) }
        this.worldState = new WorldState(wsPath, txPool)
        this.newBlockCallbacks = []

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
            if (this.blockTip === undefined) {
                const genesis = await this.initGenesisBlock()
            }

            if (this.txdb !== undefined) {
                await this.txdb.init(this, this.blockTip.height)
            }
            this.txPool.onTopTxChanges(10, (txs: SignedTx[]) => this.createCandidateBlock()) // TODO: Move?
            this.miner.addCallbackNewBlock((block: Block) => { this.put(block.header, block) })
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
        return this.txdb.getLastTxs(address, count)
    }

    public async getNextTxs(address: Address, txHash: Hash, count?: number): Promise<Array<{ txList: TxList, timestamp: number }>> {
        try {
            if (this.txdb) {
                return await this.txdb.getNextTxs(address, txHash, count)
            } else {
                return Promise.reject(`The database to get txs does not exist.`)
            }
        } catch (e) {
            logger.error(`Fail to getNextTxs : ${e}`)
            return e
        }
    }
    public getBlockStatus(hash: Hash): Promise<BlockStatus> {
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
    public getHash(height: number): Promise<Hash> {
        return this.db.getHashAtHeight(height)
    }
    public async getBlockHeight(hash: Hash): Promise<number> {
        const block = await this.db.getDBBlock(hash)
        return (block !== undefined) ? block.height : undefined
    }
    private async put(header: BlockHeader, block?: Block): Promise<IStatusChange> {
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

                if (this.headerTip === undefined || this.headerTip.height < dbBlock.height) {
                    this.headerTip = dbBlock
                    await this.db.setHeaderTip(hash)
                }

                // TODO: Check timestamp, wait until timestamp has passed
                if (block !== undefined && (this.blockTip === undefined || this.blockTip.height < dbBlock.height)) {
                    await this.reorganize(hash, block, dbBlock.height)
                    this.blockTip = dbBlock
                    await this.db.setBlockTip(hash)
                    this.createCandidateBlock(this.blockTip, hash)
                }

                logger.info(`Put ${block ? "Block" : "Header"}(${dbBlock.height}) ${hash}, BTip(${this.blockTip.height}) HTip(${this.headerTip.height})`)
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

    private async reorganize(newBlockHash: Hash, newBlock: Block, newBlockHeight: number) {
        const newBlockHashes: Hash[] = []
        const newBlocks: Block[] = []
        let popStopHeight = newBlockHeight
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
        while (popHeight >= popStopHeight) {
            const popBlock = await this.db.getBlock(popHash)
            if (!(popBlock instanceof Block)) {
                throw new Error("Error trying to reorganize past the genesis block")
            }
            await this.db.setBlockStatus(popHash, BlockStatus.Block)
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
            if (this.txdb) { await this.txdb.putTxs(hash, block.txs) }
            this.emit("block", block)
        }
    }

    private async createCandidateBlock(previousDBBlock: DBBlock = this.blockTip, previousHash: Hash = new Hash(previousDBBlock.header)) {
        try {
            const timeStamp = Date.now()
            const miner: Address = new Address(conf.minerAddress)
            const { invalidTxs, validTxs, stateTransition: { currentStateRoot } } = await this.worldState.next(previousDBBlock.header.stateRoot, miner)
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
            this.txPool.updateTxs(invalidTxs, 0)
            this.miner.newCandidateBlock(newBlock)
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
                await this.txdb.putTxs(genesisHash, genesis.txs)
            }
            return genesis
        } catch (e) {
            logger.error(`Fail to initGenesisBlock : ${e}`)
            throw e
        }
    }
}
