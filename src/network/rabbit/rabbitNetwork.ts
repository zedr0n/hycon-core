import { stat } from "fs"
import { getLogger } from "log4js"
import * as net from "net"
import { createConnection, createServer, Socket } from "net"
import { IConsensus } from "../../consensus/iconsensus"
import * as proto from "../../serialization/proto"
import { Server } from "../../server"
import { Hash } from "../../util/hash"
import { INetwork } from "../inetwork"
import { IPeer } from "../ipeer"
import { NatUpnp } from "../nat"
import { PeerDb } from "../peerDb"
import { UpnpClient, UpnpServer } from "../upnp"
import { RabbitPeer } from "./rabbitPeer"
// tslint:disable-next-line:no-var-requires
const delay = require("delay")
const logger = getLogger("Network")
// tslint:disable-next-line:no-var-requires
const randomInt = require("random-int")
export class RabbitNetwork implements INetwork {
    public static seeds: any[] = [
        { host: "rapid1.hycon.io", port: 8148 },
        { host: "rapid2.hycon.io", port: 8148 },
        { host: "rapid3.hycon.io", port: 8148 },
    ]
    public static failLimit: number
    public static isRemoteSocket(socket: net.Socket) {
        // TODO:
        // Local Ranges:
        // 172.16.0.0 – 172.31.255.255
        // 10.0.0.0 – 10.255.255.255
        // 192.168.0.0 – 192.168.255.255
        // 127.0.0.0 - 127.255.255.255
        // 0.0.0.0
        // fd00::/8
        if (socket.remoteFamily === "IPv4") { }
        if (socket.remoteFamily === "IPv6") { }
        return true
    }

    public static ipv6Toipv4(ipv6: string): string {
        const ip: string[] = ipv6.split(":")
        if (ip.length === 4) {
            return ip[3]
        } else { return ip[0] }
    }
    public readonly networkid: string = "hycon"
    public readonly version: number = 3
    public port: number // TODO: Set after portmap
    private hycon: Server
    private server: net.Server
    private peerDB: PeerDb

    private targetConnectedPeers: number
    private peers: Map<number, RabbitPeer>
    private connections: Map<number, proto.IPeer>
    private upnpServer: UpnpServer
    private upnpClient: UpnpClient
    private natUpnp: NatUpnp

