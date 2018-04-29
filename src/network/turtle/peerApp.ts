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

}
