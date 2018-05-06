import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import levelup = require("levelup")
import { resolve } from "url";
const logger = getLogger("PeerList")
// persistent host save
export class PeerList {
    private database: levelup.LevelUp
    constructor(dbPath: string) {
        const rocks: any = rocksdb(dbPath)
        this.database = levelup(rocks)
        logger.debug(`PeerList ${dbPath}`)
        this.test()
    }
    public async addHost(ip: string, port: number) {
        let key = `${ip}:${port}`
        let data: any = { Ip: ip, Port: port, Time: new Date() }
        await this.database.put(key, JSON.stringify(data))
    }

    public async readHosts(): Promise<any> {
        return new Promise((resolve, reject) => {
            var ret: any[] = []
            this.database.createReadStream({ limit: -1 })
                .on('data', function (data: any) {
                    var node = JSON.parse(data.value)
                    logger.debug(`${data.key} ${data.value}`)
                    ret.push(node)
                })
                .on('error', function (err: any) {
                    logger.debug('Database Error!', err)
                    reject()
                })
                .on('end', function () {
                    resolve(ret)
                })
        })
    }

    private async test() {
        for (let i = 0; i < 10; i++) {
            await this.addHost('127.0.0.1', 8080 + i)
        }

        let hosts: any[] = await this.readHosts()
        let c = hosts.length
    }
}