    constructor(hycon: Server, port: number = 8148, peerDbPath: string = "deleteme.peer") {
        RabbitNetwork.failLimit = 10
        this.port = port
        this.targetConnectedPeers = 5
        this.hycon = hycon
        this.peers = new Map<number, RabbitPeer>()
        this.connections = new Map<number, proto.IPeer>()
        this.peerDB = new PeerDb()
        setImmediate(() => this.seedPeerDB())
        setInterval(() => this.seedPeerDB(), 1000 * 60 * 60 * 36)
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public getConnections(): proto.IPeer[] {
        return Array.from(this.connections.values())
    }

    public broadcast(packet: Buffer, exempt: RabbitPeer): void {
        for (const [key, peer] of this.peers) {
            if (exempt !== peer) {
                peer.sendPacket(packet).catch((e) => { logger.info(e) })
            }
        }
    }
    public async start(): Promise<boolean> {
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
        let useUpnp = true
        if (Server.globalOptions.disable_upnp) {
            useUpnp = false
        }

        if (useUpnp) {
            // upnp
            this.upnpServer = new UpnpServer(this.port, this.hycon)
            this.upnpClient = new UpnpClient(this, this.hycon)
            // nat
            this.natUpnp = new NatUpnp(this.port, this)
            await this.natUpnp.run()
        }

        await this.connectToPeer()

        setInterval(() => {
            logger.info(`Peers Count=${this.peers.size}  PeerDB Size= ${this.peerDB.peerCount()}`)
        }, 10 * 1000)

        // if (useUpnp) {
        //     setInterval(() => { this.findPeers() }, 10 * 1000)
        // }

        return true
    }

    public getRandomPeer(): IPeer {
        const index = Math.floor(Math.random() * this.peers.size)
        let cntr = 0
        for (const value of this.peers.values()) {
            if (cntr++ === index) {
                return value
            }
        }
    }

    public getRandomPeers(count: number = 1): IPeer[] {
        const randomList: number[] = []
        const iPeer: IPeer[] = []
        while (randomList.length < count) {
            const index = Math.floor(Math.random() * this.peers.size)
            if (randomList.indexOf(index) === -1) {
                randomList.push(index)
            }
        }

        let cntr = 0
        let index2 = 0
        for (const value of this.peers.values()) {
            if (cntr++ === randomList[index2]) {
                iPeer.push(value)
                index2 += 1
                if (index2 === randomList.length) { break }
            }
        }
        return iPeer
    }

    public async connect(host: string, port: number): Promise<RabbitPeer> {
        return new Promise<RabbitPeer>((resolved, reject) => {
            const ipeer = { host, port }
            const key = PeerDb.ipeer2key(ipeer)
            if (this.connections.has(key)) {
                return reject(`Already connected to ${host}:${port} `)
            }
            logger.info(`Attempting to connect to ${host}:${port}...`)
            const socket = new Socket()
            socket.once("error", async () => {
                try {
                    this.connections.delete(key)
                    logger.info(`Failed to connect to ${key}: ${host}:${port}`)
                    await this.peerDB.fail(ipeer, RabbitNetwork.failLimit)
                    reject()
                } catch (e) {
                    logger.debug(e)
                }
            })
            socket.connect({ host, port }, async () => {
                try {
                    logger.info(`Connected to ${key}: ${host}:${port}`)
                    const peer = await this.newConnection(socket)
                    await this.peerDB.seen(ipeer)
                    const peerStatus = await peer.status()
                    logger.info(`Peer ${key} ${socket.remoteAddress}:${socket.remotePort} Status=${JSON.stringify(peerStatus)}`)
                } catch (e) {
                    logger.debug(e)
                }
            })
        })
    }

    private async accept(socket: Socket): Promise<void> {
        try {
            logger.info(`Detect a incoming peer ${RabbitNetwork.ipv6Toipv4(socket.remoteAddress)}:${socket.remotePort}`)
            const peer = await this.newConnection(socket)
            const status = await peer.status()
            if (RabbitNetwork.isRemoteSocket(socket)) {
                await this.peerDB.seen({ host: socket.remoteAddress, port: status.port })
            }
        } catch (e) {
            logger.debug(e)
        }
    }

    // only connecting
    private async newConnection(socket: Socket): Promise<RabbitPeer> {
        const peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool, this.peerDB)
        const ipeer = { host: socket.remoteAddress, port: socket.remotePort }
        const key = PeerDb.ipeer2key(ipeer)
        this.peers.set(key, peer)
        this.connections.set(key, ipeer)
        socket.on("close", async (error) => {
            this.peers.delete(key)
            this.connections.delete(key)
            logger.error(`disconnected from ${key} ${ipeer.host}:${ipeer.port}`)

        })
        socket.on("error", async (error) => {
            logger.error(`Connection error ${key} ${ipeer.host}:${ipeer.port} : ${error}`)
        })
        return peer
    }

    private async connectToPeer(): Promise<void> {
        try {
            const necessaryPeers = this.targetConnectedPeers - this.peers.size
            if (this.peers.size < this.targetConnectedPeers) {
                const ipeer = await this.peerDB.getRandomPeer(this.peers)
                if (ipeer !== undefined) {
                    this.connect(ipeer.host, ipeer.port)
                }
            }
        } catch (e) {
            logger.debug(e)
        }
        setInterval(() => this.connectToPeer(), 5000)
    }

    private async seedPeerDB() {
        const len = RabbitNetwork.seeds.length
        const index = Math.floor(Math.random() * len)
        try {
            const rabbitPeer: RabbitPeer = await this.connect(RabbitNetwork.seeds[index].host, RabbitNetwork.seeds[index].port)
            const peers: proto.IPeer[] = await rabbitPeer.getPeers()
            for (const peer of peers) {
                await this.peerDB.put({ host: peer.host, port: peer.port })
            }
        } catch (e) {
            logger.info(`occurred error when connect seeds: ${e}`)
        }
    }
}
