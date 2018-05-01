import { getLogger } from "log4js"
import { createConnection, createServer, Socket } from "net"
import * as net from "net"
import { IConsensus } from "../../consensus/iconsensus"
import * as proto from "../../serialization/proto"
import { Server } from "../../server"
import { INetwork } from "../inetwork"
import { IPeer } from "../ipeer"
import { RabbitPeer } from "./netPeer"
import { SocketParser } from "./socketBuffer"

const logger = getLogger("Network")

export class RabbitNetwork implements INetwork {
    public readonly port: number
    private hycon: Server
    private server: net.Server
    private peers: RabbitPeer[]
    private targetPeerCount: number

    private peerTable: Map<string, RabbitPeer> = new Map()

    constructor(hycon: Server, port: number = 8148) {
        this.port = port
        this.peers = []
        this.targetPeerCount = 3
        this.hycon = hycon
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public broadcast(packet: Buffer, exempt: IPeer): void {
        for (const peer of this.peers) {
            if (exempt !== peer) {
                peer.sendPacket(packet)
            }
        }
    }
    public async start(): Promise<boolean> {
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
        setInterval(() => logger.debug(`Peers Count=${this.peers.length}`), 1000)
        setInterval(() => this.findPeers(), 1000)

        // add peer
        if (this.hycon) {
            const peers = this.hycon.options.peer
            for (const peer of peers) {
                const args = peer.split(":")
                const ip = args[0]
                const port = args[1]
                logger.info(`IP=${ip}  PORT=${port}`)
                this.addClient(ip, port).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }

        return true
    }

    public async addClient(host: string, port: number): Promise<IPeer> {
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
        // TODO: Random
        if (this.peers.length > 0) {
            return this.peers[0]
        }
        throw new Error("Method not implemented.")
    }
    public getRandomPeers(count: number): IPeer {
        throw new Error("Method not implemented.")
    }

    private newConnection(socket: Socket): RabbitPeer {
        logger.info(`Making peer`)
        const peer = new RabbitPeer(socket, this, this.hycon.consensus, this.hycon.txPool)
        socket.on("close", (error) => { this.removePeer(peer) })
        socket.on("error", (error) => {
            logger.error(`${error}`)
        })
        this.peers.push(peer)

        return peer
    }

    private findPeers() {
        if (this.peers.length < this.targetPeerCount) {
            // do {
            //  get random entry from peerlist
            //  try{
            //    await this.addClient
            //    break
            //  } catch(e) {}
            //
            // } while()
        }
    }

}
