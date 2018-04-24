import { getLogger } from "log4js"
import * as net from "net"
import { AppPeer } from "./appPeer"
import { INetwork } from "./network"
import { IPeer } from "./peer"
const logger = getLogger("Network")
import { Socket } from "net"
import { PeerMode } from "./basicPeer"
export class AppNetwork implements INetwork {
    public server: net.Server
    public port: number = -1
    public peers: AppPeer[] = []
    constructor(port: number = 8148) {
        this.port = port
        logger.debug(`TcpNetwork Port=${port}`)
    }
    public start(): boolean {
        logger.debug(`Tcp Network Started`)
        this.server = net.createServer()
        this.server.listen(this.port, () => {
            logger.info(`Listening ${this.port}`)
        })
        this.server.on("error", (error) => { logger.error(`${error}`) })
        this.server.on("connection", (socket) => {
            this.addPeer(socket)
        })

        setInterval(() => {
            this.polling()
        }, 1000)
        return true
    }

    public polling() {
        logger.debug(`Peers Count=${this.peers.length}`)
    }

    public addPeer(socket: Socket) {
        const newone = new AppPeer(this, socket, PeerMode.AcceptedSession)
        this.peers.push(newone)
    }

    public addClient(ip: string, port: number): IPeer {
        const newone = new AppPeer(this, null, PeerMode.ConnectedSession)
        newone.intializeClient(ip, port)
        this.peers.push(newone)
        return newone
    }

    public removePeer(one: AppPeer) {
        const newones: AppPeer[] = []
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
    public getRandomPeers(count: number): IPeer {
        throw new Error("Method not implemented.")
    }
}
