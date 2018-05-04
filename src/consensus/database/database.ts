import { resolve } from "dns"
import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { AsyncLock } from "../../common/asyncLock"
import { AnyBlock, Block } from "../../common/block"
import { GenesisBlock } from "../../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../../common/blockHeader"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
import { DBTx } from "../../consensus/database/dbTx"
import { Hash } from "../../util/hash"
import { BlockStatus } from "../sync"
import { BlockFile } from "./blockFile"
import { DBBlock } from "./dbblock"

const logger = getLogger("Database")

function uint8ArrayEqual(first: Uint8Array, second: Uint8Array): boolean {
    if (first.length !== second.length) { return false }
    for (let i = 0; i < second.length; i++) {
        if (first[i] !== second[i]) {
            return false
        }
    }
    return true
}
export class DecodeError extends Error {
    public hash: Hash
}

// tslint:disable:max-line-length
// tslint:disable-next-line:max-classes-per-file
export class Database {
    public tips: DBBlock[] = []
    private database: levelup.LevelUp
    private blockFile: BlockFile
    private headerLock: AsyncLock
    private blockLock: AsyncLock
    private filePosition: number
    private fileNumber: number
    private filePath: string

    constructor(dbPath: string, filePath: string) {
        // TODO: Fix levelup defintions to use abstract leveldown in the constructor
        const rocks: any = rocksdb(dbPath)
        this.database = levelup(rocks)
        this.headerLock = new AsyncLock()
        this.blockLock = new AsyncLock()
        this.blockFile = new BlockFile()
        this.filePath = filePath
    }

    public async init(): Promise<void> {
        const fileNumber = await this.getOrInitKey("fileNumber")
        const filePosition = await this.getOrInitKey("filePosition")
        this.fileNumber = +fileNumber
        this.filePosition = +filePosition
        await this.blockFile.fileInit(this.filePath, this.fileNumber)
    }

    public async getTxTime(hash: Hash): Promise<{ tx: (SignedTx | GenesisSignedTx), timeStamp: number }> {
        try {
            const dbTx = DBTx.decode(await this.database.get("t" + hash))
            const block = await this.getBlock(dbTx.blockHash)
            const stx = block.txs[dbTx.txNumber]
            return Promise.resolve({ tx: stx, timeStamp: block.header.timeStamp })
        } catch (error) {
            if (!error.notFound) { logger.error(`Fail to get TxTime : ${error}`) }
            return Promise.reject(error)
        }
    }

    public async getTxsOfAddress(address: Uint8Array, n: number): Promise<{ dbTxs: DBTx[], map: Map<string, { tx: (SignedTx | GenesisSignedTx), timeStamp: number }> }> {
        try {
            const dbTxs = await this.txSearch(address, (dbTx, dbTxs) => {
                async function insertOrdered(dbTx: DBTx) {
                    if (dbTxs.length === 0) {
                        dbTxs.push(dbTx)
                        return dbTxs
                    }
                    let min = -1
                    let max = dbTxs.length
                    // tslint:disable:no-bitwise
                    let i = (min + max) >> 1
                    while (max - min > 1) {
                        if (dbTx.blockHeight === dbTxs[i].blockHeight) {
                            min = max = i
                            break
                        } else if (dbTx.blockHeight > dbTxs[i].blockHeight) {
                            max = i
                        } else if (dbTx.blockHeight < dbTxs[i].blockHeight) {
                            min = i
                        }
                        i = (min + max) >> 1
                    }
                    dbTxs.splice(i + 1, 0, dbTx)
                    return dbTxs
                }
                if (dbTxs.length === 0) {
                    dbTxs.push(dbTx)
                } else {
                    insertOrdered(dbTx)
                }
            })
            if (dbTxs.dbTxs.length > n) {
                dbTxs.dbTxs.splice(n, dbTxs.dbTxs.length - n)
            }
            return Promise.resolve(dbTxs)
        } catch (error) {
            logger.error(`Fail to get Txs Of Address : ${error}`)
            return Promise.reject(error)
        }
    }

