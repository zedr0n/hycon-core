import { getLogger } from "log4js"
import { Socket } from "net"
import * as net from "net"
import { setTimeout } from "timers"
import { IGetBlocksByHashReturn, IGetHeadersByHashReturn } from "../../serialization/proto"
import { IGetBlocksByRangeReturn, IGetHeadersByRangeReturn } from "../../serialization/proto"
import { Block, BlockHeader, GetTxsReturn, IGetTxsReturn, IStatus } from "../../serialization/proto"
import { IPingReturn, IPutTxReturn, Ping, PingReturn, PutTx, PutTxReturn, Tx } from "../../serialization/proto"
import { GetHeadersByHashReturn, IPutBlockReturn, PutBlock, PutBlockReturn } from "../../serialization/proto"
import * as proto from "../../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { Packet } from "./packet"
import { IPeer } from "./peer"
import { PeerBasic, PeerMode, PeerState } from "./peerBasic"
const delay = require("delay")
const logger = getLogger("NetPeer")
logger.level = "debug"

export abstract class PeerNet extends PeerBasic implements IPeer {
    private static MaxTryCount = 20
    private static PollingStep = 100  // milli seconds

    protected status: IStatus
    protected pingReturn: IPingReturn
    protected putTxReturn: IPutTxReturn
    protected getTxsReturn: IGetTxsReturn
    protected putBlockReturn: IPutBlockReturn
    protected getBlocksByHashReturn: IGetBlocksByHashReturn
    protected getHeadersByHashReturn: IGetHeadersByHashReturn
    protected getBlocksByRangeReturn: IGetBlocksByRangeReturn
    protected getHeadersByRangeReturn: IGetHeadersByRangeReturn
    // callbacks

    protected nonce: number = 100

    constructor(server: AppNetwork, socket: Socket, mode: PeerMode) {
        super(socket, mode)
        this.server = server

    }

    public close() {
        logger.info(`Replier Gracefullly Closed`)

        switch (this.peerMode) {
            case PeerMode.AcceptedSession:
                this.server.removePeer(this)
                break

            case PeerMode.ConnectedSession:
                setTimeout(() => {
                    this.reconnect()
                }, 2000)
                this.state = PeerState.Disconnected
                break
        }

    }

    public async parsePacket(packet: Packet): Promise<any> {
        const data = packet.popBuffer()
        const res = proto.Node.decode(data)

        this.onReceiveMessage(res)
    }

    abstract public onReceiveMessage(res: proto.Node): void

    // send status
    public sendStatus(block: proto.Status) {
        const encodeReq = proto.Node.encode({ status: { version: 0, networkid: "hycon" } }).finish()
        this.sendBuffer(encodeReq)
    }

