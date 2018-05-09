
import { ADDRGETNETWORKPARAMS } from "dns"
import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { Address } from "../../common/address"
import { AnyBlock } from "../../common/block"
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
    public async init(blocks: AnyBlock[]) {
        // TODO : Init logic in txDB
    }

    public async getLastBlock(txs: AnySignedTx[]): Promise<Hash> {
        const hashData = await this.database.get("lastBlock")
        return Hash.decode(hashData.toString())
    }

    public async putTxs(blockHash: Hash, txs: AnySignedTx[]): Promise<void> {
        const batch: levelup.Batch[] = []
        const mapLastTx: Map<string, Hash> = new Map<string, Hash>()
        for (const tx of txs) {
            if (!verifyTx(tx)) { continue }
            const txList = new TxList(tx)
            txList.blockHash = blockHash
            // TODO : How to handle same tx different block? If db key change txHash to txListHash,
            // Every time a previousTo or previousFrom changes, key have to changed...
            const txHash = new Hash(tx)

            const toAddress = tx.to.toString()
            let tLastTx = mapLastTx.get(toAddress)
            if (tLastTx === undefined) {
                const lastTx = await this.getTx(tx.to)
                if (lastTx) { tLastTx = new Hash(lastTx.tx) }
            }
            if (tLastTx !== undefined) { txList.previousTo = tLastTx }
            mapLastTx.set(toAddress, txHash)

            if (tx instanceof SignedTx) {
                const fromAddress = tx.from.toString()
                let fLastTx = mapLastTx.get(fromAddress)
                if (fLastTx === undefined) {
                    const lastTx = await this.getTx(tx.from)
                    if (lastTx) { fLastTx = new Hash(lastTx.tx) }
                }
                if (fLastTx !== undefined) { txList.previousFrom = fLastTx }
                mapLastTx.set(fromAddress, txHash)
            }
            batch.push({ type: "put", key: txHash.toString(), value: txList.encode() })
        }
        for (const key of mapLastTx.keys()) {
            const txListHash = mapLastTx.get(key)
            batch.push({ type: "put", key, value: txListHash.toString() })
        }
        batch.push({ type: "put", key: "lastBlock", value: blockHash.toString() })
        await this.database.batch(batch)
    }

    public async getLastTxs(address: Address, count?: number): Promise<TxList[]> {
        const txs: TxList[] = []
        let txList = await this.getTx(address)
        while (txList) {
            txs.push(txList)
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
        // TODO : Return with blockHash?
        return Promise.resolve(txs)
    }

    private async getTx(key: Address | Hash): Promise<TxList | undefined> {
        let decodingDBEntry = false
        try {
            let dbKey = key
            if (key instanceof Address) {
                const dbData = await this.database.get(key.toString())
                decodingDBEntry = true
                dbKey = Hash.decode(dbData.toString())
                decodingDBEntry = false
            }
            const value = await this.database.get(dbKey.toString())
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