    public async txSearch(address: Uint8Array, add: (dbTx: DBTx, dbTxs: DBTx[]) => void, errorHandler?: (e: any) => void): Promise<{ dbTxs: DBTx[], map: Map<string, { tx: (SignedTx | GenesisSignedTx), timeStamp: number }> }> {
        try {
            const txs: DBTx[] = await this.slowSearch<DBTx>(DBTx.decode, "t", "u", add, errorHandler)
            const mapHash = new Map<string, { tx: (SignedTx | GenesisSignedTx), timeStamp: number }>()
            const dbTxs = []
            txs.reverse()
            for (const dbTx of txs) {
                const txTime = await this.getTxTime(dbTx.hash)
                if (uint8ArrayEqual(txTime.tx.to, address)) {
                    mapHash.set(dbTx.hash.toString(), { tx: txTime.tx, timeStamp: txTime.timeStamp })
                    dbTxs.push(dbTx)
                } else {
                    if ((txTime.tx instanceof SignedTx) && (uint8ArrayEqual(txTime.tx.from, address))) {
                        mapHash.set(dbTx.hash.toString(), { tx: txTime.tx, timeStamp: txTime.timeStamp })
                        dbTxs.push(dbTx)
                    }
                }
            }
            return { dbTxs, map: mapHash }
        } catch (error) {
            logger.error(`Fail to tx Search : ${error}`)
            return Promise.reject(error)
        }
    }

    public async slowSearch<T>(decode: (data: any) => T, from: string, to: string, add: (data: T, datas: T[]) => void, errorHandler?: (e: any) => void): Promise<T[]> {
        const results: T[] = []
        return new Promise<T[]>((resolve, reject) => {
            try {
                this.database.createReadStream({ gt: from, lt: to })
                    .on("data", (data: any) => {
                        try {
                            const result = decode(data.value)
                            add(result, results)
                        } catch (e) {
                            if (errorHandler) {
                                errorHandler(e)
                            }
                        }
                    })
                    .on("end", () => {
                        resolve(results)
                    })
            } catch (error) {
                logger.error(`Fail to slowSearch : ${error}`)
                return Promise.reject(error)
            }
        })
    }

    public async putBlock(block: AnyBlock): Promise<{ current: DBBlock, currentHash: Hash, previous: DBBlock }> {
        // Async problem, block could be inserted twice
        return await this.blockLock.criticle<{ current: DBBlock, currentHash: Hash, previous: DBBlock }>(async () => {
            const { current, currentHash, previous } = await this.putHeader(block.header)
            // Put block info into blockFile and update header in DB using fileResult.
            const encodeBlock = block.encode()
            const fileResult = await this.blockFile.put(encodeBlock)
            this.filePosition = fileResult.filePosition
            current.offset = fileResult.blockOffset
            current.length = encodeBlock.length
            current.fileNumber = this.blockFile.n

            if (this.blockFile.size() > 134217728) {
                await this.nextFile()
            } else {
                await this.database.put("filePosition", this.filePosition)
            }
            await this.database.put("b" + currentHash, current.encode())
            return { current, currentHash, previous }
        })
    }

    // tslint:disable-next-line:max-line-length
    public async putHeader(header: AnyBlockHeader): Promise<{ current: DBBlock, currentHash: Hash, previous: DBBlock }> {

        return await this.headerLock.criticle<{ current: DBBlock, currentHash: Hash, previous: DBBlock }>(async () => {
            const currentHash = new Hash(header)
            const currentBlock = await this.getDBBlock(currentHash)
            if (currentBlock) {
                let previousBlock: DBBlock | undefined
                if (header instanceof BlockHeader) {
                    previousBlock = await this.getDBBlock(header.previousHash[0])
                }
                return Promise.resolve({ current: currentBlock, currentHash, previous: previousBlock })
            }
            const { current, previous } = await this.makeDBBlock(header).catch((err) => Promise.reject(err))
            await this.database.put("b" + currentHash, current.encode())
            return Promise.resolve({ current, currentHash, previous })

        })
    }

    public async getBlock(hash: Hash): Promise<AnyBlock> {
        try {
            const dbBlock = await this.getDBBlock(hash)
            logger.debug(`DBBlock Key=${"b" + hash} Data=${dbBlock.offset}/${dbBlock.length}`)
            return this.dbBlockToBlock(dbBlock)
        } catch (e) {
            if (e.notFound) {
                e.error(`Block not found : ${e}`)
            }
            if (e instanceof DecodeError) {
                // TODO: Schedule rerequest or file lookup
                logger.debug(`Could not decode block ${hash}`)
                throw e
            }
            return Promise.reject(e)
        }
    }

    public async getBlockHeader(hash: Hash): Promise<AnyBlockHeader | undefined> {
        try {
            const dbBlock = await this.getDBBlock(hash)
            if (dbBlock === undefined) { return undefined }
            return Promise.resolve(dbBlock.header)
        } catch (e) {
            logger.error(`getBlockHeader failed : Hash=${Hash}\n${e}`)
            return Promise.reject(e)
        }
    }

