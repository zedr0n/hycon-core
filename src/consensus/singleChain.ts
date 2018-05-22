import { getLogger } from "log4js"
import Long = require("long")
import { setInterval } from "timers"
import { Address } from "../common/address"
import { AsyncLock } from "../common/asyncLock"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { PublicKey } from "../common/publicKey"
import { GenesisSignedTx } from "../common/txGenesisSigned"
import { TxPool } from "../common/txPool"
import { SignedTx } from "../common/txSigned"
import { MinerServer } from "../miner/minerServer"
import * as proto from "../serialization/proto"
import { Server } from "../server"
import { Graph } from "../util/graph"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"
import { Account } from "./database/account"
import { Database } from "./database/database"
import { DBBlock } from "./database/dbblock"
import { TxDatabase } from "./database/txDatabase"
import { TxList } from "./database/txList"
import { IStateTransition, WorldState } from "./database/worldState"
import { DifficultyAdjuster } from "./difficultyAdjuster"
import { AnySignedTx, IConsensus, NewBlockCallback } from "./iconsensus"
import { BlockStatus } from "./sync"

const logger = getLogger("SingleChain Consensus")
export class SingleChain implements IConsensus {
    public graph: Graph
    private server: Server
    private newBlockCallbacks: NewBlockCallback[]
    private db: Database
    private worldState: WorldState
    private blockTip: DBBlock
    private headerTip: DBBlock
    private txUnit: number
    private txdb?: TxDatabase
    private blockLock: AsyncLock
    private headerLock: AsyncLock

    constructor(server: Server, dbPath: string, wsPath: string, filePath: string, txPath?: string) {
        this.server = server
        this.newBlockCallbacks = []
        this.db = new Database(dbPath, filePath)
        this.worldState = new WorldState(wsPath)
        this.txUnit = 1000
        if (txPath) { this.txdb = new TxDatabase(txPath) }
        this.graph = new Graph()
        this.blockLock = new AsyncLock()
        this.headerLock = new AsyncLock()
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
            }

            if (this.headerTip === undefined || this.blockTip === undefined) {
                throw new Error("Could not initialize DB with genesis block")
            }

            if (this.txdb) {
                await this.txdb.init(this, this.blockTip.height)
            }

