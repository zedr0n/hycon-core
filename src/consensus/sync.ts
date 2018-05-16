import { getLogger } from "log4js"
import { AnyBlock, Block } from "../common/block"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { INetwork } from "../network/inetwork"
import { IPeer } from "../network/ipeer"
import { Server } from "../server"
import { Hash } from "../util/hash"
import { IConsensus } from "./iconsensus"
// tslint:disable-next-line:no-var-requires
const assert = require("assert")
const logger = getLogger("Sync")
// tslint:disable-next-line:no-var-requires
const delay = require("delay")

export enum BlockStatus {
    Rejected = -1,
    Nothing = 0,
    Header = 1,
    Block = 2,
    MainChain = 3,
}
const blockCount = 1
const headerCount = 100

interface ITip {
    hash: Hash,
    height: number
}

interface ISyncInfo {
    hash: Hash,
    height: number
    status: BlockStatus
}

export class Sync {
    public peer: IPeer
    private consensus: IConsensus

    private differentHeight: number
    private commonMainChain: ISyncInfo
    private commonBlock: ISyncInfo
    private commonHeader: ISyncInfo

    private network: INetwork

    constructor(server: Server) {
        this.network = server.network
        this.consensus = server.consensus
    }

    // in future, for dag
    // if we keep storing order, maybe we can use this algorithm for dags, too.
    public async sync() {
        if (this.isSyncing()) {
            return
        }
        logger.info(`Start Syncing`)

        // const testTips = await this.consensus.getHeadersRange(0, 1)
        // const testHash = new Hash(testTips[0])

        try {

            this.peer = this.network.getRandomPeer()
            if (!this.peer) {
                logger.debug(`No peer to sync with`)
                // we will replace with other alogrithm
                return
            }

            logger.debug(`Get remote tip`)
            const remoteTip = await this.peer.getTip()
            const localTip = this.consensus.getBlocksTip()

            logger.info(`Finding Commons`)
            await this.findCommons(localTip, remoteTip)

            logger.info(`Find start Header`)
            const startHeaderHeight = await this.findStartHeader()
            if (remoteTip.height > localTip.height) {
                logger.info(`Getting Headers`)
                await this.getHeaders(startHeaderHeight)
            } else {
                logger.info(`Putting Headers`)
                await this.putHeaders(startHeaderHeight)
            }

            logger.info(`Find start block`)
            const startBlockHeight = await this.findStartBlock(startHeaderHeight)
            if (remoteTip.height === localTip.height) {
                logger.debug(`synchronized`)
            } else if (remoteTip.height > localTip.height) {
                logger.info(`Getting Blocks`)
                await this.getBlocks(startBlockHeight)
            } else {
                logger.info(`Putting Blocks`)
                await this.putBlocks(startBlockHeight)
            }
            this.peer = undefined
        } catch (e) {
            logger.error(`Syncing failed: ${e}`)
        }
        return
    }
    private isSyncing() {
        return this.peer !== undefined
    }

    private async findCommons(localTip: ITip, remoteTip: ITip) {
        let startHeight: number
        if (remoteTip.height <= localTip.height) {
            this.differentHeight = remoteTip.height
            if (await this.updateCommons(remoteTip.height, remoteTip.hash)) {
                return
            }
            startHeight = remoteTip.height - 1
        } else if (remoteTip.height > localTip.height) {
            this.differentHeight = remoteTip.height
            startHeight = localTip.height
        }

        let i = 1
        let height = startHeight
        while (height > 0) {
            if (await this.updateCommons(height)) {
                return
            }
            height = startHeight - i
            i *= 2
        }

        if (!(await this.updateCommons(0))) {
            logger.fatal("Peer is different genesis block")
            throw new Error("Peer using different genesis block tried to sync")
        }
    }

