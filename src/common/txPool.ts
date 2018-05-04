import { getLogger } from "log4js"
import { NewTx } from "../serialization/proto"
import { Server } from "../server"
import { ITxPool } from "./itxPool"
import { SignedTx } from "./txSigned"

const logger = getLogger("AppTxPool")
interface ITxCallback {
    callback: (txs: SignedTx[]) => void,
    n: number
}
export class TxPool implements ITxPool {
    private server: Server
    private txs: SignedTx[]
    private callbacks: ITxCallback[]
    private minFee: number

    constructor(server: Server, minFee?: number) {
        this.server = server
        this.txs = []
        this.callbacks = []
        this.minFee = minFee === undefined ? 0 : minFee
    }

    public async putTxs(newTxs: SignedTx[]): Promise<number> {
        const { count, lowestIndex } = await this.insert(newTxs)
        this.callback(lowestIndex)
        return count
    }

    public updateTxs(old: SignedTx[], maxReturn?: number): SignedTx[] {
        this.remove(old)
        return this.txs.slice(0, maxReturn)
    }

    public onTopTxChanges(n: number, callback: (txs: SignedTx[]) => void): void {
        this.callbacks.push({ callback, n })
    }

    private async insert(newTxs: SignedTx[]): Promise<{ count: number, lowestIndex?: number }> {
        newTxs.sort((a, b) => b.fee - a.fee)
        let lowestIndex
        let count = 0
        let i = 0
        let j = 0
        let k = 0
        while (i < newTxs.length) {
            if (newTxs[i].fee < this.minFee) {
                return { count, lowestIndex }
            }

            if (j + k >= this.txs.length || newTxs[i].fee > this.txs[j + k].fee) {
                this.txs.splice(j + k, 0, newTxs[i])
                if (count === 0) {
                    lowestIndex = j + k
                }
                count++
                k = 0
                i++
            } else if (newTxs[i].fee < this.txs[j].fee) {
                j++
            } else if (newTxs[i].fee === this.txs[j + k].fee) {
                if (this.txs[j + k].equals(newTxs[i])) {
                    i++
                    k = 0
                } else {
                    k++
                }
            } else {
                logger.error(`TxPool insert error, it seems the data is not sorted correctly, skipping Tx and attempting to continue.`)
                i++
            }
        }
        return { count, lowestIndex }
    }

    private remove(txs: SignedTx[]) {
        txs.sort((a, b) => b.fee - a.fee)
        let i = 0
        let j = 0
        let k = 0
        while (i < txs.length && j < this.txs.length) {
            if (txs[i].fee < this.txs[j].fee) {
                j++
            } else if (j + k >= this.txs.length || txs[i].fee > this.txs[j + k].fee) {
                i++
                k = 0
            } else {
                if (txs[i].fee === this.txs[j + k].fee) {
                    if (this.txs[j + k].equals(txs[i])) {
                        this.txs.splice(j + k, 1)
                    } else {
                        k++
                    }
                } else {
                    logger.error(`TxPool insert error, it seems the data is not sorted correctly, skipping Tx and attempting to continue.`)
                }
            }
        }
    }

    private callback(lowestIndex: number): void {
        const n = lowestIndex + 1
        for (const callback of this.callbacks) {
            if (callback.n >= n) {
                setImmediate(this.callback, this.txs.slice(0, callback.n))
            }
        }
    }
}
