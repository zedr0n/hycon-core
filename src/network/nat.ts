import { getLogger } from "log4js"
import natUpnp = require("nat-upnp") // TODO: Add typing information

const client = natUpnp.createClient()
const logger = getLogger("Nat")
logger.level = "debug"

export class NatUpnp {
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

    constructor(port: number) {
        this.publicIp = ""
        this.privatePort = port
        this.publicPort = NaN
        setTimeout(() => {
            this.run()
        }, 5000)
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

        // if (this.server && this.server.upnpServer) {
        //     this.server.sendMyInfo(this.server.upnpServer.serverId, this.publicIp, NatUpnp.publicPort)
        // }

        // result = await new Promise(function (resolve, reject) {
        //     client.getMappings(function (err: any, results: any) {
        //         if (err) reject("get mappings fail")

        //         var newresult = { items: results };
        //         resolve(newresult)
        //     });
        // })

        // this.portList = []
        // for (let item of result.items) {
        //     let publicPort = item.public.port
        //     let privateIp = item.private.host
        //     let privatePort = item.private.port
        //     let newone = {
        //         publicIp: this.publicIp, publicPort: publicPort,
        //         privateIp: privateIp, privatePort: privatePort
        //     }
        //     //logger.info(`${JSON.stringify(newone)}`)
        //     logger.info(`${this.publicIp}:${publicPort} -> ${privateIp}:${privatePort}`)
        //     this.portList.push(newone)
        // }

        // /*
        //         client.getMappings({ local: true }, function (err: any, results: any) {
        //             logger.debug(`Local GetMappings Upnp err=${err}  results=${JSON.stringify(results)}`)
        //         });*/

        // test code
        /*if (this.server && this.server.upnpServer) {
            // this.server.sendMyInfo(this.publicIp, NatUpnp.publicPort)
            var name = this.server.upnpServer.serverId
            this.server.sendMyInfo(name, "1.2.3.4", 8085)
        }*/
    }

}
