import { getLogger } from "log4js"
import { Socket } from "net"
import * as net from "net"
import { setTimeout } from "timers"
import { ITxPool } from "../../common/txPool"
import { IConsensus } from "../../consensus/consensus"
import { Block, BlockHeader } from "../../serialization/proto"
import * as proto from "../../serialization/proto"
import { Server } from "../../server"
import { GetHeadersByHashReturn, IPutBlockReturn, PutBlock, PutBlockReturn } from "../serialization/proto"
import { IPingReturn, IPutTxReturn, Ping, PingReturn, PutTx, PutTxReturn, Tx } from "../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { Packet } from "./packet"
import { IPeer } from "./peer"
import { PeerBasic, PeerMode, PeerState } from "./peerBasic"
import { PeerNet } from "./peerNet"

const delay = require("delay")
const logger = getLogger("AppPeer")
logger.level = "debug"

export class PeerApp extends PeerNet {
    private consensus: IConsensus
    private txPool: ITxPool

    private server: Server
    constructor(server: AppNetwork, socket: Socket, mode: PeerMode) {
        super(server, socket, mode)
        this.server = server.server

        if (this.network.consensus) {
            this.consensus = this.network.consensus
        }
        if (this.server) {
            this.txPool = this.server.txPool
        }
    }

    public async onReceivePutTx(packet: Packet, res: proto.Node) {
        try {
            logger.debug(`onReceivePutTx ${res.putTx.txs[0].amount}`)
            await this.txPool.putTxs(res.putTx.txs)
            this.sendPutTxReturn(true)
            // broadcast to others
            this.broadcast(packet)
        } catch (err) {
            // no relay
            this.sendPutTxReturn(false)
        }
    }
    public async onReceivePutBlock(packet: Packet, res: proto.Node) {
        try {
            for (const block of res.putBlock.blocks) {
                await this.consensus.putBlock(block)
            }
            this.sendPutBlockReturn(true)
            // broadcast to others
            this.broadcast(packet)
        } catch (err) {
            // no relay
            this.sendPutBlockReturn(false)
        }
    }

    public async onReceiveGetTxs(packet: Packet, res: proto.Node) {
        try {
            const txs: Tx[] = await this.server.txPool.getTxs(res.getTxs.minFee as number)
            this.sendGetTxsReturn(true, txs)
        } catch (err) {
            this.sendGetTxsReturn(false, [])
        }
    }
    public async onReceiveGetBlocksByHash(packet: Packet, res: proto.Node) {
        const hashes = res.getBlocksByHash.hashes
        const blocks: any[] = []
        try {
            for (const h of hashes) {
                const found = await this.consensus.getBlocksByHash(h)
                blocks.push(found)
            }
            this.sendGetBlocksByHashReturn(true, blocks)
        } catch (err) {
            this.sendGetBlocksByHashReturn(false, [])
        }
    }
    public async onReceiveGetHeadersByHash(packet: Packet, res: proto.Node) {
        const hashes = res.getHeadersByHash.hashes
        const headers: any[] = []
        try {
            for (const h of hashes) {
                const found = await this.consensus.getHeaderByHash(h)
                headers.push(found)
            }
            this.sendGetHeadersByHashReturn(true, headers)
        } catch (err) {
            this.sendGetHeadersByHashReturn(false, [])
        }
    }

    public async onReceiveGetBlocksByRange(packet: Packet, res: proto.Node) {
        try {
            const blocks = await this.consensus.getBlocksRange(
                res.getBlocksByRange.fromHeight as number,
                res.getBlocksByRange.count as number)
            this.sendGetBlocksByRangeReturn(true, blocks)
        } catch (err) {
            this.sendGetBlocksByRangeReturn(false, [])
        }
    }
    public async onReceiveGetHeadersByRange(packet: Packet, res: proto.Node) {
        try {
            const blocks = await this.consensus.getHeadersRange(
                res.getHeadersByRange.fromHeight as number,
                res.getHeadersByRange.count as number)
            this.sendGetHeadersByRangeReturn(true, blocks)
        } catch (err) {
            this.sendGetHeadersByRangeReturn(false, [])
        }
    }
    public async onReceiveGetPeers(packet: Packet, res: proto.Node) {
        const peers: proto.Peer[] = this.network.getPeers(res.getPeers.count as number)
        this.sendGetPeersReturn(true, peers)
    }
    public async onReceiveMessage(packet: Packet, res: proto.Node) {
        if (res.putTx) {
            await this.onReceivePutTx(packet, res)
        } else if (res.putBlock) {
            await this.onReceivePutBlock(packet, res)
        } else if (res.getTxs) {
            await this.onReceiveGetTxs(packet, res)
        } else if (res.getBlocksByHash) {
            await this.onReceiveGetBlocksByHash(packet, res)
        } else if (res.getHeadersByHash) {
            await this.onReceiveGetHeadersByHash(packet, res)
        } else if (res.getBlocksByRange) {
            await this.onReceiveGetBlocksByRange(packet, res)
        } else if (res.getHeadersByRange) {
            await this.onReceiveGetHeadersByRange(packet, res)
        } else if (res.getPeers) {
            await this.onReceiveGetPeers(packet, res)
        } else {
            super.onReceiveMessage(packet, res)
        }
    }
}
