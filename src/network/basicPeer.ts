import { getLogger } from "log4js"
import * as net from "net"
import { Socket } from "net"
import { AppNetwork } from "./appNetwork"
import { Packet } from "./packet"
import { IPeer } from "./peer"
import { SocketBuffer } from "./socketBuffer"

const logger = getLogger("Network")

export enum PeerMode {
    AcceptedSession = 0,
    ConnectedSession,
}

export enum PeerState {
    Disconnected = 0,
    Connecting,
    Connected,
}

export abstract class BasicPeer {
    public server: AppNetwork
    public socket: Socket
    public socketBuffer = new SocketBuffer
    public peerMode: PeerMode = PeerMode.AcceptedSession

    public ip: string
    public port: number
    public state: PeerState = PeerState.Connected

    protected connectedCallback: () => void = undefined

    constructor(socket: Socket, mode: PeerMode) {
        this.peerMode = mode
        this.initializeSocket(socket)
        this.socketBuffer.packetCallback = (packet: Packet) => {
            this.parsePacket(packet)
        }
    }

    public abstract async parsePacket(packet: Packet): Promise<any>

    public intializeClient(ip: string, port: number) {
        this.ip = ip
        this.port = port
        this.initializeSocket(new Socket())

        this.state = PeerState.Disconnected
        setInterval(() => { this.polling() }, 1000)
        this.connect()
    }

    public connect() {
        this.socket.connect(this.port, this.ip, () => {
            this.state = PeerState.Connected
            this.onConnected()
        })
        this.state = PeerState.Connecting
    }

    // on connect
    public onConnected() {
        if (this.connectedCallback) {
            this.connectedCallback()
        }
    }

    public reconnect() {
        this.initializeSocket(new Socket())
        this.connect()
    }

    public polling() {
        if (this.peerMode === PeerMode.AcceptedSession) {
            return
        }

        switch (this.state) {
            case PeerState.Disconnected:
                break
            case PeerState.Connected:
                // this.sendPing()
                break
            case PeerState.Connecting:
                break
        }
    }

    public initializeSocket(socket: Socket) {
        this.socket = socket
        if (this.socket) {
            this.socket.on("close", () => { this.close() })
            this.socket.on("error", (error) => { this.error(error) })
            this.socket.on("data", (data: Buffer) => {
                this.data(data)
            })
        }

    }
    public data(data: Buffer) {
        // logger.debug(`Received=${data}`)
        this.socketBuffer.receive(data)
    }
    public abstract close(): void
    public error(error: Error) {
        logger.error(`${error}`)
    }

    public sendBuffer(encodeReq: Uint8Array) {
        const newPacket = new Packet()
        newPacket.pushBuffer(new Buffer(encodeReq))
        const encoded = newPacket.pack()
        this.socket.write(encoded)
    }

}
