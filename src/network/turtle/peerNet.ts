import { getLogger } from "log4js"
import * as net from "net"
import { Socket } from "net"
import { setTimeout } from "timers"
import { Block } from "../../common/block"
import { AnyBlockHeader } from "../../common/blockHeader"
import { SignedTx } from "../../common/txSigned"
import { BlockHeader, GetTxsReturn, IGetTxsReturn, IStatus } from "../../serialization/proto"
import * as proto from "../../serialization/proto"
import { IGetBlocksByHashReturn, IGetHeadersByHashReturn } from "../../serialization/proto"
import { GetHeadersByHashReturn, IPutBlockReturn, PutBlock, PutBlockReturn } from "../../serialization/proto"
import { IGetBlocksByRangeReturn, IGetHeadersByRangeReturn } from "../../serialization/proto"
import { IPingReturn, IPutTxReturn, Ping, PingReturn, PutTx, PutTxReturn, Tx } from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { IPeer } from "../ipeer"
import { Packet } from "./packet"
import { PeerBasic, PeerMode, PeerState } from "./peerBasic"
import { TurtleNetwork } from "./turtleNetwork"

// tslint:disable-next-line:no-var-requires
const delay = require("delay")
const logger = getLogger("NetPeer")
logger.level = "debug"

export abstract class PeerNet extends PeerBasic implements IPeer {

    private static MaxTryCount = 20
    private static PollingStep = 100  // milli seconds

    protected nonce: number = 100

    constructor(server: TurtleNetwork, socket: Socket, mode: PeerMode) {
        super(socket, mode)
        this.network = server

    }

    public close() {
        logger.info(`Replier Gracefullly Closed`)

        switch (this.peerMode) {
            case PeerMode.AcceptedSession:
                this.network.removePeer(this)
                break

            case PeerMode.ConnectedSession:
                setTimeout(() => {
                    this.reconnect()
                }, 2000)
                this.state = PeerState.Disconnected
                break
        }

    }

    // abstract public onReceiveMessage(res: proto.Node): void

