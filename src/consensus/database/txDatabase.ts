
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
import { SingleChain, verifyTx } from "../singleChain"
import { TxList } from "./txList"
const logger = getLogger("TxDB")

export class TxDatabase {
    private database: levelup.LevelUp
    constructor(path: string) {
        const rocks: any = rocksdb(path)
        this.database = levelup(rocks)
        logger.info(`Now, you can use txDB.`)
        // TODO : Init txDB info from file.
    }

    public async putTxs(txs: AnySignedTx[]): Promise<void> {
        const batch: levelup.Batch[] = []
        const mapLastTx: Map<string, TxList> = new Map<string, TxList>()
        for (const tx of txs) {
            if (!verifyTx(tx)) { continue }
            const txList = new TxList(tx)
            const txHash = new Hash(tx)

            const toAddress = tx.to.toString()
            let tLastTx = mapLastTx.get(toAddress)
            if (tLastTx === undefined) { tLastTx = await this.getTx(tx.to) }
            if (tLastTx !== undefined) { txList.previousTo = new Hash(tLastTx.tx) }

            if (tx instanceof SignedTx) {
                const fromAddress = tx.from.toString()
                let fLastTx = mapLastTx.get(fromAddress)
                if (fLastTx === undefined) { fLastTx = await this.getTx(tx.from) }
                if (fLastTx !== undefined) { txList.previousFrom = new Hash(fLastTx.tx) }
                mapLastTx.set(fromAddress, txList)
            }
            mapLastTx.set(toAddress, txList)
            batch.push({ type: "put", key: txHash.toString(), value: txList.encode() })
        }
        for (const key of mapLastTx.keys()) {
            const txList = mapLastTx.get(key)
            const encodeData = txList.encode()
            const decodeData = TxList.decode(encodeData)
            batch.push({ type: "put", key, value: txList.encode() })
        }
        await this.database.batch(batch)
    }

    public async getLastTxs(address: Address, count?: number): Promise<AnySignedTx[]> {
        const txs: AnySignedTx[] = []
        let txList = await this.getTx(address)
        while (true) {
            txs.push(txList.tx)
            if (txs.length === count) { break }
            if (txList.tx.to.equals(address)) {
                if (txList.previousTo !== undefined) {
                    txList = await this.getTx(txList.previousTo)
                } else { break }
            } else if (txList.tx instanceof SignedTx) {
                if (txList.tx.from.equals(address)) {
                    if (txList.previousFrom !== undefined) {
                        txList = await this.getTx(txList.previousFrom)
                    } else { break }
                }
            }
        }
        return Promise.resolve(txs)
    }

    private async getTx(key: Address | Hash): Promise<TxList | undefined> {
        let decodingDBEntry = false
        try {
            const value = await this.database.get(key.toString())
            decodingDBEntry = true
            const txList = TxList.decode(value)
            return Promise.resolve(txList)
        } catch (e) {
            if (e.notFound) { return Promise.resolve(undefined) }
            if (decodingDBEntry) { logger.error(`Fail to decode TxList`) }
            return Promise.reject(`Fail to getLastTx of ${key} : ${e}`)
        }
    }
}
