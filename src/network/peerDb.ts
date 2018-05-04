import * as base58 from "base-58"
import { getLogger } from "log4js"
import { Hash } from "../util/hash"

// tslint:disable-next-line:no-var-requires
const levelup = require("levelup") // javascript binding
// tslint:disable-next-line:no-var-requires
const rocksdb = require("rocksdb")  // c++ binding
const logger = getLogger("PeerDb")
logger.level = "debug"

export class PeerDb {
    public db: any // database
    public keys: string[]

    constructor() {
        this.db = levelup(rocksdb("./peerdb"))

        // setInterval(() => {
        //     this.maintainKeys()
        // }, 5*60*1000)

        // test
        setInterval(() => {
            this.maintainKeys()
        }, 5 * 1000)

        // setInterval(()=>{
        //     this.run()
        // },2000)

    }

    public async put(key: string, data: any) {
        return new Promise((resolve, reject) => {
            this.db.put(key, JSON.stringify(data), (err: any) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    }

    public async get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(key, (err: any, value: any) => {
                if (err) {
                    reject(err)
                }
                resolve(value)
            })
        })
    }

    public async listAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            const keys: string[] = []
            this.db.createKeyStream()
                .on("data", (key: string) => {
                    keys.push(key.toString())
                })
                .on("end", () => {
                    logger.debug(`list all`)
                    resolve(keys)
                })
        })
    }

    public async clearAll() {
        return new Promise((resolve, reject) => {
            this.db.createKeyStream()
            .on("data", (key: any) => {
                this.db.del(key)
            })
            .on("end", () => {
                logger.debug("clear db")
                resolve()
            })
        })
    }

    // hash, ip, port, timeStamp
    public async registerPeer(ip: string, port: number): Promise<any> {
        const key = base58.encode(Hash.hash(ip + port.toString()))
        const date = Date.now()
        logger.debug(`Register Peer ${key}: {${ip},${port},${date}}`)
        return await this.put(key, { ip, port, timeStamp: date })
    }

    public async getRandomPeers(n: number): Promise<string[]> {
        try {
            const peerList: string[] = []
            if (n < this.keys.length) {
                const randomlist: number[] = []
                while (randomlist.length < n) {
                    const randomKey = Math.floor(Math.random() * this.keys.length)
                    if (!randomlist.find((ele) => ele === randomKey)) {
                        randomlist.push(randomKey)
                        const peer = await this.get(this.keys[randomKey])
                        peerList.push(peer.toString())
                    }
                }
                return Promise.resolve(peerList)
            } else {
                for (const key of this.keys) {
                    const peer = await this.get(key)
                    peerList.push(peer.toString())
                }
                return Promise.resolve(peerList)
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public async maintainKeys() {
        // await this.clearAll()
        // this.registerPeer('192.168.1.100', 8080)
        // this.registerPeer('192.168.1.100', 8081)
        // this.registerPeer('192.168.1.100', 8082)
        // this.registerPeer('192.168.1.100', 8083)
        // this.registerPeer('192.168.1.100', 8083)
        // this.registerPeer('192.168.1.100', 8085)
        this.keys = await this.listAll()
       // let res = await this.get('GHtUT9ysVsYddA9zmadCjYYGovveEkbj1yAmEK57NExp')
        // logger.debug(res.toString())
        // tslint:disable-next-line:no-console
        console.log(this.keys)
    }

    public async run() {
        const peerList = await this.getRandomPeers(3)
        for (const peer of peerList) {
            const peerParsed = JSON.parse(peer)
            // tslint:disable-next-line:no-console
            console.log(peerParsed.ip, peerParsed.port)
        }
    }
}
