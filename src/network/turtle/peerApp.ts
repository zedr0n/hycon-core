import { getLogger } from "log4js"
import { Socket } from "net"
import * as net from "net"
import { setTimeout } from "timers"
import { ITxPool } from "../../common/itxPool"
import { IConsensus } from "../../consensus/iconsensus"
import { Block, BlockHeader } from "../../serialization/proto"
import * as proto from "../../serialization/proto"
import { GetHeadersByHashReturn, IPutBlockReturn, PutBlock, PutBlockReturn } from "../../serialization/proto"
import { IPingReturn, IPutTxReturn, Ping, PingReturn, PutTx, PutTxReturn, Tx } from "../../serialization/proto"
import { Server } from "../../server"
import { IPeer } from "../ipeer"
import { Packet } from "./packet"
import { PeerBasic, PeerMode, PeerState } from "./peerBasic"
import { PeerNet } from "./peerNet"
import { TurtleNetwork } from "./turtleNetwork"

// tslint:disable-next-line:no-var-requires
const delay = require("delay")
const logger = getLogger("AppPeer")
logger.level = "debug"

export class PeerApp extends PeerNet {
    private consensus: IConsensus
    private txPool: ITxPool

    private server: Server
    constructor(server: TurtleNetwork, socket: Socket, mode: PeerMode) {
        super(server, socket, mode)
        this.server = server.server

        if (this.network.consensus) {
            this.consensus = this.network.consensus
        }
        if (this.server) {
            this.txPool = this.server.txPool
        }
    }

    public async onReceivePutTx(packet: Packet, res: proto.Network) {
        try {
            logger.debug(`onReceivePutTx ${res.putTx.txs[0].amount}`)
            await this.txPool.putTxs([])
            this.sendPutTxReturn(true)
            // broadcast to others
            this.network.broadcastPacket(packet)
        } catch (err) {
            // no relay
            this.sendPutTxReturn(false)
        }
    }
    public async onReceivePutBlock(packet: Packet, res: proto.Network) {
        try {
            logger.debug(`onReceivePutBlock  TxCount=${res.putBlock.blocks[0].txs.length}`)
            /*for (const block of res.putBlock.blocks) {
                await this.consensus.putBlock(block)
            }*/
            this.sendPutBlockReturn(true)
            // broadcast to others
            this.network.broadcastPacket(packet)
        } catch (err) {
            // no relay
            this.sendPutBlockReturn(false)
        }
    }

    public async onReceiveGetTxs(packet: Packet, res: proto.Network) {
        try {
            const txs: Tx[] = []
            this.sendGetTxsReturn(true, txs)
        } catch (err) {
            this.sendGetTxsReturn(false, [])
        }
    }
    public async onReceiveGetBlocksByHash(packet: Packet, res: proto.Network) {
        const hashes = res.getBlocksByHash.hashes
        const blocks: any[] = []
        try {
            this.sendGetBlocksByHashReturn(true, blocks)
        } catch (err) {
            this.sendGetBlocksByHashReturn(false, [])
        }
    }
    public async onReceiveGetHeadersByHash(packet: Packet, res: proto.Network) {
        const hashes = res.getHeadersByHash.hashes
        const headers: any[] = []
        try {
            this.sendGetHeadersByHashReturn(true, headers)
        } catch (err) {
            this.sendGetHeadersByHashReturn(false, [])
        }
    }

    public async onReceiveGetBlocksByRange(packet: Packet, res: proto.Network) {
        try {
            this.sendGetBlocksByRangeReturn(true, [])
        } catch (err) {
            this.sendGetBlocksByRangeReturn(false, [])
        }
    }
    public async onReceiveGetHeadersByRange(packet: Packet, res: proto.Network) {
        try {

            this.sendGetHeadersByRangeReturn(true, [])
        } catch (err) {
            this.sendGetHeadersByRangeReturn(false, [])
        }
    }
    public async onReceiveGetPeers(packet: Packet, res: proto.Network) {
        const peers: proto.Peer[] = []
        this.sendGetPeersReturn(true, peers)
    }
    public async onReceiveMessage(packet: Packet, res: proto.Network) {
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
