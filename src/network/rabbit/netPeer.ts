import { getLogger } from "log4js"
import { Socket } from "net"
import { Block } from "../../common/block"
import { AnyBlockHeader, BlockHeader } from "../../common/blockHeader"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import * as proto from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { IPeer } from "../ipeer"
import { BasePeer } from "./peer"

const logger = getLogger("NetPeer")

export class RabbitPeer extends BasePeer implements IPeer {
    private concensus: IConsensus

    constructor(socket: Socket, concensus: IConsensus) {
        super(socket)
        // tslint:disable-next-line:max-line-length
        logger.info(`New netpeer ${socket.localAddress}:${socket.localPort} --> ${socket.remoteAddress}:${socket.remotePort}`)
        this.concensus = concensus
    }

    public async status(): Promise<proto.IStatus> {
        const reply = await this.sendRequest({ status: { version: 0, networkid: "hycon" } })
        if (reply.status === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return reply.status
    }

    public async ping(): Promise<void> {
        const nonce = Math.round(Math.random() * Math.pow(2, 31))
        const reply = await this.sendRequest({ ping: { nonce } })
        if (reply.pingReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return
    }

    public async putTxs(txs: SignedTx[]): Promise<boolean> {
        const reply = await this.sendRequest({ putTx: { txs } })
        if (reply.putTxReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return reply.putTxReturn.success
    }

    public async getTxs(minFee?: number): Promise<SignedTx[]> {
        const reply = await this.sendRequest({ getTxs: { minFee } })
        if (reply.getTxsReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        const txs: SignedTx[] = []
        for (const tx of reply.getTxsReturn.txs) {
            txs.push(new SignedTx(tx))
        }

        return txs
    }

    public async putBlocks(blocks: Block[]): Promise<boolean> {
        const reply = await this.sendRequest({ putBlock: { blocks } })
        if (reply.putBlockReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return reply.putBlockReturn.success
    }

    public async getBlocksByHashes(hashes: Hash[]): Promise<Block[]> {
        const reply = await this.sendRequest({ getBlocksByHash: { hashes } })
        if (reply.getBlocksByHashReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        const blocks: Block[] = []
        for (const block of reply.getBlocksByHashReturn.blocks) {
            blocks.push(new Block(block))
        }
        return blocks
    }

    public async getHeadersByHashes(hashes: Hash[]): Promise<AnyBlockHeader[]> {
        const reply = await this.sendRequest({ getHeadersByHash: { hashes } })
        if (reply.getHeadersByHashReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        const headers: AnyBlockHeader[] = []
        for (const header of reply.getHeadersByHashReturn.headers) {
            headers.push(new BlockHeader(header))
        }
        return headers
    }

    public async getBlocksByRange(fromHeight: number, count: number): Promise<Block[]> {
        const reply = await this.sendRequest({ getBlocksByRange: { fromHeight, count } })
        if (reply.getBlocksByRangeReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        const blocks: Block[] = []
        for (const block of reply.getBlocksByRangeReturn.blocks) {
            blocks.push(new Block(block))
        }
        return blocks
    }

    public async getHeadersByRange(fromHeight: number, count: number): Promise<AnyBlockHeader[]> {
        const reply = await this.sendRequest({ getHeadersByRange: { fromHeight, count } })
        if (reply.getHeadersByRangeReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        const headers: AnyBlockHeader[] = []
        for (const header of reply.getHeadersByRangeReturn.headers) {
            headers.push(new BlockHeader(header))
        }
        return headers
    }

    protected async respond(id: number, request: proto.Network): Promise<void> {
        logger.info(`Must respond to ${request.request}`)
        switch (request.request) {
            case "status":
                this.respondStatus(id, request[request.request])
                break
            case "ping":
                this.respondPing(id, request[request.request])
                break
            case "putTx":
                this.respondPutTx(id, request[request.request])
                break
            case "getTxs":
                this.respondGetTxs(id, request[request.request])
                break
            case "putBlock":
                this.respondPutBlock(id, request[request.request])
                break
            case "getBlocksByHash":
                this.respondGetBlocksByHash(id, request[request.request])
                break
            case "getHeadersByHash":
                this.respondGetHeadersByHash(id, request[request.request])
                break
            case "getBlocksByRange":
                this.respondGetBlocksByRange(id, request[request.request])
                break
            case "getHeadersByRange":
                this.respondGetHeadersByRange(id, request[request.request])
                break
        }
    }

    private respondStatus(id: number, status: proto.IStatus) {
        this.sendReply(id, { status: { version: 0, networkid: "hycon" } })
    }

    private respondPing(id: number, request: proto.IPing) {
        this.sendReply(id, { pingReturn: { nonce: request.nonce } })
    }

    private respondPutTx(id: number, request: proto.IPutTx) {
        this.sendReply(id, { putTxReturn: { success: true } })
    }

    private respondGetTxs(id: number, request: proto.IGetTxs) {
        this.sendReply(id, { getTxsReturn: { success: false, txs: [] } })
    }

    private async respondPutBlock(id: number, request: proto.IPutBlock) {
        const promises: Array<Promise<boolean>> = []
        for (const iblock of request.blocks) {
            const block = new Block(iblock)
            promises.push(this.concensus.putBlock(block))
        }
        const results = await Promise.all(promises)
        const success = results.every((value) => value)
        this.sendReply(id, { putBlockReturn: { success } })
    }

    private async respondGetBlocksByHash(id: number, request: proto.IGetBlocksByHash): Promise<void> {
        try {
            const blockPromise: Array<Promise<Block>> = []
            for (const iHash of request.hashes) {
                const hash = new Hash(iHash)
                blockPromise.push(this.concensus.getBlocksByHash(hash))
            }
            const blocks = await Promise.all(blockPromise)
            this.sendReply(id, { getBlocksByHashReturn: { success: true, blocks } })
        } catch (e) {
            logger.debug(e)
            this.sendReply(id, { getBlocksByHashReturn: { success: false } })
        }
    }

    private respondGetHeadersByHash(id: number, request: proto.IGetHeadersByHash) {
        this.sendReply(id, { getHeadersByHashReturn: { success: false, headers: [] } })
    }

    private respondGetBlocksByRange(id: number, request: proto.IGetBlocksByRange) {
        this.sendReply(id, { getBlocksByRangeReturn: { success: false, blocks: [] } })
    }

    private respondGetHeadersByRange(id: number, request: proto.IGetHeadersByRange) {
        this.sendReply(id, { getHeadersByRangeReturn: { success: false, headers: [] } })
    }
}
