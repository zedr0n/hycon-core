import * as ip from "ip"
import { getLogger } from "log4js"
import { Server } from "../server"
import { INetwork } from "./inetwork"

const logger = getLogger("Upnp")
logger.level = "debug"
type TurtleNetwork = any

export class UpnpServer {

    public static port: number
    public static product: string = "hycon"
    public static networkid: string = "1"
    public static version: string = "1.0.0"

    public info: any = {}
    private server: Server

    constructor(port: number, server: Server) {
        UpnpServer.port = port
        this.server = server
        if (server) {
            if (server.options.networkid) {
                UpnpServer.networkid = server.options.networkid
            }
        }
        setTimeout(() => {
            this.run()
        }, 100)
    }

    public run() {
        const myLocation = UpnpServer.product + UpnpServer.networkid + "://" + ip.address() + ":" + UpnpServer.port
        const SSDPServer = require("node-ssdp").Server
        const server = new SSDPServer({
            location: myLocation,
            sourcePort: 1900,
            udn: `${UpnpServer.product}:${UpnpServer.version}`,
        })

        server.start()
        logger.debug(`Upnp Server Started`)
    }
}

// tslint:disable-next-line:max-classes-per-file
export class UpnpClient {
    public static threshold: number = 5 * 1000
    public localPeer: Map<string, string>
    public appNetwork: INetwork
    private server: Server

    constructor(appNetwork: INetwork, server: Server) {
        this.appNetwork = appNetwork
        this.localPeer = new Map()
        this.server = server
        setTimeout(() => {
            this.run()
        }, 100)
        setInterval(() => {
            this.updateLocalPeer()
        }, 5 * 1000)
    }

    public updateLocalPeer() {
        const date = Date.now()
        this.localPeer.forEach((value, key) => {
            if (date - Date.parse(value) > UpnpClient.threshold) {
                this.localPeer.delete(key)
            }
        })
        // logger.debug("localPeer: ", this.localPeer)
    }

    public run() {
        logger.debug(`Upnp Client Start Looking up`)
        const Client = require("node-ssdp").Client
        const client = new Client()

        client.search("urn:schemas-upnp-org:service:ContentDirectory:1")

        setInterval(() => {
            client.search("ssdp:all")
        }, 2 * 1000)

        client.on("response", (headers: any, code: any, rdebug: any) => {
            const ipaddress = rdebug.address
            const regex = /(\S+):\/\/([\.\d]+):(\d+)/g
            const match = regex.exec(headers.LOCATION)
            if (match) {
                const [product, localIP, localPort] = match.slice(1, 4)
                const isLocal = ipaddress === localIP && Number(localPort) === UpnpServer.port
                const fullProduct = UpnpServer.product + UpnpServer.networkid
                const isSameProduct = product === fullProduct
                const date = headers.DATE

                if (!isLocal && isSameProduct) {
                    // logger.debug(`debug = ${JSON.stringify(headers)}`)
                    // logger.debug("IP ADDRESS:", ipaddress)
                    // logger.debug("LOCAL ADDRESS:", localIP)
                    // logger.debug("IS LOCAL:", isLocal)
                    // logger.debug("DATE:", date)
                    logger.info(`DETECT IP Local=${isLocal} Product=${product} IP=${localIP} Port=${localPort}`)
                    if (!this.localPeer.has(`${localIP}:${localPort}`)) {
                        this.appNetwork.connect(localIP, parseInt(localPort, 10))
                    }
                    this.localPeer.set(`${localIP}:${localPort}`, date)
                }
            } else {
                logger.error("Invalid format: headers.LOCATION")
                // throw Error("Invalid format: headers.LOCATION")
            }

        })

    }
}
