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
    private server: Server

    constructor(port: number, server: Server) {
        UpnpServer.port = port
        this.server = server

        if (Server.globalOptions.networkid) {
            UpnpServer.networkid = Server.globalOptions.networkid
        }

        this.run()
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
    public rabbitNetwork: INetwork
    private server: Server

    constructor(rabbitNetwork: INetwork, server: Server) {
        this.rabbitNetwork = rabbitNetwork
        this.server = server

        this.run()
    }
    public run() {
        logger.debug(`Upnp Client Start Looking up`)
        const Client = require("node-ssdp").Client
        const client = new Client()

        client.search("urn:schemas-upnp-org:service:ContentDirectory:1")

        setInterval(() => {
            client.search("ssdp:all")
        }, 20 * 1000)

        client.on("response", async (headers: any, code: any, rdebug: any) => {
            // const ipaddress = rdebug.address
            const regex = /(\S+):\/\/([\.\d]+):(\d+)/g
            const match = regex.exec(headers.LOCATION)
            if (match) {
                const [product, localIP, localPort] = match.slice(1, 4)
                const isMe = ip.address() === localIP && Number(localPort) === UpnpServer.port
                const fullProduct = UpnpServer.product + UpnpServer.networkid
                const isSameProduct = product === fullProduct
                const date = headers.DATE

                if (!isMe && isSameProduct) {
                    // logger.debug(`debug = ${JSON.stringify(headers)}`)
                    // logger.debug("IP ADDRESS:", ipaddress)
                    // logger.debug("LOCAL ADDRESS:", localIP)
                    // logger.debug("IS LOCAL:", isLocal)
                    // logger.debug("DATE:", date)
                    logger.debug(`DETECT IP ME=${isMe} Product=${product} IP=${localIP} Port=${localPort}`)
                    try {
                        await this.rabbitNetwork.connect(localIP, Number(localPort))
                    } catch (e) {
                        logger.debug(`Connecting to local peer: ${e}`)
                    }
                }
            } else {
                logger.error("Invalid format: headers.LOCATION")
            }

        })

    }
}
