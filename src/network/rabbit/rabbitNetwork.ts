import { getLogger } from "log4js"
import * as net from "net"
import { createConnection, createServer, Socket } from "net"
import { IConsensus } from "../../consensus/iconsensus"
import * as proto from "../../serialization/proto"
import { Server } from "../../server"
import { INetwork } from "../inetwork"
import { IPeer } from "../ipeer"
import { NatUpnp } from "../nat"
import { UpnpClient, UpnpServer } from "../upnp"
import { PeerList } from "./peerList"
import { RabbitPeer } from "./rabbitPeer"
import { SocketParser } from "./socketParser"
// tslint:disable-next-line:no-var-requires
const delay = require("delay")
const logger = getLogger("Network")
// tslint:disable-next-line:no-var-requires
const randomInt = require("random-int")
export class RabbitNetwork implements INetwork {
    public readonly port: number
    public isBootnode: boolean
    private hycon: Server
    private server: net.Server
    private peers: RabbitPeer[]
    private targetPeerCount: number

    private peerTable: Map<Buffer, RabbitPeer>

    private upnpServer: UpnpServer
    private upnpClient: UpnpClient
    private natUpnp: NatUpnp

    constructor(hycon: Server, port: number = 8148) {
        this.port = port
        this.targetPeerCount = 3
        this.hycon = hycon
        this.peerTable = new Map<Buffer, RabbitPeer>()
        this.isBootnode = false
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public broadcast(packet: Buffer, exempt: RabbitPeer): void {
        for (const [key, peer] of this.peerTable) {
            if (exempt !== peer) {
                peer.sendPacket(packet)
            }
        }
    }
    public async start(): Promise<boolean > {
        logger.debug(`Tcp Network Started`)
        this.server = createServer((socket) => this.accept(socket))
        await new Promise<boolean>((resolve, reject) => {
            this.server.once("error", reject)
            this.server.listen(this.port, () => {
                logger.info(`Listening ${this.port}`)
                resolve()
            })
        })

        this.server.on("error", (error) => logger.error(`${error}`))
        setInterval(() => logger.debug(`Peers Count=${this.peers.length}`), 5000)
        setInterval(() => { this.findPeers() }, 4000)

        // upnp
        this.upnpServer = new UpnpServer(this.port, this.hycon)
        this.upnpClient = new UpnpClient(this, this.hycon)
        // nat
        this.natUpnp = new NatUpnp(this.port, this)

        return true
    }

    public getRandomPeer(): IPeer {

    }
    public getRandomPeers(count: number = 1): IPeer[] {

    }

    public async connect(host: string, port: number): Promise < IPeer > {
        logger.log(`AddClient IP=${host} PORT=${port}`)
        return new Promise<IPeer>((resolved, reject) => {
            const key = 
            if (this.peerTable.has(key)) {
                reject(`${key} Already Exists`)
            }
            logger.info(`Attempting to connect to ${host}:${port}`)
            const socket = new Socket()
            socket.once("error", reject)
            socket.connect({ host, port }, () => {
                logger.info(`Connected to ${host}:${port}`)
                const peer = this.newConnection(key, socket)
                resolved(peer)
            })
        })
    }

    private accept(socket: Socket) {
        const key = 
        if (this.peerTable.has(key)) {
            socket.destroy()
            socket.unref()
        } else {
            this.newConnection(key, socket)
        }
    }

    private newConnection(key: Buffer, socket: Socket): RabbitPeer {
        const peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool)
        this.peerTable.set(key, peer)
        socket.on("close", (error) => { this.peerTable.delete(key) })
        socket.on("error", (error) => {
            logger.error(`Connection error ${socket.remoteAddress}:${socket.remotePort} : ${error}`)
        })

        peer.onConnected()
        return peer
    }

    private async findPeers() {
        const necessaryPeers = this.targetPeerCount - this.peerTable.size
        if (necessaryPeers <= 0) {
            return
        }
        // logger.debug(`Connect to Bootnodes For More Peers=${necessaryPeers}`)
        await delay(2000)
        // logger.debug(`Done`)
    }

}
