
import { getHashes } from "crypto"
import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { Address } from "../../common/address"
import { AnyBlock, Block } from "../../common/block"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
import * as proto from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { AnySignedTx } from "../iconsensus"
import { SingleChain, verifyTx } from "../singleChain"
import { Database } from "./database"
import { TxList } from "./txList"
const logger = getLogger("TxDB")

export class TxDatabase {

    private database: levelup.LevelUp
    constructor(path: string) {
        const rocks: any = rocksdb(path)
        this.database = levelup(rocks)
    }
    public async init(blockDB: Database, tipHeight: number) {
        const lastHash = await this.getLastBlock()
        let lastHeight = 0
        if (lastHash !== undefined) { lastHeight = await blockDB.getBlockHeight(lastHash) }
        if (lastHeight < tipHeight) {
            const blocks = await blockDB.getBlocksRange(lastHeight)
            for (const block of blocks) {
                const blockHash = new Hash(block.header)
                await this.putTxs(blockHash, block.txs)
            }
        }
    }

    public async getLastBlock(): Promise<Hash> {
        try {
            const hashData = new Uint8Array(await this.database.get("lastBlock"))
            return new Hash(hashData)
        } catch (e) {
            if (e.notFound) { return undefined }
            logger.error(`Fail to getlastBlock : ${e}`)
            throw e
        }
    }

    public async putTxs(blockHash: Hash, txs: AnySignedTx[]): Promise<void> {
        logger.info(`PutTxs length : ${txs.length}`)
        const batch: levelup.Batch[] = []
        const mapLastTx: Map<string, Hash> = new Map<string, Hash>()
        for (const tx of txs) {
            if (!verifyTx(tx)) { continue }
            const txHash = new Hash(tx)
            const existedCheck = await this.getTx(txHash)
            if (existedCheck !== undefined) {
                logger.error(`TxList info is already exsited, so change blockHash of txList : ${existedCheck.blockHash} -> ${blockHash} / ${txHash}`)
                if (!existedCheck.blockHash.equals(blockHash)) {
                    existedCheck.blockHash = blockHash
                    batch.push({ type: "put", key: txHash.toString(), value: existedCheck.encode() })
                }
            } else {
                const txList = new TxList(tx)
                txList.blockHash = blockHash

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
                batch.push({ type: "put", key, value: txListHash.toBuffer() })
            }
        }
        batch.push({ type: "put", key: "lastBlock", value: blockHash.toBuffer() })

        await this.database.batch(batch)
        // logger.error(`After put to TxDB Check Using Address!!!!`)
        // for (const tx of txs) {
        //     if (!verifyTx(tx)) { continue }
        //     const toLastTxList = await this.getLastTxs(tx.to, 1)
        //     logger.warn(`${tx.to} last Tx's previous Hashes : ${toLastTxList[0].previousTo} / ${toLastTxList[0].previousFrom}`)
        //     if (tx instanceof SignedTx) {
        //         const fromLastTxList = await this.getLastTxs(tx.from, 1)
        //         const fTx = fromLastTxList[0].tx
        //         if (fTx instanceof SignedTx) {
        //             logger.warn(`${tx.from} last Tx :  ${fTx.from}`)
        //         }
        //     }
        // }
    }

    public async getLastTxs(address: Address, count?: number): Promise<TxList[]> {
        const txs: TxList[] = []
        let txList = await this.getTx(address)
        // TODO : Have to check block status before return? Should txDB have blockDatabase?
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
        return Promise.resolve(txs)
    }

    public async getTx(key: Address | Hash): Promise<TxList | undefined> {
        let decodingDBEntry = false
        try {
            let dbKey = key
            if (key instanceof Address) {
                const hashData = new Uint8Array(await this.database.get(key.toString()))
                dbKey = new Hash(hashData)
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
