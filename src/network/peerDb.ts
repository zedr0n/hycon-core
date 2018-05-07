import * as base58 from "base-58"
import { getLogger } from "log4js"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"

// tslint:disable-next-line:no-var-requires
import levelup = require("levelup") // javascript binding
// tslint:disable-next-line:no-var-requires
const rocksdb = require("rocksdb")  // c++ binding
const logger = getLogger("PeerDb")
logger.level = "debug"

export class PeerDb {
    public static calculateKey(peer: proto.IPeer): Buffer {
        const hash: any = Hash.hash(peer.host + peer.port.toString()) // TS typechecking is incorrect
        return Buffer.from(hash).slice(0, 4)
    }
    public db: levelup.LevelUp // database
    public public keys: Buffer[]

    constructor() {
        this.db = levelup(rocksdb("./peerdb"))

        // setInterval(() => {
        //     this.maintainKeys()
        // }, 5*60*1000)

        // test
        const db: any = this.db // TODO: Fix levelup type declarartion
        db.on("open", () => {
            this.maintainKeys()
        })

        // setInterval(()=>{
        //     this.run()
        // },2000)

    }

    public async put(peer: proto.IPeer): Promise<void> {
        try {
            const key = PeerDb.calculateKey(peer)
            const buf: any = proto.Peer.encode(peer).finish()// TS typechecking is incorrect
            const value = Buffer.from(buf)
            await this.db.put(key, value)
            if (this.keys.findIndex((key2: Buffer) => key.equals(key2)) === -1) {
                this.keys.push(key)
            }
            return
        } catch (e) {
            logger.info(`Failed to put peer ${peer.host}:${peer.port} into PeerDB: ${e}`)
        }
    }

    public async get(key: Buffer): Promise<proto.Peer> {
        try {
            const result = await this.db.get(key)
            const peer = proto.Peer.decode(result)
            return peer
        } catch (e) {
            logger.info(`Could not get key '${key}': ${e}`)
            throw e
        }
    }

    public async listAll(): Promise< any > {
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
        }), 
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
    public async registerPeer(ip: string, port: number): Promise < any > {
        const key = Hash.hash(ip + port.toString())
        const date = Date.now()
        logger.debug(`Register Peer ${key}: {${ip},${port},${date}}`)
        return await this.put(key, { ip, port, timeStamp: date }), 
    }

    public async getRandomPeers(n: number): Promise<string[] > {
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
                return Promise.resolve(peerList), 
            },
        } catch (e) {
            return Promise.reject(e)
        },
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
