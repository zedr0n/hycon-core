import { getLogger } from "log4js"
import { createConnection, createServer, Server, Socket } from "net"
import { IConsensus } from "../../consensus/consensus"
import * as proto from "../../serialization/proto"
import { INetwork } from "../inetwork"
import { IPeer } from "../ipeer"
import { RabbitPeer } from "./netPeer"
import { SocketParser } from "./socketBuffer"

const logger = getLogger("Network")

export class RabbitNetwork implements INetwork {
    public readonly port: number
    private server: Server
    private peers: RabbitPeer[]
    private concensus: IConsensus
    private targetPeerCount: number

    constructor(concensus: IConsensus, port: number = 8148) {
        this.port = port
        this.peers = []
        this.targetPeerCount = 3
        this.concensus = concensus
        logger.debug(`TcpNetwork Port=${port}`)
    }

    public async start(): Promise<boolean> {
        return new Promise<boolean>((resolved, rejected) => {
            logger.debug(`Tcp Network Started`)
            this.server = createServer((socket) => this.newConnection(socket))
            this.server.listen(this.port, () => {
                resolved(true)
                logger.info(`Listening ${this.port}`)
            })

            this.server.on("error", (error) => logger.error(`${error}`))

            setInterval(() => logger.debug(`Peers Count=${this.peers.length}`), 1000)
            setInterval(() => this.findPeers(), 1000)
        })
    }

    public async addClient(host: string, port: number): Promise<IPeer> {
        return await new Promise<IPeer>((resolved, reject) => {
            logger.info(`Attempting to connect to ${host}:${port}`)
            const socket = createConnection({ host, port }, () => {
                logger.info(`Connected to ${host}:${port}`)
                const peer = this.newConnection(socket)
                resolved(peer)
            })
            socket.once("error", reject)
        })
    }

    public removePeer(remove: IPeer) {
        const index = this.peers.findIndex((peer) => {
            return peer === remove
        })
        this.peers.splice(index, 1)
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
        const peer = new RabbitPeer(socket, this.concensus)
        socket.on("close", (error) => { this.removePeer(peer) })
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
