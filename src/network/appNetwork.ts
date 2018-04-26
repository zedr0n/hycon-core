import { getLogger } from "log4js"
import * as net from "net"
import * as proto from "../serialization/proto"
import { INetwork } from "./network"
import { IPeer } from "./peer"
import { PeerApp } from "./peerApp"
const logger = getLogger("Network")
import { Socket } from "net"
import { Server } from "../server"
import { PeerMode } from "./peerBasic"
import { UpnpServer, UpnpClient } from "./upnp"
export class AppNetwork implements INetwork {
    public static defaultPort = 8148
    public server: Server
    public tcp: net.Server
    public port: number = -1
    public peers: PeerApp[] = []
    public clientTable: any = {}
    public upnpServer: UpnpServer
    public upnpClient: UpnpClient

    constructor(port: number, server: Server) {
        if (port) {
            this.port = port
        } else {
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

        //upnp
        this.upnpServer = new UpnpServer(this.port)
        this.upnpClient = new UpnpClient(this)

        setInterval(() => {
            this.polling()
        }, 2000)
        return true
    }

    public polling() {
        logger.debug(`------------------Peers Count=${this.peers.length}`)

        let index = 1
        for (const a of this.peers) {
            logger.debug(`${index} Peer=${a.ip}:${a.port}`)
            index++
        }
    }

    public addPeer(socket: Socket) {
        const newone = new PeerApp(this, socket, PeerMode.AcceptedSession)
        newone.onConnected()
        this.peers.push(newone)
    }

    public addClient(ip: string, port: number): PeerApp {
        const k = Buffer.from(`${ip}:${port}`).toString()
        if (k in this.clientTable) {
            logger.debug(`${k} Already Exists`)
            return
        }
        logger.debug(`AddClient=${k}`)
        const newone = new PeerApp(this, null, PeerMode.ConnectedSession)
        newone.intializeClient(ip, port)
        this.peers.push(newone)
        this.clientTable[k] = k
        return newone
    }

    public removePeer(one: PeerApp) {
        const newones: PeerApp[] = []
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
