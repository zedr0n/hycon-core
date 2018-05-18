import { getLogger } from "log4js"
import * as Long from "long"
import { Socket } from "net"
import { AsyncLock } from "../../common/asyncLock"
import { AnyBlock, Block } from "../../common/block"
import { AnyBlockHeader, BlockHeader } from "../../common/blockHeader"
import { ITxPool } from "../../common/itxPool"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import * as proto from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { INetwork } from "../inetwork"
import { IPeer } from "../ipeer"
import { PeerDb } from "../peerDb"
import { BasePeer } from "./basePeer"
import { RabbitNetwork } from "./rabbitNetwork"

const logger = getLogger("NetPeer")

interface IResponse { message: proto.INetwork, relay: boolean }
export class RabbitPeer extends BasePeer implements IPeer {
    private consensus: IConsensus
    private txPool: ITxPool
    private network: RabbitNetwork
    private peerDB: PeerDb

    constructor(socket: Socket, network: RabbitNetwork, consensus: IConsensus, txPool: ITxPool, peerDB: PeerDb) {
        super(socket)
        // tslint:disable-next-line:max-line-length
        logger.debug(`New Netpeer Local=${RabbitNetwork.ipv6Toipv4(socket.localAddress)}:${socket.localPort} --> Remote=${RabbitNetwork.ipv6Toipv4(socket.remoteAddress)}:${socket.remotePort}`)
        this.network = network
        this.consensus = consensus
        this.txPool = txPool
        this.peerDB = peerDB
    }

    public polling() {
        if (this.socketBuffer.isSendLockOverflow()) {
            logger.info(`SocketBuffer Overflow ${this.socketBuffer.getInfo()}`)
            this.disconnect()
        }
    }
    public async getTip(): Promise<{ hash: Hash, height: number }> {
        const { reply, packet } = await this.sendRequest({ getTip: { dummy: 0 } })
        if (reply.getTipReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }
        return { hash: new Hash(reply.getTipReturn.hash), height: Number(reply.getTipReturn.height) }
    }

    public async putHeaders(header: AnyBlockHeader[]): Promise<boolean> {
        const { reply, packet } = await this.sendRequest({ putHeaders: { headers: [] } })
        if (reply.putHeadersReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }
        return reply.putHeadersReturn.success
    }

    public async getHash(height: number): Promise<Hash> {
        const { reply, packet } = await this.sendRequest({ getHash: { height } })
        if (reply.getHashReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }
        return new Hash(reply.getHashReturn.hash)
    }

    public async status(): Promise<proto.IStatus> {
        const { reply, packet } = await this.sendRequest({
            status: {
                networkid: "hycon",
                port: this.network.port,
                version: this.network.version,
            },
        })
        if (reply.statusReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }
        return reply.statusReturn.status
    }

    public async ping(): Promise<number> {
        const nonce = Math.round(Math.random() * Math.pow(2, 31))
        const { reply, packet } = await this.sendRequest({ ping: { nonce } })
        if (reply.pingReturn === undefined) {
            throw new Error("Invalid response")
        }
        const src = new Long(nonce)
        if (!src.equals(reply.pingReturn.nonce)) {
            throw new Error("Invalid ping value")
        }
        return reply.pingReturn.nonce as number
    }

    public async getPeers(count?: number): Promise<proto.IPeer[]> {
        const { reply, packet } = await this.sendRequest({ getPeers: { count } })
        if (reply.getPeersReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }
        return reply.getPeersReturn.peers
    }