    // ping
    public async ping(): Promise<PingReturn> {
        this.sendPing()
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.pingReturn) {
                const ret = this.pingReturn
                this.pingReturn = undefined
                return ret
            }
        }
        throw new Error(`Ping Error`)
    }

    public sendPing() {
        const encodeReq = proto.Node.encode({ ping: { nonce: this.nonce++ } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendPingReturn(userNonce: number) {
        const encodeReq = proto.Node.encode({ pingReturn: { nonce: userNonce } }).finish()
        this.sendBuffer(encodeReq)
    }

    // putTx
    public async putTx(tx: Tx): Promise<boolean> {
        this.sendPutTx(tx)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.putTxReturn) {
                const ret = this.putTxReturn.success
                this.putTxReturn = undefined
                return ret
            }
        }
        throw new Error(`PutTx Error`)
    }
    public sendPutTx(tx: Tx) {
        const encodeReq = proto.Node.encode({ putTx: { txs: [tx] } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendPutTxReturn(success: boolean) {
        const encodeReq = proto.Node.encode({ putTxReturn: { success } }).finish()
        this.sendBuffer(encodeReq)
    }

    // get txs
    public async getTxs(minFee: number): Promise<proto.ITx[]> {
        this.sendGetTxs(minFee)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.getTxsReturn) {
                const ret = this.getTxsReturn.txs
                this.getTxsReturn = undefined
                return ret
            }
        }
        throw new Error(`getTxs Error`)
    }

    public sendGetTxs(minFee: number) {
        const encodeReq = proto.Node.encode({ getTxs: { minFee } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetTxsReturn(success: boolean, txs: Tx[]) {
        const encodeReq = proto.Node.encode({ getTxsReturn: { success, txs: [] } }).finish()
        this.sendBuffer(encodeReq)
    }

    // putBlock
    public async putBlock(tx: Block): Promise<boolean> {
        this.sendPutBlock(tx)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.putBlockReturn) {
                const ret = this.putBlockReturn.success
                this.putBlockReturn = undefined
                return ret
            }
        }
        throw new Error(`PutTx Error`)
    }
    public sendPutBlock(block: Block) {
        const encodeReq = proto.Node.encode({ putBlock: { blocks: [block] } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendPutBlockReturn(success: boolean) {
        const encodeReq = proto.Node.encode({ putBlockReturn: { success } }).finish()
        this.sendBuffer(encodeReq)
    }

    // get blocks by hash
    public async getBlocksByHash(hash: any[]): Promise<boolean> {
        this.sendGetBlocksByHash([])
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.getBlocksByHashReturn) {
                const ret = this.getBlocksByHashReturn.success
                this.putBlockReturn = undefined
                return ret
            }
        }
        throw new Error(`PutTx Error`)
    }

    public sendGetBlocksByHash(hashes: Uint8Array[]) {
        const encodeReq = proto.Node.encode({ getBlocksByHash: { hashes } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetBlocksByHashReturn(success: boolean, blocks: Block[]) {
        const encodeReq = proto.Node.encode({ getBlocksByHashReturn: { success, blocks } }).finish()
        this.sendBuffer(encodeReq)
    }

    // get headers by hash
    public async getHeadersByHash(hash: any[]): Promise<BlockHeader[]> {
        this.sendGetHeadersByHash(hash)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.getHeadersByHashReturn) {
                const ret: BlockHeader[] = []
                for (const v of this.getHeadersByHashReturn.headers) {
                    ret.push(new BlockHeader(v))
                }
                this.putBlockReturn = undefined
                return ret
            }
        }
        throw new Error(`PutTx Error`)
    }

    public sendGetHeadersByHash(hashes: Uint8Array[]) {
        const encodeReq = proto.Node.encode({ getHeadersByHash: { hashes } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetHeadersByHashReturn(success: boolean, headers: BlockHeader[]) {
        const encodeReq = proto.Node.encode({ getHeadersByHashReturn: { success, headers } }).finish()
        this.sendBuffer(encodeReq)
    }

    // get blocks  by range
    public async getBlocksByRange(fromHeight: number, count: number): Promise<IBlock[]> {
        this.sendGetBlocksByRange(fromHeight, count)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.getBlocksByRangeReturn) {
                const ret = this.getBlocksByRangeReturn.blocks
                this.getBlocksByRangeReturn = undefined
                return ret
            }
        }
        throw new Error(`getBlocksByRange Error`)
    }

    public sendGetBlocksByRange(fromHeight: number, count: number) {
        const encodeReq = proto.Node.encode({ getBlocksByRange: { fromHeight, count } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetBlocksByRangeReturn(success: boolean, blocks: Block[]) {
        const encodeReq = proto.Node.encode({ getBlocksByRangeReturn: { success, blocks } }).finish()
        this.sendBuffer(encodeReq)
    }

    // get headers  by range
    public async getHeadersByRange(fromHeight: number, count: number): Promise<proto.IBlockHeader[]> {
        this.sendGetHeadersByRange(fromHeight, count)
        let i = PeerNet.MaxTryCount
        while (i-- > 0) {
            await delay(PeerNet.PollingStep)
            if (this.getHeadersByRangeReturn) {
                const ret = this.getHeadersByRangeReturn.headers
                this.getHeadersByRangeReturn = undefined
                return ret
            }
        }
        throw new Error(`getHeadersByRange Error`)
    }
    public sendGetHeadersByRange(fromHeight: number, count: number) {
        const encodeReq = proto.Node.encode({ getHeadersByRange: { fromHeight, count } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetHeadersByRangeReturn(success: boolean, headers: BlockHeader[]) {
        const encodeReq = proto.Node.encode({ getHeadersByRangeReturn: { success, headers } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetPeers(count: number) {
        const encodeReq = proto.Node.encode({ getPeers: { count } }).finish()
        this.sendBuffer(encodeReq)
    }

    public sendGetPeersReturn(success: boolean, peers: proto.Peer[]) {
        const encodeReq = proto.Node.encode({ getPeersReturn: { success, peers } }).finish()
        this.sendBuffer(encodeReq)
    }

    public setConnectedCallback(callback: () => void) {
        this.connectedCallback = callback
    }

}
