import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import * as sqlite3 from "sqlite3"
import { Address } from "../../common/address"
import { Block } from "../../common/block"
import { SignedTx } from "../../common/txSigned"
import { Hash } from "../../util/hash"
import { AnySignedTx, IConsensus } from "../iconsensus"
import { BlockStatus } from "../sync"
import { TxList } from "./txList"
const sqlite = sqlite3.verbose()
const logger = getLogger("TxDB")

export class TxDatabase {

    private database: levelup.LevelUp
    private db: sqlite3.Database
    private consensus: IConsensus
    constructor(path: string) {
        const rocks: any = rocksdb(path)
        this.database = levelup(rocks)
        this.db = new sqlite.Database(path + `sql`)
    }
    public async init(consensus: IConsensus, tipHeight: number) {
        this.consensus = consensus
        this.db.serialize( () => {
            this.db.run(`CREATE TABLE IF NOT EXISTS txdb(idx number PRIMARY KEY AUTOINCREMENT,
                                                        txhash TEXT,
                                                        blockhash TEXT,
                                                        txto TEXT,
                                                        txfrom TEXT,
                                                        amount TEXT,
                                                        fee TEXT,
                                                        timestamp number)`)
        })

        // if (lastHash !== undefined) {
        //     await this.consensus.getBlockStatus(lastHash)
        //     lastHeight = await this.consensus.getBlockHeight(lastHash)
        // }
        let status: BlockStatus
        let lastHash
        let lastHeight = 0
        let i = 0
        while ( true ) {
            lastHash = await this.getLastBlock(i++)
            status = await this.consensus.getBlockStatus(lastHash)
            if ( status === BlockStatus.MainChain ) {
               lastHeight = await this.consensus.getBlockHeight(lastHash)
               break
            }
        }

        if (lastHeight < tipHeight) {
            const blocks = await this.consensus.getBlocksRange(lastHeight)
            for (const block of blocks) {
                const blockHash = new Hash(block.header)
                await this.putTxs(blockHash, block.txs)
            }
        }
    }

    public async getLastBlock(idx: number): Promise<Hash> {
        try {
            // const hashData = new Uint8Array(await this.database.get("lastBlock"))
            const params = {
                $index: idx,
            }
            let hashData: string = ""
            this.db.each(`SELECT blockhash FROM txdb ORDER BY timestamp DESC LIMIT $index, 1`, (err, row) => {
                hashData = row.blockHash
            })

            return new Hash(hashData)
        } catch (e) {
            if (e.notFound) { return undefined }
            logger.error(`Fail to getlastBlock : ${e}`)
            throw e
        }
    }

    public async updateTxStatus(status: BlockStatus, hash: string) {
        try {
            const params = {
                $hash: hash,
                $status: status,
            }

            const stmt = this.db.prepare("UPDATE txdb SET status=($status) WHERE blockhash=($hash)")
            stmt.run(params, (err) => {
                if (err) {
                    throw Error( err.message )
                }
            })
        } catch (e) {
            logger.error(`Fail to updateTxDB : ${e}`)
        }
    }