    public async putTxs(txs: SignedTx[]): Promise<boolean> {
        const { reply, packet } = await this.sendRequest({ putTx: { txs } })
        if (reply.putTxReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return reply.putTxReturn.success
    }

    public async getTxs(minFee?: number): Promise<SignedTx[]> {
        const { reply, packet } = await this.sendRequest({ getTxs: { minFee } })
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
        const { reply, packet } = await this.sendRequest({ putBlock: { blocks } })
        if (reply.putBlockReturn === undefined) {
            this.protocolError()
            throw new Error("Invalid response")
        }

        return reply.putBlockReturn.success
    }

    public async getBlocksByHashes(hashes: Hash[]): Promise<Block[]> {
        const { reply, packet } = await this.sendRequest({ getBlocksByHash: { hashes } })
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
        const { reply, packet } = await this.sendRequest({ getHeadersByHash: { hashes } })
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
        const { reply, packet } = await this.sendRequest({ getBlocksByRange: { fromHeight, count } })
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
        const { reply, packet } = await this.sendRequest({ getHeadersByRange: { fromHeight, count } })
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

    // this is called in BasePeer's onPacket
    protected async respond(id: number, request: proto.Network, packet: Buffer): Promise<void> {
        let response: IResponse
        const reply = id !== 0
        switch (request.request) {
            case "status":
                response = await this.respondStatus(reply, request[request.request])
                break
            case "ping":
                response = await this.respondPing(reply, request[request.request])
                break
            case "getPeers":
                response = await this.respondGetPeers(reply, request[request.request])
                break
            case "putTx":
                response = await this.respondPutTx(reply, request[request.request])
                break
            case "getTxs":
                response = await this.respondGetTxs(reply, request[request.request])
                break
            case "putBlock":
                response = await this.respondPutBlock(reply, request[request.request])
                break
            case "getBlocksByHash":
                response = await this.respondGetBlocksByHash(reply, request[request.request])
                break
            case "getHeadersByHash":
                response = await this.respondGetHeadersByHash(reply, request[request.request])
                break
            case "getBlocksByRange":
                response = await this.respondGetBlocksByRange(reply, request[request.request])
                break
            case "getHeadersByRange":
                response = await this.respondGetHeadersByRange(reply, request[request.request])
                break
            case "getTip":
                response = await this.respondGetTip(reply, request[request.request])
                break
            case "putHeaders":
                response = await this.respondPutHeaders(reply, request[request.request])
                break
            case "getHash":
                response = await this.respondGetHash(reply, request[request.request])
                break
        }
        if (reply) { // i'm replying for the request
            if (response.message !== undefined) {
                this.send(id, response.message).catch((e) => logger.warn(`Message response could not be delived: ${e}`))
            }
        } else {
            // broadcast mode
            if (response.relay) {
                // only request was successfully processed
                // we will relay
                // exclude the peer itself
                this.network.broadcast(packet, this)
            }
        }
    }

    private async respondStatus(reply: boolean, request: proto.IStatus): Promise<IResponse> {
        const message: proto.INetwork = {
            statusReturn: {
                status: {
                    networkid: this.network.networkid,
                    port: this.network.port,
                    version: this.network.version,
                },
                success: true,
            },
        }
        const relay = false
        return { message, relay }
    }

    private async respondPing(reply: boolean, request: proto.IPing): Promise<IResponse> {
        const message: proto.INetwork = { pingReturn: { nonce: request.nonce } }
        const relay = false
        return { message, relay }
    }

    private async respondGetPeers(reply: boolean, request: proto.IGetPeers): Promise<IResponse> {
        try {
            const num = request.count
            const peers: proto.IPeer[] = this.network.getConnections()
            const message: proto.INetwork = { getPeersReturn: { success: true, peers } }
            const relay = false
            return { message, relay }
        } catch (e) {
            logger.error(`Could not get recent active Peers: ${e}`)
        }
    }

    private async respondPutTx(reply: boolean, request: proto.IPutTx): Promise<IResponse> {
        let success = false
        if (request.txs !== undefined) {
            try {
                const txs = request.txs.map((tx) => new SignedTx(tx))
                const n = await this.txPool.putTxs(txs)
                success = (n === request.txs.length)
                if (n === 0) {
                    // do not relay
                    success = false
                }
            } catch (e) {
                logger.error(`Failed to putTx: ${e}`)
            }
        }

        // logger.debug(`PutTx`)
        return { message: { putTxReturn: { success } }, relay: success }
    }

    private async respondGetTxs(reply: boolean, request: proto.IGetTxs): Promise<IResponse> {
        const message: proto.INetwork = { getTxsReturn: { success: false, txs: [] } }
        const relay = false
        return { message, relay }
    }

    private async respondPutBlock(reply: boolean, request: proto.IPutBlock): Promise<IResponse> {
        let relay = false
        try {

            const promises: Array<Promise<boolean>> = []
            for (const iblock of request.blocks) {
                const block = new Block(iblock)
                promises.push(this.consensus.putBlock(block))
            }
            const results = await Promise.all(promises)
            relay = results.every((value) => value)
        } catch (e) {
            logger.error(`Failed to put block: ${e}`)
        }
        logger.debug(`PutBlock Relay=${relay}`)
        return { message: { putBlockReturn: { success: relay } }, relay }
    }

    private async respondGetBlocksByHash(reply: boolean, request: proto.IGetBlocksByHash): Promise<IResponse> {
        let message: proto.INetwork
        try {
            const blockPromise: Array<Promise<AnyBlock>> = []
            for (const iHash of request.hashes) {
                const hash = new Hash(iHash)
                blockPromise.push(this.consensus.getBlockByHash(hash))
            }
            const blocks = await Promise.all(blockPromise)
            message = { getBlocksByHashReturn: { success: true, blocks } }
        } catch (e) {
            logger.error(`Failed to getBlockByHash: ${e}`)
            message = { getBlocksByHashReturn: { success: false } }
        }
        return { message, relay: false }
    }

    private async respondGetHeadersByHash(reply: boolean, request: proto.IGetHeadersByHash): Promise<IResponse> {
        let message: proto.INetwork
        try {
            const headerPromise: Array<Promise<AnyBlockHeader>> = []
            for (const iHash of request.hashes) {
                const hash = new Hash(iHash)
                headerPromise.push(this.consensus.getHeaderByHash(hash))
            }
            const headers = await Promise.all(headerPromise)
            message = { getHeadersByHashReturn: { success: true, headers } }
        } catch (e) {
            logger.error(`Failed to getHeaderByHash: ${e}`)
            message = { getBlocksByHashReturn: { success: false } }
        }
        return { message, relay: false }
    }

    private async respondGetBlocksByRange(reply: boolean, request: proto.IGetBlocksByRange): Promise<IResponse> {
        let message: proto.INetwork
        try {
            const fromHeight = Number(request.fromHeight)
            const count = Number(request.count)
            const blocks = await this.consensus.getBlocksRange(fromHeight, count)
            message = { getBlocksByRangeReturn: { success: true, blocks } }
        } catch (e) {
            logger.error(`Failed to getBlocksByRange: ${e}`)
            message = { getBlocksByRangeReturn: { success: false } }
        }
        return { message, relay: false }
    }

    private async respondGetHeadersByRange(reply: boolean, request: proto.IGetHeadersByRange): Promise<IResponse> {
        let message: proto.INetwork
        try {
            const fromHeight = Number(request.fromHeight)
            const count = Number(request.count)
            const headers = await this.consensus.getHeadersRange(fromHeight, count)
            message = { getHeadersByRangeReturn: { success: true, headers } }
        } catch (e) {
            logger.error(`Failed to getHeadersByRange: ${e}`)
            message = { getHeadersByRangeReturn: { success: false } }
        }
        return { message, relay: false }
    }

    private async respondGetTip(reply: boolean, request: proto.IGetTip): Promise<IResponse> {
        let message: proto.INetwork
        try {
            const tip = await this.consensus.getBlocksTip()
            message = { getTipReturn: { success: true, hash: tip.hash, height: tip.height } }
        } catch (e) {
            logger.error(`Failed to getBlockTip: ${e}`)
            message = { getTipReturn: { success: false } }
        }
        return { message, relay: false }
    }

    private async respondPutHeaders(reply: boolean, request: proto.IPutHeaders): Promise<IResponse> {
        let relay = false
        try {
            const promises: Array<Promise<boolean>> = []
            for (const iheader of request.headers) {
                const header = new BlockHeader(iheader)
                promises.push(this.consensus.putHeader(header))
            }
            const results = await Promise.all(promises)
            relay = results.every((value) => value)
        } catch (e) {
            logger.error(`Failed to put header: ${e}`)
        }
        logger.debug(`PutHeader`)
        return { message: { putHeadersReturn: { success: relay } }, relay }
    }

    private async respondGetHash(reply: boolean, request: proto.IGetHash): Promise<IResponse> {
        let message: proto.INetwork
        const height = Number(request.height)
        try {
            const hash = await this.consensus.getHash(height)
            message = { getHashReturn: { success: true, hash } }
        } catch (e) {
            logger.error(`Failed to getHash: ${e}`)
            message = { getHashReturn: { success: false } }
        }
        return { message, relay: false }
    }
}
