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

    constructor(server: Server) {
        this.server = server
        this.txs = []
        this.callbacks = []
        this.minFee = 0
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
        while (i < newTxs.length && j < this.txs.length) {
            if (newTxs[i].fee < this.minFee) {
                return { count, lowestIndex }
            }
            try {
                if (newTxs[i].fee === this.txs[j].fee) {
                    if (this.txs[j].equals(newTxs[i])) {
                        i++
                    } else {
                        j++
                    }
                } else if (newTxs[i].fee > this.txs[j].fee) {
                    if (await this.server.consensus.isTxValid(newTxs[i])) {
                        this.txs.splice(j, 0, newTxs[i])
                        if (count === 0) {
                            lowestIndex = j
                        }
                        i++
                        j++
                        count++
                    }
                } else {
                    j++
                }
            } catch (e) {
                logger.debug(`Failed to add Tx: ${e}`)
            }
        }
        while (i < newTxs.length) {
            if (newTxs[i].fee < this.minFee) {
                return { count, lowestIndex }
            }
            try {
                if (await this.server.consensus.isTxValid(newTxs[i])) {
                    this.txs.push(newTxs[i++])
                }
            } catch (e) {
                logger.debug(`Failed to add Tx: ${e}`)
            }
        }
        return { count, lowestIndex }
    }

    private remove(txs: SignedTx[]) {
        txs.sort((a, b) => b.fee - a.fee)
        let i = 0
        let j = 0
        let k = 0
        while (i < txs.length && (j + k) < this.txs.length) {
            if (txs[i].fee < this.txs[j].fee) {
                j++
            } else if (txs[i].fee > this.txs[j].fee) {
                i++
            } else {
                if (txs[i].fee > this.txs[j + k].fee) {
                    i++
                    k = 0
                } else if (txs[i].fee < this.txs[j + k].fee) {
                    logger.error("TxPool seems to be out of order")
                    return
                } else {
                    if (this.txs[j + k].equals(txs[i])) {
                        this.txs.splice(j + k, 1)
                    } else {
                        k++
                    }
                }
            }
        }
    }

    private callback(lowestIndex: number): void {
        lowestIndex += 1
        for (const callback of this.callbacks) {
            if (callback.n >= lowestIndex) {
                setImmediate(this.callback, this.txs.slice(0, callback.n))
            }
        }
    }
}
