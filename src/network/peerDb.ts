import { getLogger } from 'log4js'
import { Hash } from '../util/hash'
import * as base58 from 'base-58'
import { resolve } from 'path';
import { reject } from 'delay';
const levelup = require('levelup') // javascript binding
const rocksdb = require('rocksdb')  // c++ binding
const logger = getLogger('PeerDb')
logger.level = "debug"

export class PeerDb {    
    public db: any // database
    public keys: string[]

    constructor() {
        this.db = levelup(rocksdb('./peerdb'))

        // setInterval(() => {
        //     this.maintainKyes()
        // }, 5*60*1000)

        //test
        setInterval(() => {
            this.maintainKyes()
        }, 5*1000)

        // setInterval(()=>{
        //     this.run()
        // },2000)


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

    public async listAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            let keys:string[] = []
            this.db.createKeyStream()
                .on('data', (key: string) => {
                    keys.push(key.toString())
                })
                .on('end', function () {
                    logger.debug(`list all`)
                    resolve(keys)
                })
        })
    }

    public async clearAll(){
        return new Promise((resolve,reject)=>{
            this.db.createKeyStream()
            .on('data', (key:any)=>{
                this.db.del(key)
            })
            .on('end', () =>{
                logger.debug('clear db')
                resolve()
            })
        })
    }

    // hash, ip, port, timeStamp
    public async registerPeer(ip:string, port:number): Promise<any> {
        let key = base58.encode(Hash.hash(ip+port.toString()))
        let date = Date.now()
        logger.debug(`Register Peer ${key}: {${ip},${port},${date}}`)
        return await this.put(key, { ip: ip, port: port, timeStamp: date })
    }

    public async getRandomPeers(n:number): Promise<string[]>{
        try{
            let peerList:string[] = []
            if(n<this.keys.length){
                let randomlist:number[] = []   
                while(randomlist.length < n){
                    let randomKey = Math.floor(Math.random()*this.keys.length)
                    if(!randomlist.find((ele)=>ele==randomKey)){
                        randomlist.push(randomKey)
                        let peer = await this.get(this.keys[randomKey])
                        peerList.push(peer.toString())
                    }
                }
                return Promise.resolve(peerList)
            }
            else{
                for(let i=0;i<this.keys.length;i++){
                    let peer = await this.get(this.keys[i])
                    peerList.push(peer.toString())
                }
                return Promise.resolve(peerList)
            }
        }
        catch(e){
            return reject(e)
        }
    }

    public async maintainKyes() {
        //await this.clearAll()
        // this.registerPeer('192.168.1.100', 8080)
        // this.registerPeer('192.168.1.100', 8081)
        // this.registerPeer('192.168.1.100', 8082)
        // this.registerPeer('192.168.1.100', 8083)
        // this.registerPeer('192.168.1.100', 8083)
        // this.registerPeer('192.168.1.100', 8085)
        this.keys = await this.listAll()
       // let res = await this.get('GHtUT9ysVsYddA9zmadCjYYGovveEkbj1yAmEK57NExp')
        //logger.debug(res.toString())
        console.log(this.keys)
    }

    public async run(){
        let peerList = await this.getRandomPeers(3)
        for(let i=0;i<peerList.length;i++){
            let peer = JSON.parse(peerList[i])
            console.log(peer.ip, peer.port)
        }   
    }
}