    public async getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]> {
        try {
            const dbBlockArray = await this.getDBBlocksRange(fromHeight, count)
            const blockArray: AnyBlock[] = []
            for (const dbBlock of dbBlockArray) {
                const block = await this.dbBlockToBlock(dbBlock)
                blockArray.push(block)
            }
            return Promise.resolve(blockArray)
        } catch (e) {
            logger.error(`getBlocksRange failed\n${e}`)
            return Promise.reject(e)
        }
    }
    public async getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]> {
        try {
            const dbBlockArray = await this.getDBBlocksRange(fromHeight, count)
            const headerArray: AnyBlockHeader[] = []
            for (const dbBlock of dbBlockArray) {
                headerArray.push(dbBlock.header)
            }
            return Promise.resolve(headerArray)
        } catch (e) {
            logger.error(`getHeadersRange failed\n${e}`)
            return Promise.reject(e)
        }
    }

    public async getBlockStatus(hash: Hash): Promise<BlockStatus> {
        const block = await this.getDBBlock(hash)
        if (block === undefined) {
            return Promise.resolve(BlockStatus.Nothing)
        } else {
            if (block.fileNumber === undefined) {
                return Promise.resolve(BlockStatus.Header)
            } else {
                return Promise.resolve(BlockStatus.Block)
            }
        }
    }

    public async getDBBlockMapByHeights(fromHeight: number, toHeight: number): Promise<{ blockMap: Map<number, DBBlock[]>, hashMap: Map<string, DBBlock> }> {
        const blockMap = new Map<number, DBBlock[]>()
        const hashMap = new Map<string, DBBlock>()
        for (let i = fromHeight; i <= toHeight; i++) { blockMap.set(i, []) }
        return new Promise<{ blockMap: Map<number, DBBlock[]>, hashMap: Map<string, DBBlock> }>((resolved, reject) => {
            this.database.createReadStream({ gt: "b", lt: "c" })
                .on("data", (data: any) => {
                    const block = DBBlock.decode(data.value)
                    if (block.height >= fromHeight && block.height <= toHeight) {
                        hashMap.set(new Hash(block.header).toString(), block)
                        blockMap.get(block.height).push(block)
                    }
                })
                .on("end", () => {
                    const result = { blockMap, hashMap }
                    resolved(result)
                })
        })
    }

    public async getTop(): Promise<DBBlock[]> {
        let tops: DBBlock[] = []
        return new Promise<DBBlock[]>((resolved, reject) => {
            this.database.createReadStream({ gt: "b", lt: "c" })
                .on("data", (data: any) => {
                    const block = DBBlock.decode(data.value)
                    if (tops.length === 0 || tops[0].height < block.height) {
                        tops = [block]
                    } else if (tops[0].height === block.height && tops[0].header.timeStamp > block.header.timeStamp) {
                        tops = [block]
                    }
                })
                .on("end", () => { resolved(tops) })
        })
    }

    public async delBlock(hash: Hash): Promise<undefined> {
        try {
            const key = "b" + hash
            const dbBlock = await this.getDBBlock(hash)
            if (dbBlock.fileNumber !== undefined && dbBlock.offset !== undefined && dbBlock.length !== undefined) {
                const block = await this.dbBlockToBlock(dbBlock)
                const blockFile = new BlockFile()
                await blockFile.fileInit(this.filePath, dbBlock.fileNumber)
                await blockFile.delBlock(dbBlock.offset, dbBlock.length)
                await this.delDBBlock(hash)
                return Promise.resolve(undefined)
            } else {
                logger.error("DBBlock does not have blockFile info... ")
                return Promise.reject("DBBlock does not have blockFile info... ")
            }
        } catch (e) {
            logger.error(`Fail to delete block : ${e}`)
            return Promise.reject(e)
        }
    }

    public async getDBBlock(hash: Hash): Promise<DBBlock | undefined> {
        let decodingDBEntry = false
        try {
            const key = "b" + hash
            const encodedBlock = await this.database.get(key)
            decodingDBEntry = true
            const block = DBBlock.decode(encodedBlock)
            if (block) {
                return Promise.resolve(block)
            } else {
                // TODO: Schedule Rebuild from file or rerequest from network
                logger.debug(`Could not decode block ${hash}`)
                const decodeError = new DecodeError()
                decodeError.hash = hash
                throw decodeError
            }
        } catch (e) {
            if (e.notFound) { return Promise.resolve(undefined) }
            if (decodingDBEntry) {
                // TODO: Schedule rerequest or file lookup
                logger.debug(`Could not decode block ${hash}`)
                const decodeError = new DecodeError()
                decodeError.hash = hash
                throw decodeError
            }
            return Promise.reject(e)
        }
    }

    private async getDBBlocksRange(fromHeight: number, count?: number): Promise<DBBlock[]> {
        let decodingDBEntry = false
        try {
            const dbBlockArray: DBBlock[] = []
            this.database.createReadStream({ gt: "b", lt: "c" })
                .on("data", (data: any) => {
                    decodingDBEntry = true
                    const dbBlock = DBBlock.decode(data.value)
                    if (dbBlock.height >= fromHeight) {
                        let isInserted = false
                        for (const b of dbBlockArray) {
                            if (b.height >= dbBlock.height) {
                                dbBlockArray.splice(dbBlockArray.indexOf(b), 0, dbBlock)
                                isInserted = true
                                break
                            }
                        }
                        if (!isInserted) {
                            dbBlockArray.push(dbBlock)
                        }
                    }
                })
                .on("end", () => {
                    if (dbBlockArray.length > count) { dbBlockArray.slice(0, count) }
                    return Promise.resolve(dbBlockArray)
                })
        } catch (e) {
            logger.error(`getBlocksRange failed\n${e}`)
            if (decodingDBEntry) {
                // TODO: Schedule rerequest or file lookup
                logger.debug(`Could not decode block in getDBBlocksRange`)
            }
            return Promise.reject(e)
        }
    }

    // Async safe, block height will not change, previous block will not change
    private async makeDBBlock(header: AnyBlockHeader): Promise<{ current: DBBlock, previous?: DBBlock }> {
        try {
            let height = 0
            if (header instanceof BlockHeader) {
                if (header.previousHash.length <= 0) {
                    return Promise.reject(`Block has no previous hashes`)
                }
                // Async safe, previousBlock's height will not change
                const previous = await this.getDBBlock(header.previousHash[0])
                height = previous.height + 1

                return { current: new DBBlock({ header, height }), previous }
            }
            return { current: new DBBlock({ header, height }) }
        } catch (e) {
            logger.error(`fail to make DBBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    private async filePositionInit(): Promise<undefined> {
        try {
            this.filePosition = 0
            return await this.database.put("filePosition", this.filePosition)
        } catch (e) {
            logger.error(`Fail to filePositionInit : ${e}`)
            return Promise.reject(e)
        }
    }

    private async nextFile(): Promise<undefined> {
        await this.blockFile.close()
        this.fileNumber++
        await this.filePositionInit()
        this.blockFile = new BlockFile()
        await this.blockFile.fileInit(this.filePath, this.fileNumber)
        return await this.database.put("fileNumber", this.fileNumber)
    }

    private async delDBBlock(hash: Hash): Promise<undefined> {
        try {
            const key = "b" + hash
            await this.database.del(key)
            return Promise.resolve(undefined)
        } catch (e) {
            logger.error(`Fail to delete DBBlock : ${e}`)
            return Promise.reject(e)
        }
    }

    private async dbBlockToBlock(dbBlock: DBBlock): Promise<AnyBlock> {
        return new Promise<AnyBlock>(async (resolved, reject) => {
            if (dbBlock.offset !== undefined && dbBlock.length !== undefined && dbBlock.fileNumber !== undefined) {
                const blockFile = new BlockFile()
                await blockFile.fileInit(this.filePath, dbBlock.fileNumber)
                const encodeBlock = await blockFile.get(dbBlock.offset, dbBlock.length)
                const block = Block.decode(encodeBlock)
                await blockFile.close()
                resolved(block)
            } else {
                logger.error(`Fail to dbBlock to block : Block file information is not found`)
                reject("Block could not be found")
            }
        })
    }

    private async getOrInitKey(key: string, value: any = 0): Promise<any> {
        return new Promise<any>((resolved, reject) => {
            this.database.get(key)
                .catch(async (e) => {
                    if (e.notFound) {
                        await this.database.put(key, value)
                        resolved(value)
                    } else { reject(`Could not intitialize '${key}' due to error: '${e}'`) }
                }).then((data) => {
                    resolved(data)
                })
        })
    }
}
