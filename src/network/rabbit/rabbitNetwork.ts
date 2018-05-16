import { stat } from "fs"
import { getLogger } from "log4js"
import * as net from "net"
import { createConnection, createServer, Socket } from "net"
import * as netmask from "netmask"
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
const logger = getLogger("Network")
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
        // if (socket.remoteFamily === "IPv4") { }
        // if (socket.remoteFamily === "IPv6") { }
        let host = socket.remoteAddress
        if (!net.isIP(host)) {
            return true
        }
        if (net.isIPv6(host)) {
            // fd00::/8
            host = RabbitNetwork.ipv6Toipv4(host)
        }
        if (net.isIPv4(host)) {
            // 10.0.0.0 – 10.255.255.255      10/8
            const block1 = new netmask.Netmask("10.0.0.0/8")
            if (block1.contains(host)) {
                return false
            } else {
                // 172.16.0.0 – 172.31.255.255    172.16/12
                const block2 = new netmask.Netmask("172.16.0.0/12")
                if (block2.contains(host)) {
                    return false
                } else {
                    // 192.168.0.0 – 192.168.255.255  192.168/16
                    const block3 = new netmask.Netmask("192.168.0.0/16")
                    if (block3.contains(host)) {
                        return false
                    } else {
                        // 127.0.0.0 – 127.255.255.255    127/8
                        const block4 = new netmask.Netmask("127.0.0.0/8")
                        if (block4.contains(host)) {
                            return false
                        } else {
                            // 0.0.0.0
                            if (host === "0.0.0.0") {
                                return false
                            }
                        }
                    }
                }
            }
        }
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
    private endPoints: Map<number, proto.IPeer>
    private pendingConnections: Map<number, proto.IPeer>
    private upnpServer: UpnpServer
    private upnpClient: UpnpClient
    private natUpnp: NatUpnp

    constructor(hycon: Server, port: number = 8148, peerDbPath: string = "peerdb") {
        RabbitNetwork.failLimit = 10
        this.port = port
        this.targetConnectedPeers = 5
        this.hycon = hycon
        this.peers = new Map<number, RabbitPeer>()
        this.endPoints = new Map<number, proto.IPeer>()
        this.pendingConnections = new Map<number, proto.IPeer>()
        this.peerDB = new PeerDb(peerDbPath)
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public getConnections(): proto.IPeer[] {
        return Array.from(this.endPoints.values())
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
        // initial peerDB
        await this.peerDB.run()
        await this.saveSeedstoDB()

        this.server = createServer((socket) => this.accept(socket).catch(() => undefined))
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

        this.connectLoop()

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
        return new Promise<RabbitPeer>((resolve, reject) => {
            const ipeer = { host, port }
            const key = PeerDb.ipeer2key(ipeer)
            if (this.pendingConnections.has(key)) {
                reject(`Already connecting to ${host}:${port} `)
                return
            }

            if (this.endPoints.has(key)) {
                reject(`Already connected to ${host}:${port} `)
                return
            }
            this.pendingConnections.set(key, ipeer)
            logger.info(`Attempting to connect to ${host}:${port}...`)
            const socket = new Socket()
            socket.once("error", async () => {
                try {
                    this.pendingConnections.delete(key)
                    await this.peerDB.fail(ipeer, RabbitNetwork.failLimit)
                    reject(`Failed to connect to ${key}: ${host}:${port}`)
                } catch (e) {
                    logger.debug(e)
                }
            })
            socket.connect({ host, port }, async () => {
                try {
                    logger.info(`Connected to ${key}: ${host}:${port}`)
                    const peer = await this.newConnection(socket)
                    this.endPoints.set(key, ipeer)
                    this.pendingConnections.delete(key)
                    socket.on("close", () => this.endPoints.delete(key))
                    resolve(peer)
                    await this.peerDB.seen(ipeer)
                    logger.info(`Peer ${key} ${socket.remoteAddress}:${socket.remotePort} Status=${JSON.stringify(await peer.status())}`)
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
            if (RabbitNetwork.isRemoteSocket(socket)) {
                const status = await peer.status()
                const ipeer = { host: socket.remoteAddress, port: status.port }
                const key = PeerDb.ipeer2key(ipeer)
                this.endPoints.set(key, ipeer)
                socket.on("close", () => this.endPoints.delete(key))
                await this.peerDB.seen(ipeer)
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
        socket.on("close", async (error) => {
            this.peers.delete(key)
            logger.error(`disconnected from ${key} ${ipeer.host}:${ipeer.port}`)

        })
        socket.on("error", async (error) => {
            logger.error(`Connection error ${key} ${ipeer.host}:${ipeer.port} : ${error}`)
        })
        return peer
    }

    private async connectLoop() {
        await this.connectToPeer()
        setTimeout(() => this.connectLoop(), 100)
    }
    private async connectToPeer(): Promise<void> {
        try {
            const necessaryPeers = this.targetConnectedPeers - this.peers.size
            if (this.peers.size < this.targetConnectedPeers) {
                const ipeer = await this.peerDB.getRandomPeer(this.endPoints)
                if (ipeer !== undefined) {
                    const rabbitPeer = await this.connect(ipeer.host, ipeer.port)
                    const peers = await rabbitPeer.getPeers()
                    if (peers.length !== 0) {
                        for (const peer of peers) {
                            await this.peerDB.put({ host: peer.host, port: peer.port })
                        }
                    }
                }
            }
        } catch (e) {
            logger.debug(`Connecting to Peer: ${e}`)
        }
    }

    private async saveSeedstoDB() {
        try {
            for (const seed of RabbitNetwork.seeds) {
                await this.peerDB.put({ host: seed.host, port: seed.port })
            }
        } catch (e) {
            logger.info(`Error occurred while connecting to seeds: ${e}`)
        }
    }
}
