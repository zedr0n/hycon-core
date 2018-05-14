import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { AsyncLock } from "../../common/asyncLock"
import { AnyBlock, Block } from "../../common/block"
import { GenesisBlock } from "../../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../../common/blockHeader"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
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

    public async putBlock(hash: Hash, block: AnyBlock): Promise<{ current: DBBlock, previous: DBBlock }> {
        // Async problem, block could be inserted twice
        return await this.blockLock.critical<{ current: DBBlock, previous: DBBlock }>(async () => {
            const { current, previous } = await this.putHeader(hash, block.header)
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
            await this.database.put("b" + hash, current.encode())
            return { current, previous }
        })
    }

    public async putHeader(hash: Hash, header: AnyBlockHeader): Promise<{ current: DBBlock, previous: DBBlock }> {

        return await this.headerLock.critical<{ current: DBBlock, previous: DBBlock }>(async () => {
            const currentBlock = await this.getDBBlock(hash)
            if (currentBlock) {
                let previousBlock: DBBlock | undefined
                if (header instanceof BlockHeader) {
                    previousBlock = await this.getDBBlock(header.previousHash[0])
                }
                return Promise.resolve({ current: currentBlock, previous: previousBlock })
            }
            const { current, previous } = await this.makeDBBlock(header).catch((err) => Promise.reject(err))
            await this.database.put("b" + hash, current.encode())
            return Promise.resolve({ current, previous })
        })
    }

    public async setHashAtHeight(height: number, hash: Hash): Promise<void> {
        await this.database.put(height, hash.toString())
    }

    public async getHashAtHeight(height: number): Promise<Hash> {
        try {
            const hashData = await this.database.get(height)
            const hash = Hash.decode(hashData.toString())
            return hash
        } catch (e) {
            if (e.notFound) { return undefined }
            logger.error(`Fail to getHashAtHeight : ${e}`)
            return Promise.reject(e)
        }
    }

    public async setBlockStatus(hash: Hash, status: BlockStatus): Promise<void> {
        await this.database.put("s" + hash, status)
    }

    public async getBlockStatus(hash: Hash): Promise<BlockStatus> {
        try {
            const key = "s" + hash
            const status = await this.database.get(key)
            return Number(status)
        } catch (e) {
            if (e.notFound) { return 0 }
            logger.error(`Fail to getBlockStatus : ${e}`)
            return Promise.reject(e)
        }
    }

    public async setBlockTip(hash: Hash) {
        await this.database.put("__blockTip", hash.toString())
    }

    public async getBlockTip(): Promise<DBBlock | undefined> {
        return this.getTip("__blockTip")
    }

    public async setHeaderTip(hash: Hash) {
        await this.database.put("__headerTip", hash.toString())
    }

    public async getHeaderTip(): Promise<DBBlock | undefined> {
        return this.getTip("__headerTip")
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
            return dbBlock.header
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
            return blockArray
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
            return headerArray
        } catch (e) {
            logger.error(`getHeadersRange failed\n${e}`)
            return Promise.reject(e)
        }
    }

    public async getDBBlocksRange(fromHeight: number, count?: number): Promise<DBBlock[]> {
        try {
            const dbBlockArray: DBBlock[] = []
            let height = fromHeight
            for (let i = 0; i < count; i++) {
                const hash = await this.getHashAtHeight(height)
                if (hash === undefined) { break }
                const dbBlock = await this.getDBBlock(hash)
                dbBlockArray.push(dbBlock)
                height++
            }
            return dbBlockArray
        } catch (e) {
            logger.error(`getBlocksRange failed\n${e}`)
            return Promise.reject(e)
        }
    }

    private async getDBBlock(hash: Hash): Promise<DBBlock | undefined> {
        let decodingDBEntry = false
        try {
            const key = "b" + hash
            const encodedBlock = await this.database.get(key)
            decodingDBEntry = true
            const block = DBBlock.decode(encodedBlock)
            if (block) {
                return block
            } else {
                // TODO: Schedule Rebuild from file or rerequest from network
                logger.debug(`Could not decode block ${hash}`)
                const decodeError = new DecodeError()
                decodeError.hash = hash
                throw decodeError
            }
        } catch (e) {
            if (e.notFound) { return undefined }
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

    // Async safe, block height will not change, previous block will not change
    private async makeDBBlock(header: AnyBlockHeader): Promise<{ current: DBBlock, previous?: DBBlock }> {
        try {
            let height = 0
            let previous: DBBlock
            if (header instanceof BlockHeader) {
                if (header.previousHash.length <= 0) {
                    return Promise.reject(`Block has no previous hashes`)
                }
                // Async safe, previousBlock's height will not change
                previous = await this.getDBBlock(header.previousHash[0])
                height = previous.height + 1
            }
            return { current: new DBBlock({ header, height }), previous }
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
            this.database.get(key).catch(async (e) => {
                if (e.notFound) {
                    await this.database.put(key, value)
                    resolved(value)
                } else { reject(`Could not intitialize '${key}' due to error: '${e}'`) }
            }).then((data) => {
                resolved(data)
            })
        })
    }

    private async getTip(key: string): Promise<DBBlock | undefined> {
        try {
            const hashData = await this.database.get(key)
            const hash = Hash.decode(hashData.toString())
            const block = await this.getDBBlock(hash)
            return block
        } catch (e) {
            if (e.notFound) { return undefined }
            logger.error(`Fail to getTip : ${e}`)
            return Promise.reject(e)
        }
    }
}
