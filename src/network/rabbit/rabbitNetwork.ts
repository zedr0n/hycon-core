import { stat } from "fs"
import * as ip from "ip"
import { getLogger } from "log4js"
import { createConnection, createServer, Socket } from "net"
import * as net from "net"
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
const publicIp = require("public-ip")
const logger = getLogger("Network")

export class RabbitNetwork implements INetwork {
    public static seeds: any[] = [
        { host: "rapid1.hycon.io", port: 8148 },
        { host: "rapid2.hycon.io", port: 8148 },
        { host: "rapid3.hycon.io", port: 8148 },
    ]
    public static failLimit: number
    public static isRemoteSocket(socket: net.Socket) {
        let host = socket.remoteAddress
        if (!net.isIP(host)) {
            return true
        }
        if (net.isIPv6(host)) {
            // TODO: fd00::/8
            host = RabbitNetwork.ipNormalise(host)
        }
        if (net.isIPv4(host)) {
            // 10.0.0.0 – 10.255.255.255      10/8
            const block1 = new netmask.Netmask("10.0.0.0/8")
            if (block1.contains(host)) {
                return false
            }
            // 172.16.0.0 – 172.31.255.255    172.16/12
            const block2 = new netmask.Netmask("172.16.0.0/12")
            if (block2.contains(host)) {
                return false
            }
            // 192.168.0.0 – 192.168.255.255  192.168/16
            const block3 = new netmask.Netmask("192.168.0.0/16")
            if (block3.contains(host)) {
                return false
            }
            // 127.0.0.0 – 127.255.255.255    127/8
            const block4 = new netmask.Netmask("127.0.0.0/8")
            if (block4.contains(host)) {
                return false
            }
            // 0.0.0.0
            if (host === "0.0.0.0") {
                return false
            }
        }
        return true
    }

    public static ipNormalise(ipv6: string): string {
        const ipTemp: string[] = ipv6.split(":")
        if (ipTemp.length === 4) {
            return ipTemp[3]
        } else { return ipv6 }
    }
    public networkid: string = "hycon"
    public readonly version: number = 3
    public port: number
    public localPort: number
    public publicIp: string

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

