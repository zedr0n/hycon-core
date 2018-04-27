import { getLogger } from "log4js"
import * as net from "net"
import { Socket } from "net"
import { setTimeout } from "timers"
import { Block, BlockHeader } from "../../serialization/proto"
import { IPingReturn, IPutTxReturn, Ping, PingReturn, PutTx, PutTxReturn, Tx } from "../serialization/proto"
import { GetHeadersByHashReturn, IPutBlockReturn, PutBlock, PutBlockReturn } from "../serialization/proto"
import * as proto from "../../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { Packet } from "./packet"
import { IPeer } from "./peer"
import { PeerBasic, PeerMode, PeerState } from "./peerBasic"
import { PeerNet } from "./peerNet"

const delay = require("delay")
const logger = getLogger("AppPeer")
logger.level = "debug"

export class PeerApp extends PeerNet {
    constructor(server: AppNetwork, socket: Socket, mode: PeerMode) {
        super(server, socket, mode)

    }

    public onReceiveMessage(res: proto.Node) {

        if (res.status) {
            logger.debug(`Status=${JSON.stringify(res.status)}`)
        }
        if (res.ping) {
            const userNonce = Number(res.ping.nonce.toString()) + 3000
            logger.debug(`Ping Nonce=${res.ping.nonce}`)
            this.sendPingReturn(userNonce)
        }
        if (res.pingReturn) {
            this.pingReturn = res.pingReturn
            logger.debug(`Ping Response Nonce=${res.pingReturn.nonce}`)
        }

        if (res.putTx) {
            logger.debug(`PutTx=${JSON.stringify(res.putTx.txs)}`)
            this.sendPutTxReturn(true)
        }
        if (res.putTxReturn) {
            this.putTxReturn = res.putTxReturn
            logger.debug(`PutTx Response Success=${res.putTxReturn.success}`)
        }

        if (res.getTxs) {
            this.sendGetTxsReturn(true, [])
        }
        if (res.getTxsReturn) {
            this.getTxsReturn = res.getTxsReturn
            logger.debug(`GetTxsReturn Response Success=${res.getTxsReturn.success}`)
        }

        if (res.putBlock) {
            logger.debug(`PutBlock=${JSON.stringify(res.putBlock.blocks)}`)
            const m = res.putBlock.blocks[0].miner
            logger.debug(`miner=${Buffer.from(m).toString()}`)
            this.sendPutBlockReturn(true)
        }
        if (res.putBlockReturn) {
            this.putBlockReturn = res.putBlockReturn
            logger.debug(`PutBlock Response Success=${res.putBlockReturn.success}`)
        }

        if (res.getBlocksByHash) {
            logger.debug(`getBlocksByHash=${JSON.stringify(res.getBlocksByHash.hashes)}`)
            this.sendGetBlocksByHashReturn(true, [])
        }
        if (res.getBlocksByHashReturn) {
            this.getBlocksByHashReturn = res.getBlocksByHashReturn
            logger.debug(`getBlocksByHashReturn Response Success=${res.getBlocksByHashReturn.success}`)
        }

        if (res.getHeadersByHash) {
            logger.debug(`getHeadersByHash=${JSON.stringify(res.getHeadersByHash.hashes)}`)
            this.sendGetHeadersByHashReturn(true, [])
        }
        if (res.getHeadersByHashReturn) {
            this.getHeadersByHashReturn = res.getHeadersByHashReturn
            logger.debug(`getHeadersByHashReturn Response Success=${res.getHeadersByHashReturn.success}`)
        }

        if (res.getBlocksByRange) {
            logger.debug(`getBlocksByRange=${JSON.stringify(res.getBlocksByRange)}`)
            this.sendGetBlocksByRangeReturn(true, [])
        }
        if (res.getBlocksByRangeReturn) {
            this.getBlocksByRangeReturn = res.getBlocksByRangeReturn
            logger.debug(`getBlocksByRangeReturn Response Success=${res.getBlocksByRangeReturn.success}`)
        }

        if (res.getHeadersByRange) {
            logger.debug(`getHeadersByRange=${JSON.stringify(res.getHeadersByRange)}`)
            this.sendGetHeadersByRangeReturn(true, [])
        }
        if (res.getHeadersByRangeReturn) {
            this.getHeadersByRangeReturn = res.getHeadersByRangeReturn
            logger.debug(`getHeadersByRangeReturn Response Success=${res.getHeadersByRangeReturn.success}`)
        }

    }
}
