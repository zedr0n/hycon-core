import { getLogger } from "log4js"
import { Socket } from "net"
import { resolve } from "url"
import * as proto from "../../serialization/proto"
import { SocketParser } from "./socketBuffer"

const logger = getLogger("Network")

// tslint:disable-next-line:interface-name
interface ReplyAndPacket { reply: proto.Network, packet: Buffer }
type replyResolve = (reply: ReplyAndPacket) => void
type replyReject = (reason?: any) => void
export abstract class BasePeer {
    public socketBuffer: SocketParser
    private replyId: number
    private replyMap: Map<number, { resolved: replyResolve, reject: replyReject }>

    constructor(socket: Socket) {
        this.replyId = 1
        this.replyMap = new Map()
        this.socketBuffer = new SocketParser(socket, (route, buffer) => this.onPacket(route, buffer))
        socket.on("close", () => this.close())
    }
    public sendPacket(buffer: Buffer): void {
        this.socketBuffer.send(0, buffer)
    }

    protected async onPacket(route: number, packet: Buffer): Promise<void> {
        // logger.info(` route ${route}, ${packet.length} bytes`)
        try {
            const res = proto.Network.decode(packet)
            // tslint:disable-next-line:no-console
            console.log(res)
            switch (res.request) {
                case "status":
                case "ping":
                case "getTxs":
                case "putTx":
                case "putBlock":
                case "getBlocksByHash":
                case "getHeadersByHash":
                case "getBlocksByRange":
                case "getHeadersByRange":
                case "getPeers":
                    this.respond(route, res, packet)
                    break
                case "pingReturn":
                case "putTxReturn":
                case "getTxsReturn":
                case "putBlockReturn":
                case "getBlocksByHashReturn":
                case "getHeadersByHashReturn":
                case "getBlocksByRangeReturn":
                case "getHeadersByRangeReturn":
                case "getPeersReturn":
                    this.route(route, res, packet)
                    break
            }
        } catch (e) {
            this.protocolError()
        }
    }

    protected abstract async recieveBroadcast(request: proto.Network, packet: Buffer): Promise<void>

    protected abstract async respond(route: number, request: proto.Network, packet: Buffer): Promise<void>

    protected async route(route: number, reply: proto.Network, packet: Buffer): Promise<void> {
        try {
            const { resolved } = this.replyMap.get(route)
            resolved({ reply, packet })
        } catch (e) {
            this.protocolError()
        }
    }

    protected async sendRequest(request: proto.INetwork): Promise<ReplyAndPacket> {
        const id = this.newReplyID()
        const reply = await new Promise<ReplyAndPacket>((resolved, reject) => {
            this.replyMap.set(id, { resolved, reject })
            this.send(id, request)
        })
        this.replyMap.delete(id)
        return reply
    }

    protected send(route: number, data: proto.INetwork): void {
        const buffer: any = proto.Network.encode(data).finish()
        // logger.info(`Sending ${buffer.length} bytes`)
        this.socketBuffer.send(route, buffer)
    }

    protected protocolError() {
        this.socketBuffer.destroy()
    }

    private newReplyID(): number {
        if (this.replyId >= Number.MAX_SAFE_INTEGER) {
            this.replyId = 1
        }
        return this.replyId++
    }

    private close() {
        for (const [id, replyRoute] of this.replyMap) {
            replyRoute.reject("Disconnect")
        }
    }
}