    public status(): Promise<proto.IStatus> {
        return new Promise<proto.Status>((resolve, reject) => {
            const status = new proto.Status()
            const guid = this.makeGuid()
            this.sendStatus(status, guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    // send status
    public sendStatus(s: proto.Status, guid?: string) {
        const encodeReq = proto.Network.encode({ status: { version: 0, networkid: "hycon" } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendStatusReturn(s: proto.Status, guid?: string) {
        const encodeReq = proto.Network.encode({ statusReturn: { success: true, status: s } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // ping
    public async ping(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendPing(guid)
            logger.debug(`SendPing=${guid.toString()} Jobs =${this.jobs.size}`)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    public sendPing(guid?: string) {
        const encodeReq = proto.Network.encode({ ping: { nonce: this.nonce++ } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendPingReturn(userNonce: number, guid?: string) {
        const encodeReq = proto.Network.encode({ pingReturn: { nonce: userNonce } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // putTx
    public async putTxs(txs: SignedTx[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendPutTx(txs, guid)
            this.jobs.set(guid, { resolve, reject })
        })

    }
    public sendPutTx(txs: SignedTx[], guid?: string) {
        const encodeReq = proto.Network.encode({ putTx: { txs } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendPutTxReturn(success: boolean, guid?: string) {
        const encodeReq = proto.Network.encode({ putTxReturn: { success } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // get txs
    public async getTxs(minFee: number): Promise<SignedTx[]> {
        return new Promise<SignedTx[]>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendGetTxs(minFee, guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    public sendGetTxs(minFee: number, guid?: string) {
        const encodeReq = proto.Network.encode({ getTxs: { minFee } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetTxsReturn(success: boolean, txs: Tx[], guid?: string) {
        const encodeReq = proto.Network.encode({ getTxsReturn: { success, txs: [] } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // putBlock
    public async putBlocks(blocks: Block[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendPutBlock(blocks, guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }
    public sendPutBlock(blocks: Block[], guid?: string) {
        const encodeReq = proto.Network.encode({ putBlock: { blocks } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendPutBlockReturn(success: boolean, guid?: string) {
        const encodeReq = proto.Network.encode({ putBlockReturn: { success } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // get blocks by hash
    public async getBlocksByHashes(hash: any[]): Promise<Block[]> {
        return new Promise<Block[]>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendGetBlocksByHash([], guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    public sendGetBlocksByHash(hashes: Uint8Array[], guid?: string) {
        const encodeReq = proto.Network.encode({ getBlocksByHash: { hashes } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetBlocksByHashReturn(success: boolean, blocks: Block[], guid?: string) {
        const encodeReq = proto.Network.encode({ getBlocksByHashReturn: { success, blocks } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetHeadersByHashes(hashes: Uint8Array[], guid?: string) {
        const encodeReq = proto.Network.encode({ getHeadersByHash: { hashes } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetHeadersByHashReturn(success: boolean, headers: BlockHeader[], guid?: string) {
        const encodeReq = proto.Network.encode({ getHeadersByHashReturn: { success, headers } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    // get blocks  by range
    public getBlocksByRange(fromHeight: number, count: number, guid?: string): Promise<Block[]> {
        return new Promise<Block[]>((resolve, reject) => {
            this.sendGetBlocksByRange(fromHeight, count, guid)
            this.jobs.set(guid, { resolve, reject })
        })

    }

    public sendGetBlocksByRange(fromHeight: number, count: number, guid?: string) {
        const encodeReq = proto.Network.encode({ getBlocksByRange: { fromHeight, count } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetBlocksByRangeReturn(success: boolean, blocks: Block[], guid?: string) {
        const encodeReq = proto.Network.encode({ getBlocksByRangeReturn: { success, blocks } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public async getHeadersByHashes(hash: any[]): Promise<AnyBlockHeader[]> {
        return new Promise<AnyBlockHeader[]>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendGetHeadersByHashes(hash, guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    public async getHeadersByRange(fromHeight: number, count: number): Promise<AnyBlockHeader[]> {
        return new Promise<AnyBlockHeader[]>((resolve, reject) => {
            const guid = this.makeGuid()
            this.sendGetHeadersByRange(fromHeight, count, guid)
            this.jobs.set(guid, { resolve, reject })
        })
    }

    public sendGetHeadersByRange(fromHeight: number, count: number, guid?: string) {
        const encodeReq = proto.Network.encode({ getHeadersByRange: { fromHeight, count } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetHeadersByRangeReturn(success: boolean, headers: BlockHeader[], guid?: string) {
        const encodeReq = proto.Network.encode({ getHeadersByRangeReturn: { success, headers } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public sendGetPeers(count: number) {
        const encodeReq = proto.Network.encode({ getPeers: { count } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetPeersReturn(success: boolean, peers: proto.Peer[], guid?: string) {
        const encodeReq = proto.Network.encode({ getPeersReturn: { success, peers } }).finish()
        this.sendBuffer(encodeReq, guid)
    }

    public setConnectedCallback(callback: () => void) {
        this.connectedCallback = callback
    }

    public async parsePacket(packet: Packet): Promise<any> {
        const data = packet.popBuffer()
        const res = proto.Network.decode(data)
        const guid = packet.getGuid()
        await this.onReceiveMessage(packet, res, guid)
    }

    public onReceiveMessage(packet: Packet, res: proto.Network, guid: string) {
        if (res.status) {
            logger.debug(`Status = ${JSON.stringify(res.status)}`)
        }
        if (res.ping) {
            const userNonce = Number(res.ping.nonce.toString()) + 3000
            // logger.debug(`Ping Nonce = ${res.ping.nonce}`)
            logger.debug(`OnReceive Ping=${guid.toString()} Jobs =${this.jobs.size}`)
            this.sendPingReturn(userNonce, guid)
        }
        if (res.pingReturn) {
            logger.debug(`OnReceive PingReturn=${guid.toString()} Jobs =${this.jobs.size}`)
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                this.jobs.delete(guid)
                cb.resolve(res.pingReturn.nonce)
            }
            logger.debug(`Ping Response Nonce = ${res.pingReturn.nonce}`)
        }
        if (res.putTx) {
            logger.debug(`PutTx = ${JSON.stringify(res.putTx.txs)}`)
            this.sendPutTxReturn(true, guid)
        }
        if (res.putTxReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.putTxReturn.success)
            }
            // logger.debug(`PutTx Response Success = ${ res.putTxReturn.success }`)
        }

        if (res.getTxs) {
            this.sendGetTxsReturn(true, [], guid)
        }
        if (res.getTxsReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.getTxsReturn.txs)
            }
            logger.debug(`GetTxsReturn Response Success = ${res.getTxsReturn.success}`)
        }

        if (res.putBlock) {
            logger.debug(`PutBlock = ${JSON.stringify(res.putBlock.blocks)}`)
            const m = res.putBlock.blocks[0].miner
            this.sendPutBlockReturn(true, guid)
        }
        if (res.putBlockReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.putBlockReturn.success)
            }

            logger.debug(`PutBlock Response Success = ${res.putBlockReturn.success}`)
        }

        if (res.getBlocksByHash) {
            logger.debug(`getBlocksByHash = ${JSON.stringify(res.getBlocksByHash.hashes)}`)
            this.sendGetBlocksByHashReturn(true, [], guid)
        }
        if (res.getBlocksByHashReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.getBlocksByHashReturn.blocks)
            }

            logger.debug(`getBlocksByHashReturn Response Success = ${res.getBlocksByHashReturn.success}`)
        }

        if (res.getHeadersByHash) {
            logger.debug(`getHeadersByHash = ${JSON.stringify(res.getHeadersByHash.hashes)}`)
            this.sendGetHeadersByHashReturn(true, [], guid)
        }
        if (res.getHeadersByHashReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.getHeadersByHashReturn.headers)
            }
            logger.debug(`getHeadersByHashReturn Response Success = ${res.getHeadersByHashReturn.success}`)
        }

        if (res.getBlocksByRange) {
            logger.debug(`getBlocksByRange = ${JSON.stringify(res.getBlocksByRange)}`)
            this.sendGetBlocksByRangeReturn(true, [], guid)
        }
        if (res.getBlocksByRangeReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.getBlocksByRangeReturn.blocks)
            }

            logger.debug(`getBlocksByRangeReturn Response Success = ${res.getBlocksByRangeReturn.success}`)
        }

        if (res.getHeadersByRange) {
            logger.debug(`getHeadersByRange = ${JSON.stringify(res.getHeadersByRange)}`)
            this.sendGetHeadersByRangeReturn(true, [], guid)
        }
        if (res.getHeadersByRangeReturn) {
            if (this.jobs.has(guid)) {
                const cb = this.jobs.get(guid)
                cb.resolve(res.getHeadersByRangeReturn.headers)
            }
            logger.debug(`getHeadersByRangeReturn Response Success = ${res.getHeadersByRangeReturn.success}`)
        }

    }

    public getPeers(count: number): Promise<proto.IPeer[]> {
        // TODO
        throw new Error("Method not implemented.")
    }
    public getTip(): { hash: Hash; height: number; } {
        // TODO
        throw new Error("Method not implemented.")
    }
    public putHeaders(header: AnyBlockHeader[]): Promise<boolean> {
        // TODO
        throw new Error("Method not implemented.")
    }
    public getHash(height: number): Promise<Hash> {
        throw new Error("Method not implemented.")
    }
}