    constructor(hycon: Server, port: number = 8148, peerDbPath: string = "peerdb", networkid: string = "hycon") {
        RabbitNetwork.failLimit = 10
        this.port = port
        this.networkid = networkid
        this.localPort = port
        this.targetConnectedPeers = 5
        this.hycon = hycon
        this.peers = new Map<number, RabbitPeer>()
        this.endPoints = new Map<number, proto.IPeer>()
        this.pendingConnections = new Map<number, proto.IPeer>()
        this.peerDB = new PeerDb(peerDbPath)
        this.publicIp = undefined
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public async getConnections(): Promise<proto.IPeer[]> {
        const peerList: proto.IPeer[] = []
        for (const key of this.peerDB.keys) {
            peerList.push(await this.peerDB.get(key))
        }
        return peerList
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
        try {
            this.publicIp = await publicIp.v4()
            logger.info(`Get PublicIP Success=${this.publicIp.toString()}`)
        } catch (error) {
            logger.info(`Get PublicIP Fail=${error}`)
            this.publicIp = undefined
        }

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
        let useNat = true

        if (Server.globalOptions.disable_upnp) {
            useUpnp = false
        }

        if (Server.globalOptions.disable_nat) {
            useNat = false
        }

        if (useUpnp) {
            // upnp
            this.upnpServer = new UpnpServer(this.port, this.hycon)
            this.upnpClient = new UpnpClient(this, this.hycon)

        }

        if (useNat) {
            // nat
            this.natUpnp = new NatUpnp(this.port, this)
            await this.natUpnp.run()
            if (!isNaN(this.natUpnp.publicPort)) {
                this.port = this.natUpnp.publicPort
            }
        }

        await this.connectSeeds()

        this.connectLoop()

        setInterval(() => {
            logger.info(`Peers Count=${this.peers.size}  PeerDB Size= ${this.peerDB.peerCount()}`)
            this.showInfo()
            this.peerDB.printDB()
        }, 10 * 1000)
        setInterval(() => {
            this.connectSeeds()
        }, 60 * 1000)

        return true
    }

    public showInfo() {
        let i = 1
        logger.info(`All Peers ${this.peers.size}`)
        for (const [key, value] of this.peers) {
            logger.info(`${i}/${this.peers.size} ${value.socketBuffer.getInfo()}`)
            i++
        }
    }

    public getRandomPeer(): IPeer {
        const index = Math.floor(Math.random() * this.peers.size)
        const key = Array.from(this.peers.keys())[index]
        return this.peers.get(key)
    }

    public getRandomPeers(count: number = 1): IPeer[] {
        const randomList: number[] = []
        const iPeer: IPeer[] = []
        const key: number[] = Array.from(this.peers.keys())
        while (randomList.length < count) {
            const index = Math.floor(Math.random() * this.peers.size)
            if (randomList.indexOf(index) === -1) {
                randomList.push(index)
                iPeer.push(this.peers.get(key[index]))
            }
        }
        return iPeer
    }

    public async connect(host: string, port: number, save: boolean = true): Promise<RabbitPeer> {
        return new Promise<RabbitPeer>(async (resolve, reject) => {
            const ipeer = { host, port }
            const key = PeerDb.ipeer2key(ipeer)
            if ((host === ip.address() || host === this.publicIp) && (port === this.localPort || port === this.port)) {
                await this.peerDB.remove(ipeer)
                reject(`Don't connect self, remove from peerDB`)
                return
            }
            if (this.pendingConnections.has(key)) {
                reject(`Already connecting to ${host}:${port} `)
                return
            }

            if (this.endPoints.has(key)) {
                reject(`Already connected to ${host}:${port} `)
                return
            }
            this.pendingConnections.set(key, ipeer)
            logger.debug(`Attempting to connect to ${host}:${port}...`)
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
                    ipeer.host = socket.remoteAddress
                    if (await peer.detectStatus()) {
                        if (save) {
                            this.endPoints.set(key, ipeer)
                            socket.on("close", () => this.endPoints.delete(key))
                            await this.peerDB.seen(ipeer)
                        }
                        resolve(peer)
                        logger.debug(`Peer ${key} ${socket.remoteAddress}:${socket.remotePort} Status=${JSON.stringify(await peer.status())}`)
                    } else {
                        await this.peerDB.fail(ipeer, RabbitNetwork.failLimit)
                        reject("Peer is using a different network")
                        peer.disconnect()
                    }
                    this.pendingConnections.delete(key)
                } catch (e) {
                    logger.debug(e)
                }
            })
        })
    }

    private async accept(socket: Socket): Promise<void> {
        try {
            logger.debug(`Detect a incoming peer ${RabbitNetwork.ipNormalise(socket.remoteAddress)}:${socket.remotePort}`)
            const peer = await this.newConnection(socket)
            if (RabbitNetwork.isRemoteSocket(socket)) {
                const status = await peer.status()
                if (await peer.detectStatus()) {
                    const ipeer = { host: RabbitNetwork.ipNormalise(socket.remoteAddress), port: status.port }
                    await this.peerDB.seen(ipeer)
                    const key = PeerDb.ipeer2key(ipeer)
                    this.endPoints.set(key, ipeer)
                    socket.on("close", () => this.endPoints.delete(key))
                }
            }
        } catch (e) {
            logger.debug(e)
        }
    }

    private async newConnection(socket: Socket): Promise<RabbitPeer> {
        const peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool, this.peerDB)
        const ipeer = { host: socket.remoteAddress, port: socket.remotePort }
        const key = PeerDb.ipeer2key(ipeer)
        this.peers.set(key, peer)
        socket.on("close", async (error) => {
            this.peers.delete(key)
            logger.debug(`disconnected from ${key} ${ipeer.host}:${ipeer.port}`)

        })
        socket.on("error", async (error) => {
            logger.debug(`Connection error ${key} ${ipeer.host}:${ipeer.port} : ${error}`)
        })
        return peer
    }

    private async connectLoop() {
        await this.connectToPeer()
        setTimeout(() => this.connectLoop(), 1000)
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

    private async connectSeeds() {
        try {
            for (const seed of RabbitNetwork.seeds) {
                const rabbitPeer = await this.connect(seed.host, seed.port, false)
                const peers = await rabbitPeer.getPeers()
                rabbitPeer.disconnect()
                for (const peer of peers) {
                    await this.peerDB.put({ host: peer.host, port: peer.port })
                }
            }
        } catch (e) {
            logger.debug(`Error occurred while connecting to seeds: ${e}`)
        }
    }
}