    // hash: peer hash of this height
    private async updateCommons(height: number, hash?: Hash) {
        if (hash === undefined) {
            hash = await this.peer.getHash(height)
        }
        const status = await this.consensus.getBlockStatus(hash)
        const syncInfo = { status, height, hash }
        switch (status) {
            case BlockStatus.MainChain:
                if (this.commonMainChain === undefined) {
                    this.commonMainChain = syncInfo
                }
            // MainChain implies Block
            case BlockStatus.Block:
                if (this.commonBlock === undefined) {
                    this.commonBlock = syncInfo
                }
            // Block implies Header
            case BlockStatus.Header:
                if (this.commonHeader === undefined) {
                    this.commonHeader = syncInfo
                }
                return (this.commonMainChain !== undefined) && (this.commonBlock !== undefined)
            case BlockStatus.Nothing:
                this.differentHeight = syncInfo.height
                return (this.commonMainChain !== undefined) && (this.commonBlock !== undefined) && (this.commonHeader !== undefined)
            case BlockStatus.Rejected:
                logger.fatal("Peer is using rejected block")
                throw new Error("Rejected block found during sync")
        }
    }

    private async findStartHeader(): Promise<number> {
        let height = this.differentHeight
        let min = this.commonHeader.height
        while (min + 1 < height) {
            // tslint:disable-next-line:no-bitwise
            const mid = (min + height) >> 1
            const hash = await this.peer.getHash(mid)
            switch (await this.consensus.getBlockStatus(hash)) {
                case BlockStatus.MainChain:
                case BlockStatus.Block:
                case BlockStatus.Header:
                    min = mid
                    break
                case BlockStatus.Nothing:
                    height = mid
                    break
                case BlockStatus.Rejected:
                    logger.fatal("Peer is using rejected block")
                    throw new Error("Rejected block found during sync")
            }
        }
        return height
    }

    private async getHeaders(height: number) {
        let headers: AnyBlockHeader[]
        try {
            do {
                headers = await this.peer.getHeadersByRange(height, headerCount)
                for (const header of headers) {
                    if (header instanceof BlockHeader) {
                        await this.consensus.putHeader(header)
                    }
                }
                height += headers.length
            } while (headers.length > 0)
        } catch (e) {
            throw new Error(`Could not completely sync headers: ${e}`)
        }
    }

    private async putHeaders(height: number) {
        let headers: AnyBlockHeader[]
        try {
            do {
                headers = await this.consensus.getHeadersRange(height, headerCount)
                await this.peer.putHeaders(headers)
                height += headers.length
            } while (headers.length > 0)
        } catch (e) {
            throw new Error(`Could not completely sync headers: ${e}`)
        }
    }

    private async findStartBlock(height: number): Promise<number> {
        let min = this.commonBlock.height
        while (min + 1 < height) {
            // tslint:disable-next-line:no-bitwise
            const mid = (min + height) >> 1
            const hash = await this.peer.getHash(mid)
            switch (await this.consensus.getBlockStatus(hash)) {
                case BlockStatus.MainChain:
                case BlockStatus.Block:
                    min = mid
                    break
                case BlockStatus.Header:
                case BlockStatus.Nothing:
                    height = mid
                    break
                case BlockStatus.Rejected:
                    logger.fatal("Peer is using rejected block")
                    throw new Error("Rejected block found during sync")
            }
        }
        return height
    }

    private async getBlocks(height: number) {
        let blocks: AnyBlock[]

        try {
            do {
                blocks = await this.peer.getBlocksByRange(height, blockCount)
                for (const block of blocks) {
                    if (block instanceof Block) {
                        await this.consensus.putBlock(block)
                    }
                }
                height += blocks.length
            } while (blocks.length > 0)
        } catch (e) {
            throw new Error(`Could not completely sync blocks: ${e}`)
        }
    }

    private async putBlocks(height: number) {
        let blocks: AnyBlock[]
        try {
            do {
                blocks = await this.consensus.getBlocksRange(height, blockCount)
                await this.peer.putBlocks(blocks)
                height += blocks.length
            } while (blocks.length > 0)
        } catch (e) {
            throw new Error(`Could not completely sync blocks: ${e}`)
        }
    }
}
