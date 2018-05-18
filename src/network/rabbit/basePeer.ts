import { getLogger } from "log4js"
import { Socket } from "net"
import { resolve } from "url"
import * as proto from "../../serialization/proto"
import { SocketParser } from "./socketParser"

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
    public async sendPacket(buffer: Buffer): Promise<void> {
        return this.socketBuffer.send(0, buffer)
    }

    public disconnect() {
        this.socketBuffer.destroy()
    }

    protected onPacket(route: number, packet: Buffer): void {
        // logger.info(` route ${route}, ${packet.length} bytes`)
        try {
            const res = proto.Network.decode(packet)
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
                case "getTip":
                case "putHeaders":
                case "getHash":
                    this.respond(route, res, packet)
                    break
                case "statusReturn":
                case "pingReturn":
                case "putTxReturn":
                case "getTxsReturn":
                case "putBlockReturn":
                case "getBlocksByHashReturn":
                case "getHeadersByHashReturn":
                case "getBlocksByRangeReturn":
                case "getHeadersByRangeReturn":
                case "getPeersReturn":
                case "getTipReturn":
                case "putHeadersReturn":
                case "getHashReturn":
                    this.route(route, res, packet)
                    break
                default:
                    logger.debug(`Unsupported Protocol=${res.request}`)
                    break
            }
        } catch (e) {
            this.protocolError()
        }
    }

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
        try {
            return await new Promise<ReplyAndPacket>((resolved, reject) => {
                this.replyMap.set(id, { resolved, reject })
                this.send(id, request).catch(reject)
            })
        } finally {
            this.replyMap.delete(id)
        }
    }

    protected async send(route: number, data: proto.INetwork): Promise<void> {
        const buffer: any = proto.Network.encode(data).finish()
        return this.socketBuffer.send(route, buffer)
    }

    protected protocolError() {
        logger.fatal("Disconnecting due to protocol error")
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
