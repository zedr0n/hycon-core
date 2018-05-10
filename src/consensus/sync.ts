import { configure, getLogger } from "log4js"
import { AnyBlock, Block } from "../common/block"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { INetwork } from "../network/inetwork"
import { IPeer } from "../network/ipeer"
import { Hash } from "../util/hash"
import { IConsensus } from "./iconsensus"
const logger = getLogger("Sync")

export enum BlockStatus {
    Rejected = -1,
    Nothing = 0,
    Header = 1,
    Block = 2,
    MainChain = 3,
}
const count = 10

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

    private different: ISyncInfo
    private commonMainChain: ISyncInfo
    private commonBlock: ISyncInfo
    private commonHeader: ISyncInfo
    constructor(network: INetwork, consensus: IConsensus) {
        this.peer = network.getRandomPeer()
    }

    public async sync() {
        const remoteTip = await this.peer.getTip()
        const localTip = this.consensus.getBlocksTip()
        await this.findCommons(remoteTip, localTip)
        const startHeaderHeight = await this.findStartHeader()
        if (remoteTip.height > localTip.height) {
            await this.getHeaders(startHeaderHeight)
        } else {
            await this.putHeaders(startHeaderHeight)
        }
        const startBlockHeight = await this.findStartBlock(startHeaderHeight)
        if (remoteTip.height > localTip.height) {
            await this.getBlocks(startBlockHeight)
        } else {
            await this.putBlocks(startBlockHeight)
        }
    }

    private async findCommons(localTip: ITip, remoteTip: ITip) {
        let startHeight: number
        if (remoteTip.height <= localTip.height) {
            if (await this.updateCommons(remoteTip.height, remoteTip.hash)) {
                return
            }
            startHeight = remoteTip.height - 1
        } else if (remoteTip.height > localTip.height) {
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

        if (!await this.updateCommons(0)) {
            logger.fatal("Peer is different genesis block")
            throw new Error("Peer using different genesis block tried to sync")
        }
    }

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
                return (this.commonMainChain === undefined) && (this.commonBlock === undefined)
            case BlockStatus.Nothing:
                this.different = syncInfo
                return (this.commonMainChain === undefined) && (this.commonBlock === undefined) && (this.commonHeader === undefined)
            case BlockStatus.Rejected:
                logger.fatal("Peer is using rejected block")
                throw new Error("Rejected block found during sync")
        }
    }

    private async findStartHeader(): Promise<number> {
        let height = this.different.height
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
        do {
            headers = await this.peer.getHeadersByRange(height, count)
            for (const header of headers) {
                if (header instanceof BlockHeader) {
                    await this.consensus.putHeader(header)
                }
            }
        } while (headers.length > 0)
    }

    private async putHeaders(height: number) {
        let headers: AnyBlockHeader[]
        do {
            headers = await this.consensus.getHeadersRange(height, count)
            await this.peer.putHeaders(headers)
        } while (headers.length > 0)
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
        do {
            blocks = await this.peer.getBlocksByRange(height, count)
            for (const block of blocks) {
                if (block instanceof Block) {
                    await this.consensus.putBlock(block)
                }
            }
        } while (blocks.length > 0)
    }

    private async putBlocks(height: number) {
        let blocks: AnyBlock[]
        do {
            blocks = await this.consensus.getBlocksRange(height, count)
            await this.peer.putBlocks(blocks)
        } while (blocks.length > 0)
    }
}
