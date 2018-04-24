import { getLogger } from "log4js"
import * as net from "net"
import { Socket } from "net"
import { setTimeout } from "timers"
import { Ping, PingReturn } from "../serialization/proto"
import * as proto from "../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { BasicPeer, PeerMode, PeerState } from "./basicPeer"
import { Packet } from "./packet"
import { IPeer } from "./peer"
const delay = require("delay")
const logger = getLogger("AppPeer")
logger.level = "debug"

export class AppPeer extends BasicPeer implements IPeer {
    public static MaxTryCount = 20
    public static PollingStep = 100  // milli seconds

    public pingReturn: PingReturn

    constructor(server: AppNetwork, socket: Socket, mode: PeerMode) {
        super(socket, mode)
        this.server = server

    }

    public close() {
        logger.info(`Replier Gracefullly Closed`)

        switch (this.peerMode) {
            case PeerMode.AcceptedSession:
                this.server.removePeer(this as AppPeer)
                break

            case PeerMode.ConnectedSession:
                setTimeout(() => {
                    this.reconnect()
                }, 2000)
                this.state = PeerState.Disconnected
                break
        }

    }

    public onConnected() {
        logger.debug(`OnConnected`)
        setInterval(() => {
            this.test()
        }, 1000)
    }

    public async test() {
        const result = await this.ping()
        logger.debug(`Ping Result Nonce=${result.nonce}`)

    }

    public async ping(): Promise<PingReturn> {
        this.sendPing()
        let i = AppPeer.MaxTryCount
        while (i-- > 0) {
            await delay(AppPeer.PollingStep)
            if (this.pingReturn) {
                const ret = this.pingReturn
                this.pingReturn = undefined
                return ret
            }
        }
        throw new Error(`Ping Error`)
    }
    public putTx(tx: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getTxs(minFee?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public putBlock(block: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getBlocksByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getHeaderByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getBlocksRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public getHeadersRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }

    public async parsePacket(packet: Packet): Promise<any> {
        const data = packet.popBuffer()
        const res = proto.Node.decode(data)
        if (res.ping) {
            const userNonce = Number(res.ping.nonce.toString()) + 3000
            logger.debug(`Ping Nonce=${res.ping.nonce}`)

            this.sendPingResponse(userNonce)
        }
        if (res.pingResponse) {
            this.pingReturn = res.pingResponse
            logger.debug(`Ping Response Nonce=${res.pingResponse.nonce}`)
        }
    }

    public nonce: number = 100
    public sendPing() {
        const encodeReq = proto.Node.encode({ ping: { nonce: this.nonce++ } }).finish()
        const newPacket = new Packet()
        newPacket.pushBuffer(new Buffer(encodeReq))
        const encoded = newPacket.pack()
        this.socket.write(encoded)
    }

    public sendPingResponse(userNonce: number) {
        const encodeReq = proto.Node.encode({ pingResponse: { nonce: userNonce } }).finish()
        const newPacket = new Packet()
        newPacket.pushBuffer(new Buffer(encodeReq))
        const encoded = newPacket.pack()
        this.socket.write(encoded)
    }
}
