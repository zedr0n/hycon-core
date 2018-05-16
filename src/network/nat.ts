import * as ip from "ip"
import { getLogger } from "log4js"
import * as natUpnp from "nat-upnp"
import * as proto from "../serialization/proto"
import { INetwork } from "./inetwork"
import { IPeer } from "./ipeer"
const client = natUpnp.createClient()
const logger = getLogger("Nat")
logger.level = "debug"

export class NatUpnp {
    private static async _mapPort(privatePort: number, publicPort: number, ttl: number = 10) {
        return await new Promise((resolve, reject) => {
            client.portMapping({
                description: "Hycon",
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
                logger.error(`Failed to map port ${privatePort} --> ${publicPort}, Attempt ${i} of ${maxAttempts}`)
                // tslint:disable-next-line:no-bitwise
                publicPort = (1 << 15) + (1 << 14) + Math.floor(Math.random() * ((1 << 14) - 1))
            }
        }
        logger.info(`Upnp Port mapping failed`)
        throw new Error("Upnp Port mapping failed")
    }
    private static async _externalIp(): Promise<any> {
        return await new Promise((resolve, reject) => {
            client.externalIp((err: any, publicIp: any) => {
                if (err) { reject(`Get external IP failed`) }
                resolve(publicIp)
            })
        })
    }
    public publicIp: string
    public publicPort: number
    private privatePort: number
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
    }

    public async run(): Promise<void> {
        try {
            this.publicPort = await NatUpnp.mapPort(this.privatePort)
        } catch (e) {
            this.publicPort = this.privatePort
            logger.warn(`Upnp Warning: ${e}, please confirm your router supports UPNP and that UPNP is enabled or you just not behind the NAT, Hycon will use your local port:${this.privatePort}`)
        }
        try {
            this.publicIp = await NatUpnp._externalIp()
            logger.info(`External Ip=${this.publicIp}`)
        } catch (e) {
            this.publicIp = ip.address()
            logger.warn(`Get external IP failed, hycon will use your local IP:${this.publicIp} if you are not behind NAT`)
        }
    }
}
