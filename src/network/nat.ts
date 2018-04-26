import { getLogger } from 'log4js'
import * as delay from 'delay'
const natUpnp = require('nat-upnp')
const client = natUpnp.createClient()

const logger = getLogger('Nat')
logger.level = "debug"

export class NatUpnp {
    public static privatePort: number
    public static publicPort: number
    public publicIp = ""
    public static ttl = 10
    public portList: any[] = []
    public maxTryCount = 3
    constructor(port:number) {
        setTimeout(() => {
            this.run()
        }, 100)
    }
    public async openPort() {
        for (let i = 0; i < this.maxTryCount; i++) {
            logger.debug(`Trying Portmapping ${i + 1}/${this.maxTryCount} Port=${NatUpnp.publicPort}`)
            try {
                await new Promise(function (resolve, reject) {
                    client.portMapping({
                        public: NatUpnp.publicPort,
                        private: NatUpnp.privatePort,
                        ttl: NatUpnp.ttl
                    }, function (err: any) {
                        if (err) reject("port-mapping fail")
                        resolve()
                    });
                })
                // port-mapping suucess                
                logger.debug(`Portmapping Success Public=${NatUpnp.publicPort} Private=${NatUpnp.privatePort}`)
                return // complete
            }
            catch (e) {
                // error
                NatUpnp.publicPort++
                await delay(100)
            }
        }

        // all tries failed
        throw "open port fail"
    }
    public async run() {
        try {
            var result: any
            await this.openPort()
            /*
            client.portUnmapping({
                public: 12345
            });
            */
            result = await new Promise(function (resolve, reject) {
                client.externalIp(function (err: any, results: any) {
                    if (err) reject("get external ip fail ${err}")
                    resolve({ extIp: results })
                })
            })
            this.publicIp = result.extIp
            logger.info(`External Ip=${this.publicIp}`)

            // if (this.server && this.server.upnpServer) {
            //     this.server.sendMyInfo(this.server.upnpServer.serverId, this.publicIp, NatUpnp.publicPort)
            // }

            result = await new Promise(function (resolve, reject) {
                client.getMappings(function (err: any, results: any) {
                    if (err) reject("get mappings fail")

                    var newresult = { items: results };
                    resolve(newresult)
                });
            })

            this.portList = []
            for (let item of result.items) {
                let publicPort = item.public.port
                let privateIp = item.private.host
                let privatePort = item.private.port
                let newone = {
                    publicIp: this.publicIp, publicPort: publicPort,
                    privateIp: privateIp, privatePort: privatePort
                }
                //logger.info(`${JSON.stringify(newone)}`)
                logger.info(`${this.publicIp}:${publicPort} -> ${privateIp}:${privatePort}`)
                this.portList.push(newone)
            }

            /*
                    client.getMappings({ local: true }, function (err: any, results: any) {
                        logger.debug(`Local GetMappings Upnp err=${err}  results=${JSON.stringify(results)}`)
                    });*/
        }
        // await rejection goes here!
        catch (e) {
            console.log(`Upnp Error=${e}`)
            // test code
            /*if (this.server && this.server.upnpServer) {
                // this.server.sendMyInfo(this.publicIp, NatUpnp.publicPort)
                var name = this.server.upnpServer.serverId
                this.server.sendMyInfo(name, "1.2.3.4", 8085)
            }*/
        }

    }
}

