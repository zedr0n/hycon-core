import { getLogger } from 'log4js'
import * as delay from 'delay'
const natUpnp = require('nat-upnp')

const client = natUpnp.createClient()
const logger = getLogger('Nat')
logger.level = "debug"

export class NatUpnp {
    private privatePort: number
    private publicPort: number
    public publicIp = ""
    public static ttl = 10
    public maxTryCount = 10

    constructor(Port:number) {
        this.privatePort = Port
        this.publicPort = Port
        setTimeout(() => {
            this.run()
        }, 100)
    }

    public async openPort() {
        for (let i = 0; i < this.maxTryCount; i++) {
            logger.debug(`Trying Portmapping ${i + 1}/${this.maxTryCount} Port=${this.publicPort}`)
            try {
                await new Promise( (resolve, reject) => {
                    client.portMapping({
                        public: this.publicPort,
                        private: this.privatePort,
                        ttl: NatUpnp.ttl
                    }, function (err: any) {
                        if (err) reject("port-mapping fail")
                        resolve()
                    });
                })
                // port-mapping suucess                
                logger.debug(`Portmapping Success Public=${this.publicPort} Private=${this.privatePort}`)
                return // complete
            }
            catch (e) {
                this.publicPort++
                await delay(100)
            }
        }
        throw "Make upnp nat mapping failed"
    }

    public async run() {
        try {
            await this.openPort()

            let result: any = await new Promise( (resolve, reject) => {
                client.externalIp( (err: any, ip: any) => {
                    if (err) reject(`Get external IP failed`)
                    resolve({ extIp: ip })
                })
            })
            this.publicIp = result.extIp

            logger.info(`External Ip=${this.publicIp}`)

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
        }
        // await rejection goes here!
        catch (e) {
            logger.error(`Upnp Error: ${e}, please confirm your router support upnp nat function and the function is enabled.`)
            // test code
            /*if (this.server && this.server.upnpServer) {
                // this.server.sendMyInfo(this.publicIp, NatUpnp.publicPort)
                var name = this.server.upnpServer.serverId
                this.server.sendMyInfo(name, "1.2.3.4", 8085)
            }*/
        }
    }
}