    public async putTxs(blockHash: Hash, txs: AnySignedTx[]): Promise<void> {
        // const batch: levelup.Batch[] = []
        // const mapLastTx: Map<string, Hash> = new Map<string, Hash>()

        const stmtUpdate = this.db.prepare(`UPDATE txdb SET blockhash=$blockhash WHERE txhash=$txhash AND blockhash=$preblockhash`)
        const stmtInsert = this.db.prepare(`INSERT INTO txdb VALUES ($txhash, $blockhash, $txto, $txfrom, $amount, $fee, $timestamp)`)
        for (const tx of txs) {
            const txHash = new Hash(tx)
            // const existedCheck = await this.get(txHash)
            const preBlockHash = await this.get(txHash.toString())
            if (preBlockHash !== "") {
                logger.error(`TxList info is already exsited, so change blockHash of txList : ${preBlockHash} -> ${blockHash} / ${txHash}`)
                // if (!existedCheck.blockHash.equals(blockHash)) {
                //     existedCheck.blockHash = blockHash
                //     batch.push({ type: "put", key: txHash.toString(), value: existedCheck.encode() })
                // }
                if (!Hash.decode(preBlockHash).equals(blockHash)) {
                    const params = {
                        $blockhash: blockHash,
                        $preblockhash: preBlockHash,
                        $txhash: txHash.toString(),
                    }

                    stmtUpdate.run(params, (err) => {
                        if (err) {
                            throw Error( err.message )
                        }
                    })
                }
            } else {
                // const txList = new TxList(tx)
                // txList.blockHash = blockHash

                // const toAddress = tx.to.toString()
                // let tLastTx = mapLastTx.get(toAddress)
                // if (tLastTx === undefined) {
                //     const lastTx = await this.get(tx.to)
                //     if (lastTx) { tLastTx = new Hash(lastTx.tx) }
                // }
                // if (tLastTx !== undefined) { txList.previousTo = tLastTx }
                // mapLastTx.set(toAddress, txHash)

                // if (tx instanceof SignedTx) {
                //     const fromAddress = tx.from.toString()
                //     let fLastTx = mapLastTx.get(fromAddress)
                //     if (fLastTx === undefined) {
                //         const lastTx = await this.get(tx.from)
                //         if (lastTx) { fLastTx = new Hash(lastTx.tx) }
                //     }
                //     if (fLastTx !== undefined) { txList.previousFrom = fLastTx }
                //     mapLastTx.set(fromAddress, txHash)
                // }
                // batch.push({ type: "put", key: txHash.toString(), value: txList.encode() })
                if (tx instanceof SignedTx) {
                    const params = {
                        $amount: tx.amount,
                        $blockhash: blockHash.toString(),
                        $fee: tx.fee,
                        $timestamp: tx,
                        $txfrom: tx.from.toString(),
                        $txhash: txHash.toString(),
                        $txto: tx.to.toString(),
                    }
                    stmtInsert.run()
                }

            }
            for (const key of mapLastTx.keys()) {
                const txhash = mapLastTx.get(key)
                batch.push({ type: "put", key, value: txhash.toBuffer() })
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

    public async getLastTxs(address: Address, count?: number): Promise<Array<{ txList: TxList, timestamp: number }>> {
        const result: Array<{ txList: TxList, timestamp: number }> = []
        let txList = await this.get(address)
        while (txList) {
            if (await this.consensus.getBlockStatus(txList.blockHash) === BlockStatus.MainChain) {
                const block = await this.consensus.getHeaderByHash(txList.blockHash)
                result.push({ txList, timestamp: block.timeStamp })
            }
            if (result.length === count) { break }
            if (txList.tx.to.equals(address)) {
                if (txList.previousTo !== undefined) {
                    txList = await this.get(txList.previousTo)
                } else { break }
            } else if (txList.tx instanceof SignedTx) {
                if (txList.tx.from.equals(address)) {
                    if (txList.previousFrom !== undefined) {
                        txList = await this.get(txList.previousFrom)
                    } else { break }
                }
            }
        }
        return Promise.resolve(result)
    }

    public async getNextTxs(address: Address, txHash: Hash, count?: number): Promise<Array<{ txList: TxList, timestamp: number }>> {
        let txList = await this.get(txHash)
        const txs: Array<{ txList: TxList, timestamp: number }> = []
        while (txList) {
            if (txs.length === count) { break }
            if (txList.tx.to.equals(address)) {
                if (txList.previousTo !== undefined) {
                    txList = await this.get(txList.previousTo)
                } else {
                    txList = undefined
                }
            } else if (txList.tx instanceof SignedTx) {
                if (txList.tx.from.equals(address)) {
                    if (txList.previousFrom !== undefined) {
                        txList = await this.get(txList.previousFrom)
                    } else {
                        txList = undefined
                    }
                }
            }
            if (txList !== undefined) {
                const block = await this.consensus.getHeaderByHash(txList.blockHash)
                txs.push({ txList, timestamp: block.timeStamp })
            }
        }
        return txs
    }

    public async getTx(key: Hash): Promise<{ tx: TxList, timestamp: number, confirmation: number } | undefined> {
        const tx = await this.get(key)
        if (tx === undefined) { return undefined }
        const block = await this.consensus.getHeaderByHash(tx.blockHash)
        const height = await this.consensus.getBlockHeight(tx.blockHash)
        const tip = this.consensus.getBlocksTip()
        const confirmation = tip.height - height
        return Promise.resolve({ tx, timestamp: block.timeStamp, confirmation })
    }

    // private async get(key: Address | Hash): Promise<TxList | undefined> {
    private async get(txhash: string): Promise<string> {
        // let decodingDBEntry = false
        try {
            // let dbKey = key
            // if (key instanceof Address) {
            //     const hashData = new Uint8Array(await this.database.get(key.toString()))
            //     dbKey = new Hash(hashData)
            // }
            let blockhash = ""
            this.db.each(`SELECT blockhash FROM txdb WHERE txhash=$txhash`, (err, row) => {
                blockhash = row.blockhash
            })
            // const value = await this.database.get(dbKey.toString())
            // decodingDBEntry = true
            // const txList = TxList.decode(value)
            return Promise.resolve(blockhash)
        } catch (e) {
            if (e.notFound) { return Promise.resolve("") }
            // if (decodingDBEntry) { logger.error(`Fail to decode TxList`) }
            // return Promise.reject(`Fail to getLastTx of ${key} : ${e}`)
        }
    }
}
