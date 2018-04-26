import { getLogger } from "log4js"
import { Socket } from "net"
import { resolve } from "url"
import * as proto from "../../serialization/proto"
import { SocketBuffer } from "./socketBuffer"

const logger = getLogger("Network")

type replyResolve = (reply: proto.IReply) => void
type replyReject = (reason?: any) => void
export abstract class BasePeer {
    public socketBuffer: SocketBuffer
    private replyId: number
    private replyMap: Map<number, { resolved: replyResolve, reject: replyReject }>

    constructor(socket: Socket) {
        this.replyId = 1
        this.replyMap = new Map()
        this.socketBuffer = new SocketBuffer(socket, (route, buffer) => this.onPacket(route, buffer))
        socket.on("close", () => this.close())
    }

    protected async onPacket(route: number, buffer: Buffer): Promise<void> {
        logger.info(`Recieved packet route ${route}, ${buffer.length} bytes`)
        try {
            const res = proto.Node.decode(buffer)
            // tslint:disable-next-line:no-console
            console.log(res)
            switch (res.message) {
                case "request":
                    this.respond(route, res.request)
                    break
                case "reply":
                    this.route(route, res.reply)
                    break
            }
        } catch (e) {
            this.protocolError()
        }
    }

    protected abstract async respond(route: number, request: proto.Request | proto.IRequest): Promise<void>

    protected async route(route: number, reply: proto.Reply | proto.IReply): Promise<void> {
        const { resolved } = this.replyMap.get(route)
        resolved(reply)
    }

    protected async sendRequest(request: proto.IRequest): Promise<proto.IReply> {
        const id = this.newReplyID()
        const reply = await new Promise<proto.IReply>((resolved, reject) => {
            this.replyMap.set(id, { resolved, reject })
            this.send(id, { request })
        })
        this.replyMap.delete(id)
        return reply
    }
    protected sendReply(id: number, reply: proto.IReply): void {
        this.send(id, { reply })
    }

    protected send(route: number, data: proto.INode): void {
        const buffer: any = proto.Node.encode(data).finish()
        logger.info(`Sending ${buffer.length} bytes`)
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