            this.server.txPool.onTopTxChanges(10, (txs: SignedTx[]) => this.createCandidateBlock(txs))
            this.server.miner.addCallbackNewBlock(
                (block: Block) => {
                    this.onMinedBlock(block)
                })
            this.createCandidateBlock(this.server.txPool.getPending().slice(0, 10))
            logger.info(`Initialization of singlechain is over.`)
        } catch (e) {
            logger.error(`Initialization fail in singleChain : ${e}`)
            process.exit(1)
        }
    }

    public async putBlock(block: Block): Promise<boolean> {
        return await this.blockLock.critical<boolean>(async () => {
            try {
                // TODO: Return block status
                const blockHash = new Hash(block.header)
                logger.info(`Put Block : ${blockHash}`)

                const blockStatus = await this.getBlockStatus(blockHash)
                if (blockStatus === BlockStatus.Rejected) {
                    logger.warn(`Already rejected Block : ${blockHash}`)
                    throw new Error(`Rejecting Block : ${blockHash}`)
                }
                if (blockStatus === BlockStatus.MainChain || blockStatus === BlockStatus.Block) {
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
                    await this.db.setBlockStatus(blockHash, BlockStatus.Rejected)
                    throw new Error(`Rejecting Block : ${blockHash}`)
                }

                const transitionResult = verifyResult.stateTransition
                await this.worldState.putPending(transitionResult.batch, transitionResult.mapAccount)
                const { current, previous } = await this.db.putBlock(blockHash, block)

                await this.organizeChains(blockHash, current, block, this.txUnit)

                logger.info(`Put Block(${current.height}) HTip(${this.headerTip.height}) BTip(${this.blockTip.height})`)
                return true
            } catch (e) {
                logger.error(e)
                return false
            }
        })
    }

    public async putHeader(header: BlockHeader): Promise<boolean> {
        return await this.headerLock.critical<boolean>(async () => {
            try {
                // TODO: Return block status
                const blockHash = new Hash(header)
                const blockStatus = await this.getBlockStatus(new Hash(header))
                if (blockStatus === BlockStatus.Rejected) {
                    logger.warn(`Already rejected Block : ${blockHash}`)
                    throw new Error(`Rejecting Header : ${blockHash}`)
                }

                if (blockStatus === BlockStatus.MainChain || blockStatus === BlockStatus.Block || blockStatus === BlockStatus.Header) {
                    logger.warn(`Already exsited Header : ${blockHash}`)
                    return false
                }

                if (!await this.verifyHeader(header)) {
                    logger.error(`Invalid Header Rejected : ${blockHash}`)
                    await this.db.setBlockStatus(blockHash, BlockStatus.Rejected)
                    throw new Error(`Rejecting Header : ${blockHash}`)
                }

                const { current, previous } = await this.db.putHeader(blockHash, header)
                await this.organizeChains(blockHash, current)

                logger.info(`Put Header(${current.height}) HTip(${this.headerTip.height}) BTip(${this.blockTip.height})`)
                return true
            } catch (e) {
                logger.error(`Fail to putHeader in SingleChain : ${e}`)
                return Promise.reject(e)
            }
        })
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

    public async getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]> {
        try {
            const blockArray = await this.db.getBlocksRange(fromHeight, count)
            return blockArray
        } catch (e) {
            logger.error(`Fail to getBlocksRange : ${e}`)
            throw e
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

    public async getBlockStatus(hash: Hash): Promise<BlockStatus> {
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

    public async getBlockHeight(hash: Hash): Promise<number | undefined> {
        return await this.db.getBlockHeight(hash)
    }

    public async testMakeBlock(txs: SignedTx[], previous?: Block): Promise<Block> {
        return await this.createCandidateBlock(txs, previous)
    }

    private newBlock(block: AnyBlock): void {
        for (const callback of this.newBlockCallbacks) {
            callback(block)
        }
    }

    private async initGenesisBlock(): Promise<GenesisBlock> {
        try {
            const genesis = GenesisBlock.loadFromFile()
            const genesisHash = new Hash(genesis.header)
            const transition = await this.worldState.first(genesis)
            await this.worldState.putPending(transition.batch, transition.mapAccount)
            genesis.header.stateRoot = transition.currentStateRoot
            const { current } = await this.db.putBlock(genesisHash, genesis)
            const debug = await this.db.getBlock(genesisHash)
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
            this.graph.initGraph(genesis.header)
            return genesis
        } catch (e) {
            logger.error(`Fail to initGenesisBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    private async createCandidateBlock(txs: SignedTx[], previous?: Block): Promise<Block> {
        try {
            let previousDBBlock = this.blockTip
            let previousHash = new Hash(this.blockTip.header)
            if (previous !== undefined) {
                previousHash = new Hash(previous.header)
                previousDBBlock = await this.db.getDBBlock(previousHash)
            }
            const timeStamp = Date.now()
            // TODO : get Miner address -> If miner is undefined, occur error
            const miner: Address = undefined
            const previousHeader = previousDBBlock.header

            const prevTimeEMA = previousDBBlock.timeEMA

            const newTimeEMA = DifficultyAdjuster.calcTimeEMA(timeStamp - previousHeader.timeStamp, prevTimeEMA)
            const newWorkEMA = DifficultyAdjuster.calcWorkEMA(Difficulty.decode(previousHeader.difficulty), previousDBBlock.workEMA)

            const difficulty = DifficultyAdjuster.calcNewDifficulty(newTimeEMA, newWorkEMA).encode()
            txs.sort((txA, txB) => txA.nonce - txB.nonce)
            const { invalidTxs, validTxs, stateTransition: { currentStateRoot } } = await this.worldState.next(txs, previousHeader.stateRoot, miner)
            const header = new BlockHeader({
                difficulty,
                merkleRoot: new Hash(),
                nonce: -1,
                previousHash: [previousHash],
                stateRoot: currentStateRoot,
                timeStamp,
            })
            const newBlock = new Block({ header, txs: validTxs, miner })
            this.server.txPool.updateTxs(invalidTxs, 0)
            newBlock.updateMerkleRoot()

            if (!await this.verifyPreBlock(newBlock, previousHeader)) { throw new Error("Not verified.") }
            this.server.miner.newCandidateBlock(newBlock)
            return newBlock
        } catch (e) {
            logger.error(`Fail to createCandidateBlock: ${e}`)
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

        const merkleRoot = block.calculateMerkleRoot()
        const merkleRootVerify = merkleRoot.equals(block.header.merkleRoot)
        if (!merkleRootVerify) {
            logger.warn(`Invalid merkleRoot expected ${block.header.merkleRoot}, got ${merkleRoot}`)
            return { isVerified: false }
        }
        const { stateTransition, validTxs, invalidTxs } = await this.worldState.next(block.txs, previousHeader.stateRoot, block.miner)
        if (!stateTransition.currentStateRoot.equals(block.header.stateRoot)) {
            logger.warn(`State root(${stateTransition.currentStateRoot.toString()}) is incorrect, expected: ${block.header.stateRoot.toString()}, previous: ${previousHeader.stateRoot.toString()}`)
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

        const prevHash = new Hash(previousHeader)
        const prevDBBlock = await this.db.getDBBlock(prevHash)

        const prevTimeEMA = prevDBBlock.timeEMA

        const blockDifficulty = Difficulty.decode(block.header.difficulty)
        const timeDelta = block.header.timeStamp - previousHeader.timeStamp
        const workDelta = Difficulty.decode(previousHeader.difficulty)

        if (!(DifficultyAdjuster.verifyDifficulty(timeDelta, prevTimeEMA, workDelta, prevDBBlock.workEMA, blockDifficulty))) {
            logger.warn(`Invalid block difficulty`)
            return { isVerified: false }
        }

        logger.debug(`Verified stateRoot: ${block.header.stateRoot}, Block: ${block.header.merkleRoot.toString()}`)

        return { isVerified: true, stateTransition }
    }

    private async verifyHeader(header: BlockHeader): Promise<boolean> {
        const preHash = header.preHash()
        return MinerServer.checkNonce(preHash, header.nonce, Difficulty.decode(header.difficulty))
    }

    private async organizeChains(newBlockHash: Hash, dbBlock: DBBlock, block?: Block, txCount: number = 0): Promise<void> {
        try {
            if (this.headerTip === undefined || this.headerTip.height < dbBlock.height) {
                this.headerTip = dbBlock
                await this.db.setHeaderTip(newBlockHash)
            }

            if (block !== undefined) {
                if (this.blockTip === undefined || this.blockTip.height < dbBlock.height) {
                    const txs = await this.reorganize(newBlockHash, block, dbBlock.height, txCount)
                    this.blockTip = dbBlock
                    logger.error(`BlockTip Hash : ${new Hash(this.blockTip.header)}`)
                    await this.db.setBlockTip(newBlockHash)
                    this.createCandidateBlock(txs)
                } else {
                    await this.db.setBlockStatus(newBlockHash, BlockStatus.Block)
                    this.graph.addToGraph(dbBlock.header, BlockStatus.Block)
                }
            } else {
                await this.db.setBlockStatus(newBlockHash, BlockStatus.Header)
                this.graph.addToGraph(dbBlock.header, BlockStatus.Header)
            }
        } catch (e) {
            logger.error(`Fail to organizeChains : ${e}`)
            throw e
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
            this.graph.addToGraph(popBlock.header, BlockStatus.Block)
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
            block = newBlocks.pop()
            await this.db.setBlockStatus(hash, BlockStatus.MainChain)
            this.graph.addToGraph(block.header, BlockStatus.MainChain)
            await this.db.setHashAtHeight(pushHeight, hash)
            pushHeight += 1
            txs = this.server.txPool.updateTxs(block.txs, newBlockHashes.length > 0 ? 0 : txCount)
            if (this.txdb) { await this.txdb.putTxs(hash, block.txs) }
            this.newBlock(block)
        }
        return txs
    }

    private async onMinedBlock(block: Block) {
        logger.info("New block mined")
        await this.putBlock(block)
        // start network propagation
        const encoded: Uint8Array = proto.Network.encode({ putBlock: { blocks: [block] } }).finish()
        this.server.network.broadcast(new Buffer(encoded), null)
    }
}

export function verifyTx(tx: SignedTx | GenesisSignedTx): boolean {
    try {
        const pubKey = new PublicKey(tx)
        if (!pubKey.verify(tx)) { return false }
        return true
    } catch (e) { return false }
}
