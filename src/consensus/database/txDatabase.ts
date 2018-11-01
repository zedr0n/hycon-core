import { getLogger } from "log4js"
import Long = require("long")
import * as sqlite3 from "sqlite3"
import { hyconfromString, hycontoString } from "../../api/client/stringUtil"
import { Address } from "../../common/address"
import { Block } from "../../common/block"
import { BlockHeader } from "../../common/blockHeader"
import { SignedTx } from "../../common/txSigned"
import { Hash } from "../../util/hash"
import { AnySignedTx, IConsensus } from "../iconsensus"
import { BlockStatus } from "../sync"
import { DBTx } from "./dbtx"
import { ITxDatabase } from "./itxDatabase"
// tslint:disable-next-line:no-var-requires
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase
const sqlite = sqlite3.verbose()
const logger = getLogger("TxDB")
const NONCE_UPDATE_UNIT = 10000

export class TxDatabase implements ITxDatabase {
    public db: sqlite3.Database
    private consensus: IConsensus
    constructor(path: string) {
        this.db = new TransactionDatabase(new sqlite.Database(path + `sql`))
    }
    public async init(consensus: IConsensus, tipHeight?: number) {
        this.consensus = consensus
        this.db.serialize(() => {
            this.db.run(`PRAGMA synchronous = OFF;`)
            this.db.run(`PRAGMA journal_mode = MEMORY;`)
            this.db.run(`CREATE TABLE IF NOT EXISTS txdb(txhash TEXT PRIMARY KEY,
                                                        blockhash TEXT,
                                                        txto TEXT,
                                                        txfrom TEXT,
                                                        amount TEXT,
                                                        fee TEXT,
                                                        blocktime INTEGER,
                                                        nonce INTEGER) WITHOUT ROWID;`)
            this.db.run(`CREATE INDEX IF NOT EXISTS blocktime ON txdb(blocktime);`)
            this.db.run(`CREATE INDEX IF NOT EXISTS txto ON txdb(txto);`)
            this.db.run(`CREATE INDEX IF NOT EXISTS txfrom ON txdb(txfrom);`)
            this.db.run(`CREATE INDEX IF NOT EXISTS blockhash ON txdb(blockhash);`)
        })

        if (tipHeight !== undefined) {
            let status: BlockStatus
            let lastHeight = 0
            let lastHash = await this.getLastBlock()
            if (lastHash !== undefined) {
                do {
                    status = await this.consensus.getBlockStatus(lastHash)
                    if (status === BlockStatus.MainChain) {
                        lastHeight = await this.consensus.getBlockHeight(lastHash)
                        break
                    }
                    const header = await this.consensus.getHeaderByHash(lastHash)
                    if (header instanceof BlockHeader) {
                        lastHash = header.previousHash[0]
                    } else { break }
                } while (lastHash !== undefined)

                const existsNonce = await this.checkExistsNonce(lastHash.toString())
                if (existsNonce !== 0) {
                    logger.info(`Since there is no nonce data in the Tx database, updating nonce will be started.`)
                    if (existsNonce === 1) {
                        this.addColNonce()
                    }

                    const unit = lastHeight + 1 > NONCE_UPDATE_UNIT ? NONCE_UPDATE_UNIT : lastHeight + 1
                    for (let i = 0; i < lastHeight + 1; i += unit) {
                        const count = lastHeight + 1 > i + unit ? unit : lastHeight + 1 - i
                        const blocks = await this.consensus.getBlocksRange(i, count)
                        for (const block of blocks) {
                            if (!block.header.merkleRoot.equals(Hash.emptyHash)) {
                                await this.updateNonce(block.txs)
                            }
                        }
                    }

                }
            }

            if (lastHeight < tipHeight) {
                const blocks = await this.consensus.getBlocksRange(lastHeight + 1)
                for (const block of blocks) {
                    await this.putTxs(new Hash(block.header), block.header.timeStamp, block.txs)
                }
            }
        }
    }

    public async getLastBlock(): Promise<Hash | undefined> {
        try {
            let hashData: string = ""
            return new Promise<Hash>(async (resolve, reject) => {
                this.db.get(`SELECT DISTINCT blockhash FROM txdb ORDER BY blocktime DESC`, (err: Error, row: any) => {
                    if (err) {
                        return reject(err)
                    }
                    if (row === undefined) {
                        return resolve(undefined)
                    }
                    hashData = row.blockhash
                    return resolve(Hash.decode(hashData))
                })
            })
        } catch (e) {
            logger.error(`Fail to getlastBlock : ${e}`)
            throw e
        }
    }

