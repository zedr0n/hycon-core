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

    public async onReceiveMessage(packet: Packet, res: proto.Node) {
        if (res.putTx) {
            try {
                await this.txPool.putTxs(res.putTx.txs)
                this.sendPutTxReturn(true)
                // broadcast to others
                this.broadcast(packet)
            } catch (err) {
                // no relay
                this.sendPutTxReturn(false)
            }
        } else if (res.putBlock) {
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
        } else {
            super.onReceiveMessage(packet, res)
        }
    }
}
