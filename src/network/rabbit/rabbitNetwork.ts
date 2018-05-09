import { getLogger } from "log4js"
import { createConnection, createServer, Socket } from "net"
import * as net from "net"
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
import { SocketParser } from "./socketParser"
// tslint:disable-next-line:no-var-requires
const delay = require("delay")
const logger = getLogger("Network")
// tslint:disable-next-line:no-var-requires
const randomInt = require("random-int")
export class RabbitNetwork implements INetwork {
    public static seeds: any[] = [
        { host: "hycon.io", port: 8080 },
        { host: "hycon.io", port: 8080 },
        { host: "hycon.io", port: 8080 },
    ]
    public static failLimit: number
    public static socket2Ipeer(socket: Socket): proto.IPeer {
        return proto.Peer.create({
            failCount: 0,
            host: RabbitNetwork.ipv6Toipv4(socket.remoteAddress),
            lastSeen: Date.now(),
            port: socket.remotePort,
        })
    }
    public static string2key(host: string, port: number): Buffer {
        const hash: any = Hash.hash(host + port.toString()) // TS typechecking is incorrect
        return Buffer.from(hash).slice(0, 4)
    }
    public static ipv6Toipv4(ipv6: string): string {
        const ip: string[] = ipv6.split(":")
        if (ip.length === 4) {
            return ip[3]
        } else { return ip[0] }
    }
    public readonly port: number
    private hycon: Server
    private server: net.Server
    private targetPeerCount: number
    private peerDB: PeerDb
    private peerTable: Map<Buffer, RabbitPeer>
    private upnpServer: UpnpServer
    private upnpClient: UpnpClient
    private natUpnp: NatUpnp

    constructor(hycon: Server, port: number = 8148) {
        RabbitNetwork.failLimit = 10
        this.port = port
        this.targetPeerCount = 5
        this.hycon = hycon
        this.peerTable = new Map<Buffer, RabbitPeer>()
        this.peerDB = new PeerDb()
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public broadcast(packet: Buffer, exempt: RabbitPeer): void {
        for (const [key, peer] of this.peerTable) {
            if (exempt !== peer) {
                peer.sendPacket(packet)
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
        // upnp
        this.upnpServer = new UpnpServer(this.port, this.hycon)
        this.upnpClient = new UpnpClient(this, this.hycon)
        // nat
        this.natUpnp = new NatUpnp(this.port, this)

        await this.connectPeersInDB()

        setInterval(() => {
            logger.debug(`Peers Count=${this.peerTable.size}`)
        }, 5000)
        setInterval(() => { this.findPeers() }, 4000)

        return true
    }

    public getRandomPeer(): IPeer {
        const index = Math.floor(Math.random() * this.peerTable.size)
        let cntr = 0
        for (const value of this.peerTable.values()) {
            if (cntr++ === index) {
                return value
            }
        }
    }
    public getRandomPeers(count: number = 1): IPeer[] {
        const randomList: number[] = []
        const iPeer: IPeer[] = []
        while (randomList.length < count) {
            const index = Math.floor(Math.random() * this.peerTable.size)
            if (randomList.indexOf(index) === -1) {
                randomList.push(index)
            }
        }

        let cntr = 0
        let index2 = 0
        for (const value of this.peerTable.values()) {
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
            const key = RabbitNetwork.string2key(host, port)
            if (this.peerTable.has(key)) {
                reject(`${host}:${port} Already Exists`)
            }
            logger.info(`Attempting to connect to ${host}:${port}`)
            const socket = new Socket()
            socket.once("error", reject)
            socket.connect({ host, port }, async () => {
                logger.info(`Connected to ${host}:${port}`)
                const ipeer = RabbitNetwork.socket2Ipeer(socket)
                const peer = await this.newConnection(key, socket, ipeer)
                resolved(peer)
            })
        })
    }

    private async accept(socket: Socket): Promise <void > {
        const ipeer = RabbitNetwork.socket2Ipeer(socket)
        const key = PeerDb.peer2key(ipeer)
        if (this.peerTable.has(key)) {
            socket.destroy()
            socket.unref()
        } else {
            await this.newConnection(key, socket, ipeer)
        }
    }

    private async newConnection(key: Buffer, socket: Socket, ipeer: proto.IPeer): Promise<RabbitPeer> {
        const peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool, this.peerDB)
        this.peerTable.set(key, peer)
        await this.peerDB.put(ipeer)
        const index = this.peerDB.peers.indexOf(ipeer)
        if (index > -1) {
            this.peerDB.peers[index] = ipeer
        } else {
            this.peerDB.peers.push(ipeer)
        }
        socket.on("close", async (error) => {
            this.peerTable.delete(key)
            await this.peerDB.remove(key)
            const index1 = this.peerDB.peers.indexOf(ipeer)
            if (index > -1) {
                this.peerDB.peers.splice(index1, 1)
            }
        })
        socket.on("error", async (error) => {
            logger.error(`Connection error ${RabbitNetwork.ipv6Toipv4(socket.remoteAddress)}:${socket.remotePort} : ${error}`)
            await this.removePeers(ipeer, key)
        })

        peer.onConnected()
        return peer
    }

    private async findPeers(): Promise <void > {
        const necessaryPeers = this.targetPeerCount - this.peerTable.size
        if (necessaryPeers <= 0) {
            return
        } else {
            const len = RabbitNetwork.seeds.length
            const index = Math.floor(Math.random() * len)
            try {
                const rabbitPeer: RabbitPeer = await this.connect(RabbitNetwork.seeds[index].host, RabbitNetwork.seeds[index].port)
                const peers: proto.IPeer[] = await rabbitPeer.getPeers(necessaryPeers)
                for (const peer of peers) {
                    try {
                        await this.connect(peer.host, peer.port)
                    } catch (e) {
                        this.removePeers(peer, PeerDb.peer2key(peer))
                    }
                }
            } catch (e) {
                logger.info(`occurred error when connect seeds: ${e}`)
            }

        }
        // logger.debug(`Connect to seeds For More Peers=${necessaryPeers}`)
        await delay(2000)
        // logger.debug(`Done`)
    }

    private async connectPeersInDB(): Promise <void > {

        if (this.peerDB.peers.length !== 0) {
            for (const peer of this.peerDB.peers) {
                try {
                    logger.debug(`${peer.host}:${peer.port}`)
                    const rabbitPeer = await this.connect(peer.host, peer.port)
                    const key = RabbitNetwork.string2key(peer.host, peer.port)
                    this.peerTable.set(key, rabbitPeer)
                } catch (e) {
                    try {
                        logger.debug(e)
                        const key = PeerDb.peer2key(peer)
                        this.peerTable.delete(key)
                        await this.peerDB.remove(key)
                        const index = this.peerDB.peers.indexOf(peer)
                        this.peerDB.peers.splice(index, 1)
                    } catch (e) {
                        logger.debug(e)
                    }

                }
            }
        }

    }

    private async removePeers(ipeer: proto.IPeer, key: Buffer): Promise <void > {
        const index = this.peerDB.peers.indexOf(ipeer)
        if (index > -1) {
            const count = this.peerDB.peers[index].failCount += 1
            await this.peerDB.put(this.peerDB.peers[index])
            if (count > RabbitNetwork.failLimit) {
                try {
                    this.peerTable.delete(key)
                    await this.peerDB.remove(key)
                    this.peerDB.peers.splice(index, 1)
                } catch (e) {
                    logger.debug(e)
                }

            }
        }

    }

}