    public async putTxs(blockHash: Hash, timestamp: number, txs: AnySignedTx[]) {
        const insertArray: any[] = []
        for (const tx of txs) {
            const txHash = (new Hash(tx)).toString()

            const param = {
                $amount: hycontoString(tx.amount),
                $blockhash: blockHash.toString(),
                $blocktime: timestamp,
                $txhash: txHash,
                $txto: tx.to === undefined ? "🔥" : tx.to.toString(),
            }
            if (tx instanceof SignedTx) {
                Object.assign(param, { $fee: hycontoString(tx.fee), $txfrom: tx.from.toString(), $nonce: tx.nonce })
            }
            insertArray.push(param)
        }

        const insertsql = `INSERT OR REPLACE INTO txdb (txhash, blockhash, txto, txfrom, amount, fee, blocktime, nonce) VALUES ($txhash, $blockhash, $txto, $txfrom, $amount, $fee, $blocktime, $nonce)`
        return new Promise<void>((resolve, reject) => {
            const insert = this.db.prepare(insertsql, (err) => {
                if (err) {
                    reject(err)
                    return
                }
                this.db.parallelize(() => {
                    for (const param of insertArray) {
                        insert.run(param)
                    }
                })
                insert.finalize((error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                })
            })
        })
    }

    public async getLastTxs(address: Address, result: DBTx[] = [], pageNumber: number = 0, count?: number): Promise<DBTx[]> {
        const params = {
            $address: address.toString(),
            $count: count - result.length,
            $startIndex: pageNumber * count,
        }
        return new Promise<DBTx[]>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, blocktime, nonce FROM txdb WHERE txto = $address OR txfrom = $address ORDER BY blocktime DESC, nonce DESC LIMIT $startIndex, $count`, params, async (err: Error, rows: any) => {
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.blocktime, row.nonce))
                    }
                    if (result.length === count) { break }
                }
                if (rows.length < count) {
                    return resolved(result)
                }
                if (result.length < count) {
                    result = await this.getLastTxs(address, result, ++pageNumber, count)
                }
                return resolved(result)
            })
        })
    }

    public async getTxsInBlock(blockHash: string, result: DBTx[] = []): Promise<{ txs: DBTx[], amount: string, fee: string, length: number }> {
        const params = {
            $blockhash: blockHash.toString(),
        }
        return new Promise<{ txs: DBTx[], amount: string, fee: string, length: number }>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, blocktime, nonce FROM txdb WHERE blockhash = $blockhash ORDER BY blocktime, nonce DESC`, params, async (err: Error, rows: any) => {
                let amount = Long.fromInt(0)
                let fee = Long.fromInt(0)
                let index = 0
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        amount = amount.add(hyconfromString(row.amount))
                        fee = fee.add(hyconfromString(row.fee))

                        if (index < 10) {
                            result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.blocktime, row.nonce))
                        }
                        ++index
                    }
                }
                return resolved({ txs: result, amount: hycontoString(amount), fee: hycontoString(fee), length: index })
            })
        })
    }

    public async getNextTxs(address: Address, txHash: Hash, result: DBTx[] = [], pageNumber: number = 1, count?: number): Promise<DBTx[]> {
        const params = {
            $address: address.toString(),
            $count: count - result.length,
            $startIndex: pageNumber * count,
            $txhash: txHash.toString(),
        }
        return new Promise<DBTx[]>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, blocktime, nonce FROM txdb WHERE (blocktime <= (SELECT blocktime FROM txdb WHERE txhash = $txhash)) AND (txto = $address OR txfrom = $address) ORDER BY blocktime DESC, nonce DESC LIMIT $startIndex, $count`, params, async (err: Error, rows: any) => {
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.blocktime, row.nonce))
                    }

                    if (result.length === count) { break }
                }
                if (rows.length < count) {
                    return resolved(result)
                }
                if (result.length < count) {
                    result = await this.getNextTxs(address, txHash, result, ++pageNumber, count)
                }
                return resolved(result)
            })
        })

    }

    public async getNextTxsInBlock(blockHash: string, txHash: string, result: DBTx[], idx: number, count?: number): Promise<DBTx[]> {
        const params = {
            $blockhash: blockHash.toString(),
            $count: count - result.length,
            $startIndex: idx * count,
            $txhash: txHash,
        }
        return new Promise<DBTx[]>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, blocktime, nonce FROM txdb WHERE (blocktime <= (SELECT blocktime FROM txdb WHERE txhash = $txhash)) AND (blockhash = $blockhash) ORDER BY blocktime DESC, nonce DESC LIMIT $startIndex, $count`, params, async (err: Error, rows: any) => {
                for (const row of rows) {
                    const status = await this.consensus.getBlockStatus(row.blockhash)
                    if (status === BlockStatus.MainChain) {
                        result.push(new DBTx(row.txhash, row.blockhash, row.txto, row.txfrom, row.amount, row.fee, row.blocktime, row.nonce))
                    }

                    if (result.length === count) { break }
                }
                if (rows.length < count) {
                    return resolved(result)
                }
                if (result.length < count) {
                    result = await this.getNextTxsInBlock(blockHash, txHash, result, ++idx, count)
                }
                return resolved(result)
            })
        })
    }

    public async getTx(key: Hash): Promise<{ tx: DBTx, confirmation: number } | undefined> {
        const params = { $txhash: key.toString() }
        let tx: DBTx
        return new Promise<{ tx: DBTx, confirmation: number } | undefined>(async (resolved, rejected) => {
            this.db.all(`SELECT txhash, txto, txfrom, amount, fee, blockhash, blocktime, nonce FROM txdb WHERE txhash = $txhash LIMIT 1`, params, async (err: Error, rows: any) => {
                if (rows === undefined || rows.length < 1) { return resolved(undefined) }
                tx = new DBTx(rows[0].txhash, rows[0].blockhash, rows[0].txto, rows[0].txfrom, rows[0].amount, rows[0].fee, rows[0].blocktime, rows[0].nonce)
                const height = await this.consensus.getBlockHeight(Hash.decode(tx.blockhash))
                const tip = this.consensus.getBlocksTip()
                const confirmation = tip.height - height
                return resolved({ tx, confirmation })
            })
        })
    }

    public async getBurnAmount(): Promise<{ amount: Long }> {
        return new Promise<{ amount: Long }>(async (resolved, rejected) => {
            this.db.all(`select amount from txdb where txto = '🔥'`, async (err: Error, rows: any) => {
                let amount: Long = Long.UZERO
                if (rows !== undefined) {
                    for (const row of rows) {
                        amount = amount.add(hyconfromString(row.amount))
                    }
                }
                return resolved({ amount })
            })
        })
    }

    private async getBlockHash(txhash: string): Promise<string | undefined> {
        const blockhash = ""
        return new Promise<string | undefined>(async (resolved, rejected) => {
            this.db.all(`SELECT blockhash FROM txdb WHERE txhash=$txhash LIMIT 1`, { $txhash: txhash }, (err: Error, rows: any) => {
                if (rows === undefined || rows.length < 1) { return resolved(undefined) }
                return resolved(rows[0].blockhash)
            })
        })
    }

    private checkExistsNonce(blockhash: string) {
        return new Promise<number>((resolve, _) => {
            this.db.all(`SELECT nonce FROM txdb WHERE blockhash=$blockhash`, { $blockhash: blockhash }, (err: Error, rows: any) => {
                if (err) {
                    resolve(1)
                } else if (rows) {
                    for (const row of rows) {
                        if (row.nonce === null) { resolve(2) }
                    }
                }
                resolve(0)
            })
        })
    }

    private addColNonce() {
        return new Promise<void>((resolve, reject) => {
            this.db.exec(`ALTER TABLE txdb ADD COLUMN nonce INTEGER;`, (err) => {
                if (err) { reject(err) }
                resolve()
            })
        })
    }

    private async updateNonce(txs: AnySignedTx[]) {
        const insertArray: any[] = []
        for (const tx of txs) {
            const txHash = (new Hash(tx)).toString()
            const param = { $txhash: txHash }
            if (tx instanceof SignedTx) {
                Object.assign(param, { $nonce: tx.nonce })
            }
            insertArray.push(param)
            logger.debug(insertArray)
        }

        const insertsql = `UPDATE txdb SET nonce=$nonce WHERE txhash=$txhash`
        return new Promise<void>((resolve, reject) => {
            const insert = this.db.prepare(insertsql, (err) => {
                if (err) { reject(err) }
                this.db.parallelize(() => {
                    for (const param of insertArray) {
                        insert.run(param)
                        logger.debug(`Update tx nonce / tx: ${param.$txhash}), nonce: ${param.$nonce}`)
                    }
                })
                insert.finalize((error) => {
                    error ? reject(error) : resolve()
                })
            })
        })
    }
}
