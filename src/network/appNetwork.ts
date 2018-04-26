import { getLogger } from "log4js"
import * as net from "net"
import * as proto from "../serialization/proto"
import { INetwork } from "./network"
import { IPeer } from "./peer"
import { peerApp } from "./peerApp"
const logger = getLogger("Network")
import { Socket } from "net"
import { Server } from "../server"
import { PeerMode } from "./peerBasic"
export class AppNetwork implements INetwork {
    public static defaultPort = 8148
    public server: Server
    public tcp: net.Server
    public port: number = -1
    public peers: peerApp[] = []

    constructor(port: number, server: Server) {
        if (port) {
            this.port = port
        }
        else {
            this.port = 8148
        }

        this.server = server
        logger.debug(`TcpNetwork Port=${port}`)
    }
    public start(): boolean {
        logger.debug(`Tcp Network Started`)
        this.tcp = net.createServer()
        this.tcp.listen(this.port, () => {
            logger.info(`Listening ${this.port}`)
        })
        this.tcp.on("error", (error) => { logger.error(`${error}`) })
        this.tcp.on("connection", (socket) => {
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
        const newone = new peerApp(this, socket, PeerMode.AcceptedSession)
        newone.onConnected()
        this.peers.push(newone)
    }

    public addClient(ip: string, port: number): IPeer {
        const newone = new peerApp(this, null, PeerMode.ConnectedSession)
        newone.intializeClient(ip, port)
        this.peers.push(newone)
        return newone
    }

    public removePeer(one: peerApp) {
        const newones: peerApp[] = []
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
