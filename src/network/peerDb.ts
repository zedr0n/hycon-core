// import * as fs from 'fs-extra'
// import * as protobuf from 'protobufjs'
// import * as proto from '../serialization/proto'
// import { PeerApp } from "./peerApp"
// import { getLogger } from 'log4js'
// const logger = getLogger('PeerDb')

// export class PeerDb {
//     public peers: PeerApp[] = []
//     public pendingSave: boolean = false
//     public filename!: string
//     constructor() {
//         this.pendingSave = false
//     }

//     public async peerDbInit(param: string | Peer[]): Promise<undefined> {
//         try {
//             if (typeof param == 'string') {
//                 this.filename = param
//                 await this.load(this.filename)
//             } else if (param !== undefined) {
//                 await this.addAll(param, false)
//             }
//             return Promise.resolve(undefined)
//         } catch (e) {
//             logger.error(`Fail to peerList Initialization : ${e}`)
//             return Promise.reject(e)
//         }
//     }

//     public async load(filename?: string): Promise<boolean> {
//         if (filename == undefined) {
//             if (this.filename == undefined) {
//                 this.filename = './peers'
//             }
//             filename = this.filename
//         } else {
//             this.filename = filename
//         }

//         try {
//             const buf = fs.readFileSync(filename)
//             const newPeers = proto.Peers.decode(buf)
//             let count = 0
//             for (const peer of newPeers.peers) {
//                 if (await this.add(new Peer(peer), false)) {
//                     count++
//                 }
//             }
//             return Promise.resolve(true)
//         } catch (e) {
//             logger.error(`Fail to load peer : ${e}`)
//         }
//         return Promise.resolve(false)
//     }

//     private async _save(filename: string): Promise<boolean> {
//         this.pendingSave = false
//         if (filename == undefined) {
//             return false
//         }
//         const buf = proto.Peers.encode({ peers: this.peers }).finish()
//         try {
//             await fs.writeFile(filename, buf, { encoding: 'buffer', flag: 'w' })
//             return Promise.resolve(true)
//         } catch (e) {
//             logger.error(`Fail to save peer : ${e}`)
//         }
//         return Promise.resolve(false)
//     }

//     public async save(filename: string = this.filename) {
//         if (!this.pendingSave) {
//             this.pendingSave = true
//             setTimeout(async () => { await this._save(filename) }, 100)
//         }
//     }

//     //adds peer to peer list, will be called after comparing list
//     public async add(peer: Peer, save: boolean = true): Promise<boolean> {
//         for (let i = 0; i < this.peers.length; i++) {
//             if (this.peers[i].equals(peer)) {
//                 return Promise.resolve(false)
//             }
//         }

//         this.peers.push(peer)

//         if (save) {
//             await this.save()
//         }
//         return Promise.resolve(true)
//     }

//     public async addAll(peers: Peer[], save: boolean = true): Promise<number> {
//         let count = 0;
//         for (const peer of peers) {
//             if (await this.add(peer, false)) {
//                 count++
//             }
//         }
//         if (save) {
//             await this.save()
//         }
//         return Promise.resolve(count)
//     }

//     //removes peer from list, maybe after period of inactivity
//     public remove(peer: Peer): boolean {
//         return Collections.arrays.remove(
//             this.peers,
//             peer,
//             Peer.prototype.equals.bind(peer),
//         );
//     }

//     //exports a random peer
//     public random(): Peer {
//         const index = Math.floor(Math.random() * this.peers.length);
//         return this.peers[index]
//     }
// }


// import { Server } from './server'
import { getLogger } from 'log4js'
const logger = getLogger('PeerDb')
const levelup = require('levelup') // javascript binding
const rocksdb = require('rocksdb')  // c++ binding

export class PeerDb {    
    public db: any // database

    constructor() {
        this.db = levelup(rocksdb('./peerdb'))

        setTimeout(() => {
            this.run()
        }, 1000);
    }

    public async put(key: string, data: any) {
        return new Promise((resolve, reject) => {
            this.db.put(key, JSON.stringify(data), (err: any) => {
                if (err)
                    reject(err)
                resolve()
            })
        })
    }
    public async get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(key, (err: any, value: any) => {
                if (err)
                    reject(err)
                resolve(value)
            })
        })
    }
    public async listAll() {
        return new Promise((resolve, reject) => {
            var index = 1
            this.db.createReadStream({ gt: "a", lt: "z" })
                .on('data', (data: any) => {
                    logger.debug(`${index}  Key=${data.key} Data=${data.value}`)
                    index++
                })
                .on('end', function () {
                    logger.debug(`Done`)
                    resolve()
                })
        })
    }
    public async run() {
        //var key = "apple" + new Date().toString()
        //var data = { Ip: '127.0.0.1', Port: 8148, Time: new Date().toString() }
        //await this.put(key, data)
        //var data2 = JSON.parse(await this.get(key))
        await this.listAll()
        logger.debug(`Done`)
    }
    // name , ip, port
    public async registerPeer(info: any) {
        logger.debug(`Register Peer ${info.name} ${info.ip}:${info.port}`)
        await this.put(info.name, { name: info.name, ip: info.ip, port: info.port })
    }
}

