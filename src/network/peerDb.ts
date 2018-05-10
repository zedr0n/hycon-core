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
    public static ipeer2key(peer: proto.IPeer): string {
        const hash = new Hash(peer.host + peer.port.toString()) // TS typechecking is incorrect
        return hash.toHex()
    }
    public static ipeer2value(peer: proto.IPeer): Buffer {
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
        db.on("open", async () => {
            await this.maintainKeys()
        })
    }

    public async put(peer: proto.IPeer): Promise<void> {
        try {
            const key = PeerDb.ipeer2key(peer)
            const value = PeerDb.ipeer2value(peer)
            await this.db.put(key, value)
            const index = this.peers.indexOf(peer)
            if (index > -1) {
                this.peers[index] = peer
            } else {
                this.peers.push(peer)
            }
            logger.info(`Saved to db ${peer.host}:${peer.port}`)
            return
        }  catch (e) {
            logger.info(`Failed to put peer ${peer.host}:${peer.port} into PeerDB: ${e}`)
            throw e
        }
    }

    public async get(key: string): Promise < proto.IPeer > {
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
                logger.info(`reload peers:${peers.length} from peer db`)
                for ( const peer of peers) {
                    logger.info(`${peer.host}:${peer.port}`)
                }
            })
            return Promise.resolve(peers)

        } catch (e) {
            logger.info(`Could not get all keys from DB: ${e}`)
            throw e
        }

    }

    public async remove(peer: proto.IPeer): Promise<void> {
        try {
            const key = PeerDb.ipeer2key(peer)
            await this.db.del(key)
            const index = this.peers.indexOf(peer)
            if (index > -1) {
                this.peers.splice(index, 1)
            } else {
                logger.warn(`cannot found at peers: ${peer.host}:${peer.port}`)
            }
        } catch (e) {
            logger.info(`Could not delete from db: ${peer.host}:${peer.port}`)
        }
    }

    public async clearAll(): Promise < void > {
        try {
            this.db.createKeyStream()
            .on("data", async (key: string) => {
                await this.db.del(key)
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

    public async maintainKeys(): Promise <void> {
        try {
            this.peers = await this.listAll()
        } catch (e) {
            logger.info(`Could not get all keys from DB: ${e}`)
        }
    }
}
