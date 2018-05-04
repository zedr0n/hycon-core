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
    private peerTable: Map<string, RabbitPeer> = new Map()
    private peerList: PeerList
    private upnpServer: UpnpServer
    private upnpClient: UpnpClient
    private natUpnp: NatUpnp

    constructor(hycon: Server, port: number = 8148) {
        this.port = port
        this.peers = []
        this.targetPeerCount = 3
        this.hycon = hycon
        this.peerList = new PeerList("./PeerList.db")
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public broadcast(packet: Buffer, exempt: IPeer): void {
        for (const peer of this.peers) {
            if (exempt !== peer) {
                peer.sendPacket(packet)
            }
        }
    }
    public async start(): Promise<boolean > {
        logger.debug(`Tcp Network Started`)
        this.server = createServer((socket) => this.newConnection(socket))
        await new Promise<boolean>((resolve, reject) => {
            this.server.once("error", reject)
            this.server.listen(this.port, () => {
                logger.info(`Listening ${this.port}`)
                resolve()
            })
        })

        this.server.on("error", (error) => logger.error(`${error}`))
        setInterval(() => logger.debug(`Peers Count=${this.peers.length}`), 5000)
        setInterval(() => { this.polling() }, 2000)
        setInterval(() => { this.findPeers() }, 4000)

        // upnp
        this.upnpServer = new UpnpServer(this.port, this.hycon)
        this.upnpClient = new UpnpClient(this, this.hycon)
        // nat
        this.natUpnp = new NatUpnp(this.port, this)

        // add peer
        if (this.hycon) {
            const peers = this.hycon.options.peer
            if (peers) {
                for (const peer of peers) {
                    const args = peer.split(":")
                    const ip = args[0]
                    const port = args[1]
                    logger.info(`IP=${ip}  PORT=${port}`)
                    this.addClient(ip, port).catch((e) => logger.error(`Failed to connect to client: ${e}`))
                }
            }
        }

        return true
    }

    public async addClient(host: string, port: number): Promise < IPeer > {
        logger.log(`AddClient IP=${host} PORT=${port}`)
        return new Promise<IPeer>((resolved, reject) => {
            const key = Buffer.from(`${host}:${port}`).toString()
            if (this.peerTable.has(key)) {
                reject(`${key} Already Exists`)
            }

            logger.info(`Attempting to connect to ${host}:${port}`)
            const socket = new Socket()
            socket.once("error", reject)
            socket.connect({ host, port }, () => {
                logger.info(`Connected to ${host}:${port}`)
                const peer = this.newConnection(socket)
                this.peerTable.set(key, peer)
                resolved(peer)
            })
        })
    }

    public removePeer(remove: IPeer) {
        const index = this.peers.findIndex((peer) => {
            return peer === remove
        })
        this.peers.splice(index, 1)

        // remove peer in peer table
        const tmpKeys = []
        for (const p of this.peerTable) {
            const key = p[0]
            const data = p[1]
            if (data === remove) {
                tmpKeys.push(key)
            }
        }

        for (const k of tmpKeys) {
            this.peerTable.delete(k)
        }

    }

    public getRandomPeer(): IPeer {
        if (this.peers.length === 0) {
            throw new Error("No Peers")
        }
        const chosen = randomInt(0, this.peers.length - 1)
        return this.peers[chosen]
    }
    public getRandomPeers(count: number): IPeer[] {
        if (this.peers.length === 0) {
            throw new Error("No Peers")
        }
        const ret: IPeer[] = []
        for (let i = 0; i < count; i++) {
            const chosen = randomInt(0, this.peers.length - 1)
            ret.push(chosen)
        }
        return ret
    }

    private newConnection(socket: Socket): RabbitPeer {
        let peer: any = null
        if (this.hycon) {
            peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool)
        } else {
            peer = new RabbitPeer(socket, this, undefined, undefined)
        }
        socket.on("close", (error) => { this.removePeer(peer) })
        socket.on("error", (error) => {
            logger.error(`${error}`)
        })
        this.peers.push(peer)
        peer.onConnected()
        return peer
    }

    private async polling() {
        for (const peer of this.peers) {
            peer.polling()
        }

    }
    private async findPeers() {
        const necessaryPeers = this.targetPeerCount - this.peers.length
        if (necessaryPeers <= 0) {
            return
        }
        // logger.debug(`Connect to Bootnodes For More Peers=${necessaryPeers}`)
        await delay(2000)
        // logger.debug(`Done`)
    }

}
