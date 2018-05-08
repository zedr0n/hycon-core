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
    public static peer2key(peer: proto.IPeer): Buffer {
        const hash: any = Hash.hash(peer.host + peer.port.toString()) // TS typechecking is incorrect
        return Buffer.from(hash).slice(0, 4)
    }
    public static peer2value(peer: proto.IPeer): Buffer {
        const buf: any = proto.Peer.encode(peer).finish()// TS typechecking is incorrect
        const value = Buffer.from(buf)
        return value
    }
    public db: levelup.LevelUp // database
    public peers: proto.IPeer[]

    constructor() {
        this.db = levelup(rocksdb("./peerdb"))
        this.peers = []
        const db: any = this.db // TODO: Fix levelup type declarartion
        db.on("open", () => {
            this.maintainKeys()
        })
    }

    public async put(peer: proto.IPeer): Promise<void> {
        try {
            const key = PeerDb.peer2key(peer)
            const value = PeerDb.peer2value(peer)
            await this.db.put(key, value)
            return
        }  catch (e) {
            logger.info(`Failed to put peer ${peer.host}:${peer.port} into PeerDB: ${e}`)
        }
    }

    public async get(key: Buffer): Promise < proto.IPeer > {
        try {
            const result = await this.db.get(key)
            const peer = proto.Peer.decode(result)
            return peer
        } catch (e) {
            logger.info(`Could not get key '${key}': ${e}`)
            throw e
        }
    }

    public async listAll(): Promise < proto.IPeer[] > {
        const peers: proto.IPeer[] = []
        try {
            this.db.createReadStream()
            .on("data", (data: any) => {
                const peer: proto.IPeer = proto.Peer.decode(data.value)
                peers.push(peer)
            })
            .on("end", () => {
                logger.debug(`list all`)
            })
            return Promise.resolve(peers)

        } catch (e) {
            logger.info(`Could not get all keys from DB: ${e}`)
            throw e
        }

    }

    public async remove(key: Buffer): Promise<void> {
        try {
            await this.db.del(key)
        } catch (e) {
            logger.info(`Could not delete the key: ${key} from DB: ${e}`)
            throw e
        }
    }

    public async clearAll(): Promise < void > {
        try {
            this.db.createKeyStream()
            .on("data", (key: Buffer) => {
                this.db.del(key)
            })
            .on("end", () => {
                logger.info("clear db")
                this.peers = []
                return
            })
        } catch (e) {
            logger.info(`Could not clear all elements from DB: ${e}`)
            throw e
        }
    }

    public async getRecentActivePeers(n: number): Promise < proto.IPeer[] > {
        try {
            await new Promise((resolve, reject) => {
                if (n < this.peers.length) {
                    this.peers.sort((a: proto.IPeer, b: proto.IPeer) => {
                        if (a.lastSeen > b.lastSeen) {
                            return -1
                        }
                        if (a.lastSeen < b.lastSeen) {
                            return 1
                        }
                        return 0
                    })
                    return Promise.resolve(this.peers.slice(0, n))
                } else {
                    return Promise.resolve(this.peers)
                }
            })
        } catch (e) {
            logger.info(`Could not get recent active Peers: ${e}`)
            return Promise.reject(e)
        }
    }

    public async maintainKeys() {
        try {
            this.peers = await this.listAll()
        } catch (e) {
            logger.info(`Could not get all keys from DB: ${e}`)
        }
    }
}
