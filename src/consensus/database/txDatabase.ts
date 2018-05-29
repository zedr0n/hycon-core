import { reject } from "delay"
import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import * as sqlite3 from "sqlite3"
import { resolve } from "url"
import { hycontoString } from "../../api/client/stringUtil"
import { Address } from "../../common/address"
import { Block } from "../../common/block"
import { GenesisBlock } from "../../common/blockGenesis"
import { SignedTx } from "../../common/txSigned"
import { Hash } from "../../util/hash"
import { AnySignedTx, IConsensus } from "../iconsensus"
import { BlockStatus } from "../sync"
import { DBTx } from "./dbtx"
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
    public async init(consensus: IConsensus, tipHeight?: number) {
        this.consensus = consensus
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS txdb(idx INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        txhash TEXT,
                                                        blockhash TEXT,
                                                        miner TEXT,
                                                        txto TEXT,
                                                        txfrom TEXT,
                                                        amount TEXT,
                                                        fee TEXT,
                                                        timestamp INTEGER)`)
        })
        if (tipHeight !== undefined) {
            let status: BlockStatus
            let lastHash
            let lastHeight = 0
            let i = 0
            while (true) {
                lastHash = await this.getLastBlock(i++)
                status = await this.consensus.getBlockStatus(lastHash)
                if (status === BlockStatus.MainChain) {
                    lastHeight = await this.consensus.getBlockHeight(lastHash)
                    break
                }
            }

            if (lastHeight < tipHeight) {
                const blocks = await this.consensus.getBlocksRange(lastHeight)
                for (const block of blocks) {
                    const blockHash = new Hash(block.header)
                    if (block instanceof Block) {
                        await this.putTxs(blockHash, block.header.timeStamp, block.txs, block.header.miner.toString())
                    } else {
                        await this.putTxs(blockHash, block.header.timeStamp, block.txs, undefined)
                    }
                }
            }
        }
    }

    public async getLastBlock(idx: number): Promise<Hash | undefined> {
        try {
            const params = { $index: idx }
            let hashData: string = ""
            return new Promise<Hash>(async (resolved, rejected) => {
                this.db.each(`SELECT blockhash FROM txdb ORDER BY timestamp DESC LIMIT $index, 1`, params, (err, row) => {
                    if (row === undefined) {
                        return resolved(undefined)
                    }
                    hashData = row.blockhash
                    return resolved(Hash.decode(hashData))
                })
            })
        } catch (e) {
            if (e.notFound) { return undefined }
            logger.error(`Fail to getlastBlock : ${e}`)
            throw e
        }
    }

    public async putTxs(blockHash: Hash, timestamp: number, txs: AnySignedTx[], miner: string): Promise<void> {
        const stmtUpdate = this.db.prepare(`UPDATE txdb SET blockhash=$blockhash WHERE txhash=$txhash AND blockhash=$preblockhash`)
        const stmtInsert = this.db.prepare(`INSERT INTO txdb (txhash, blockhash, miner, txto, txfrom, amount, fee, timestamp) VALUES ($txhash, $blockhash, $miner, $txto, $txfrom, $amount, $fee, $timestamp)`)
        for (const tx of txs) {
            const txHash = new Hash(tx)
            const preBlockHash = await this.getBlockHash(txHash.toString())
            if (preBlockHash !== "") {
                logger.error(`TxList info is already exsited, so change blockHash of txList : ${preBlockHash} -> ${blockHash} / ${txHash}`)
                if (!Hash.decode(preBlockHash).equals(blockHash)) {
                    const params = {
                        $blockhash: blockHash,
                        $miner: miner,
                        $preblockhash: preBlockHash,
                        $txhash: txHash.toString(),
                    }

                    stmtUpdate.run(params, (err) => {
                        if (err) {
                            throw Error(err.message)
                        }
                    })
                }
            } else {
                let params = {}
                if (tx instanceof SignedTx) {
                    params = {
                        $amount: hycontoString(tx.amount),
                        $blockhash: blockHash.toString(),
                        $fee: hycontoString(tx.fee),
                        $miner: miner,
                        $timestamp: timestamp,
                        $txfrom: tx.from.toString(),
                        $txhash: txHash.toString(),
                        $txto: tx.to.toString(),
                    }
                } else {
                    params = {
                        $amount: hycontoString(tx.amount),
                        $blockhash: blockHash.toString(),
                        $timestamp: timestamp,
                        $txhash: txHash.toString(),
                        $txto: tx.to.toString(),
                    }
                }
                stmtInsert.run(params)

            }
        }
        stmtUpdate.finalize()
        stmtInsert.finalize()
    }

    public async getLastTxs(address: Address, result: DBTx[] = [], idx: number = 0, count?: number): Promise<DBTx[]> {
        const params = {
            $address: address.toString(),
            $count: count - result.length,
            $startIndex: idx * count,
        }
        return new Promise<DBTx[]>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, timestamp FROM txdb WHERE txto = $address OR txfrom = $address ORDER BY timestamp DESC LIMIT $startIndex, $count`, params, async (err, rows) => {
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.timestamp))
                    }
                    if (result.length === count) { break }
                }
                if (rows.length < count) {
                    return resolved(result)
                }
                if (result.length < count) {
                    result = await this.getLastTxs(address, result, ++idx, count)
                }
                return resolved(result)
            })
        })
    }

    public async getNextTxs(address: Address, txHash: Hash, result: DBTx[] = [], idx: number = 1, count?: number): Promise<DBTx[]> {
        const params = {
            $address: address.toString(),
            $count: count - result.length,
            $startIndex: idx * count,
            $txhash: txHash.toString(),
        }
        return new Promise<DBTx[]>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, timestamp FROM txdb WHERE (timestamp <= (SELECT timestamp FROM txdb WHERE txhash = $txhash)) AND (txto = $address OR txfrom = $address) ORDER BY timestamp DESC LIMIT $startIndex, $count`, params, async (err, rows) => {
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.timestamp))
                    }

                    if (result.length === count) { break }
                }
                if (rows.length < count) {
                    return resolved(result)
                }
                if (result.length < count) {
                    result = await this.getNextTxs(address, txHash, result, ++idx, count)
                }
                return resolved(result)
            })
        })

    }

    public async getTx(key: Hash): Promise<{ tx: DBTx, confirmation: number } | undefined> {
        const params = { $txhash: key.toString() }
        let tx: DBTx
        return new Promise<{ tx: DBTx, confirmation: number } | undefined>(async (resolved, rejected) => {
            this.db.each(`SELECT txhash, txto, txfrom, amount, fee, blockhash, timestamp FROM txdb WHERE txhash = $txhash`, params, async (err, row) => {
                if (row === undefined) { return resolved(undefined) }
                tx = new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.timestamp)
                // const block = await this.consensus.getHeaderByHash(tx.blockHash)
                const height = await this.consensus.getBlockHeight(Hash.decode(tx.blockhash))
                const tip = this.consensus.getBlocksTip()
                const confirmation = tip.height - height
                resolved({ tx, confirmation })
            })
        })
    }

    // public getMinedBlock(minerAddr: string): Promise<{tx: Tx[] | undefined}> {
    //     const params = { $miner: minerAddr }
    //     // return new Promise<{tx: Block[]}>((resolved, rejected) => {

    //     // })
    //     return new Promise<{undefined}>()
    // }

    private async getBlockHash(txhash: string): Promise<string> {
        try {
            let blockhash = ""
            this.db.each(`SELECT blockhash FROM txdb WHERE txhash=$txhash`, (err, row) => {
                blockhash = row.blockhash
            })
            return Promise.resolve(blockhash)
        } catch (e) {
            if (e.notFound) { return Promise.resolve("") }
        }
    }
}
