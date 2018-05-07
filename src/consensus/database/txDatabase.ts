
import { ADDRGETNETWORKPARAMS } from "dns"
import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { Address } from "../../common/address"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
import * as proto from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { AnySignedTx } from "../iconsensus"
import { verifyTx } from "../singleChain"
import { TxList } from "./txList"
const logger = getLogger("TxDB")

// tslint:disable:no-bitwise
export class TxDatabase {
    private database: levelup.LevelUp
    constructor(path: string) {
        const rocks: any = rocksdb(path)
        this.database = levelup(rocks)
        logger.info(`Now, you can use txDB.`)
        // TODO : Init txDB info from file.
    }

    public async putTxs(txs: AnySignedTx[]): Promise<void> {
        logger.info(`In putTxs : `, txs)
        const batch: levelup.Batch[] = []
        const mapLastTx: Map<string, TxList> = new Map<string, TxList>()
        for (const tx of txs) {
            if (!verifyTx(tx)) { continue }
            const txList = new TxList(tx)
            const txHash = new Hash(tx)

            const toAddress = tx.to.toString()
            let tLastTx = mapLastTx.get(toAddress)
            if (tLastTx === undefined) { tLastTx = await this.getLastTx(tx.to) }
            if (tLastTx !== undefined) { txList.previousTo = new Hash(tLastTx.tx) }

            if (tx instanceof SignedTx) {
                logger.info(`This is signedTx`)
                const fromAddress = tx.from.toString()
                let fLastTx = mapLastTx.get(fromAddress)
                if (fLastTx === undefined) { fLastTx = await this.getLastTx(tx.from) }
                if (fLastTx !== undefined) { txList.previousFrom = new Hash(fLastTx.tx) }
                mapLastTx.set(fromAddress, txList)
            }
            mapLastTx.set(toAddress, txList)
            batch.push({ type: "put", key: txHash.toString(), value: txList.encode() })
        }
        for (const key of mapLastTx.keys()) {
            batch.push({ type: "put", key, value: mapLastTx.get(key) })
        }
        logger.info(`Setted batch array in putTxs : `, batch)
        await this.database.batch(batch)
    }

    private async getLastTx(address: Address): Promise<TxList | undefined> {
        let decodingDBEntry = false
        try {
            const value = await this.database.get(address.toString())
            decodingDBEntry = true
            const txList = TxList.decode(value)
            return Promise.resolve(txList)
        } catch (e) {
            if (e.notFound) { return Promise.resolve(undefined) }
            if (decodingDBEntry) { logger.error(`Fail to decode TxList`) }
            return Promise.reject(`Fail to getLastTx`)
        }
    }

    // public async getLastTxs(address: Address, count?: number): Promise<AnySignedTx[]> {

    // }

    // private async getAllTxs(): Promise<DBTx[]> {
    //     const results: DBTx[] = []
    //     return new Promise<DBTx[]>((resolve, reject) => {
    //         try {
    //             this.database.createReadStream({ gt: "t", lt: "u" })
    //                 .on("data", (data: any) => {
    //                     const result = DBTx.decode(data.value)
    //                     if (results.length === 0) { results.push(result) }
    //                     let min = -1
    //                     let max = results.length
    //                     let i = (min + max) >> 1
    //                     while (max - min > 1) {
    //                         if (result.blockHeight === results[i].blockHeight) {
    //                             min = max = i
    //                             break
    //                         } else if (result.blockHeight > results[i].blockHeight) {
    //                             max = i
    //                         } else if (result.blockHeight < results[i].blockHeight) {
    //                             min = i
    //                         }
    //                         i = (min + max) >> 1
    //                     }
    //                     results.splice(i + 1, 0, result)
    //                 })
    //                 .on("end", () => {
    //                     resolve(results)
    //                 })
    //         } catch (error) {
    //             logger.error(`Fail to slowSearch : ${error}`)
    //             return Promise.reject(error)
    //         }
    //     })
    // }

    // private async getTxByDBTx(dbtx: DBTx): Promise<AnySignedTx> {

    // }
}
