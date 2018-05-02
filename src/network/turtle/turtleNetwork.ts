import { getLogger } from "log4js"
import * as net from "net"
import * as proto from "../../serialization/proto"
import { INetwork } from "../inetwork"
import { PeerApp } from "./peerApp"
const logger = getLogger("Network")
import { EPROTO } from "constants"
import { Socket } from "net"
import { IConsensus } from "../../consensus/iconsensus"
import { Server } from "../../server"
import { IPeer } from "../ipeer"
import { UpnpClient, UpnpServer } from "../upnp"
import { Packet } from "./packet"
import { PeerBasic, PeerMode } from "./peerBasic"

export class TurtleNetwork implements INetwork {
    public static defaultPort = 8148
    public server: Server
    public tcp: net.Server
    public port: number = -1
    public peers: PeerApp[] = []
    public clientTable: any = {}
    public upnpServer: UpnpServer
    public upnpClient: UpnpClient
    public consensus: IConsensus

    constructor(port: number, server: Server) {
        if (port) {
            this.port = port
        } else {
            this.port = 8148
        }
        if (server) {
            this.server = server
        }
        logger.debug(`TcpNetwork Port=${port}`)
    }
    public async start(): Promise<boolean> {
        // connect
        if (this.server) {
            this.consensus = this.server.consensus
        }

        logger.debug(`Tcp Network Started`)
        this.tcp = net.createServer()
        this.tcp.listen(this.port, () => {
            logger.info(`Listening ${this.port}`)
        })
        this.tcp.on("error", (error) => { logger.error(`${error}`) })
        this.tcp.on("connection", (socket) => {
            this.addPeer(socket)
        })

        // upnp
        this.upnpServer = new UpnpServer(this.port)
        this.upnpClient = new UpnpClient(this)

        // add peer
        if (this.server) {
            const peers = this.server.options.peer
            for (const peer of peers) {
                const args = peer.split(":")
                const ip = args[0]
                const port = args[1]
                logger.info(`IP=${ip}  PORT=${port}`)
                // serverOption.peer.push({ ip, port })
                this.addClient(ip, port)
            }
        }

        setInterval(() => {
            this.polling()
        }, 10000)
        return true
    }

    public polling() {
        logger.debug(`------------------Peers Count=${this.peers.length}`)

        let index = 1
        for (const a of this.peers) {
            logger.debug(`${index} Local=${a.socket.localAddress}:${a.socket.localPort}  Remote=${a.socket.remoteAddress}:${a.socket.remotePort} `)
            index++
        }
    }

    public addPeer(socket: Socket) {
        const newone = new PeerApp(this, socket, PeerMode.AcceptedSession)
        newone.onConnected()
        this.peers.push(newone)
    }

    public async addClient(ip: string, port: number): Promise<IPeer> {
        const k = Buffer.from(`${ip}:${port}`).toString()
        if (k in this.clientTable) {
            logger.debug(`${k} Already Exists`)
            return
        }
        logger.debug(`AddClient=${k}`)
        const newone = new PeerApp(this, null, PeerMode.ConnectedSession)
        newone.intializeClient(ip, port)
        this.peers.push(newone)
        this.clientTable[k] = k
        return newone
    }

    public removePeer(one: PeerBasic) {
        const newones: PeerApp[] = []
        for (const a of this.peers) {
            if (a !== one) {
                newones.push(a)
            }
        }
        // remove!
        this.peers = newones
    }

    public getRandomPeer(): IPeer {
        throw new Error("Method not implemented.")
    }
    public getRandomPeers(count: number): IPeer[] {
        return []
    }

    public broadcastPacket(newPacket: Packet): void {
        for (const p of this.peers) {
            p.sendPacket(newPacket)
        }
    }

    public broadcast(newPacket: Uint8Array): void {
        for (const p of this.peers) {
            p.sendBuffer(newPacket)
        }
    }
}
