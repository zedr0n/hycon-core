import { getLogger } from "log4js"
import * as natUpnp from "nat-upnp"
import * as proto from "../serialization/proto"
import { INetwork } from "./inetwork"
import { IPeer } from "./ipeer"

const client = natUpnp.createClient()
const logger = getLogger("Nat")
logger.level = "debug"

export class NatUpnp {
    private static bootNode: any[] = [
        { ip: "hycon.io", port: 8080 },
        { ip: "hycon.io", port: 8080 },
        { ip: "hycon.io", port: 8080 },
    ]
    private static async _mapPort(privatePort: number, publicPort: number, ttl: number = 10) {
        return await new Promise((resolve, reject) => {
            client.portMapping({
                private: privatePort,
                public: publicPort,
                ttl,
            }, (err: any) => {
                if (err) { reject(err) }
                resolve({})
            })
        })
    }
    private static async mapPort(privatePort: number, maxAttempts: number = 10, ttl?: number): Promise<number> {
        let publicPort = privatePort
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await NatUpnp._mapPort(privatePort, publicPort, ttl)
                logger.info(`Mapped port ${privatePort} --> ${publicPort} succesfully`)
                return publicPort
            } catch (e) {
                logger.info(`Failed to map port ${privatePort} --> ${publicPort}, Attempt ${i} of ${maxAttempts}`)
                // tslint:disable-next-line:no-bitwise
                publicPort = (2 << 15) + (2 << 14) + Math.random() * ((2 << 14) - 1)
            }
        }
        logger.info(`UPNP Port mapping failed`)
        throw new Error("UPNP Port mapping failed")
    }
    private static async _externalIp(): Promise<any> {
        return await new Promise((resolve, reject) => {
            client.externalIp((err: any, ip: any) => {
                if (err) { reject(`Get external IP failed`) }
                resolve(ip)
            })
        })
    }
    public publicIp: string
    private privatePort: number
    private publicPort: number
    private network: INetwork

    // constructor(port: number) {
    //     this.publicIp = ""
    //     this.privatePort = port
    //     this.publicPort = NaN
    //     setTimeout(() => {
    //         this.run()
    //     }, 5000)
    // }

    // test
    constructor(port: number, net: INetwork) {
        this.publicIp = ""
        this.privatePort = port
        this.publicPort = NaN
        this.network = net
        setTimeout(() => {
            this.run()
        }, 500)
    }

    public async run() {
        try {
            this.publicPort = await NatUpnp.mapPort(this.privatePort)
        } catch (e) {
            this.publicPort = NaN
            logger.error(`Upnp Error: ${e}, please confirm your router supports UPNP and that UPNP is enabled.`)
        }
        try {
            this.publicIp = await NatUpnp._externalIp()
            logger.info(`External Ip=${this.publicIp}`)
        } catch (e) {
            this.publicIp = ""
        }

        if (!isNaN(this.publicPort) && this.publicIp !== "") {
            const index = Math.floor(Math.random() * NatUpnp.bootNode.length)
            const bootNode: IPeer = await this.network.addClient(NatUpnp.bootNode[index].ip, NatUpnp.bootNode[index].port)
            bootNode.setStatus(this.publicIp, this.publicPort)
            await bootNode.status()
        }
    }
}
