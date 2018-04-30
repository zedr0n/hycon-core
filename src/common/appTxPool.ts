import { getLogger } from "log4js"
import { Server } from "../server"
import { ITxPool } from "./txPool"
import { SignedTx } from "./txSigned"

const logger = getLogger("AppTxPool")
export class AppTxPool implements ITxPool {
    private server: Server
    private txPool: SignedTx[] = []
    private topNumber: number = 10
    private topList: SignedTx[] = []
    private txListCallbacks: Array<(txs: SignedTx[]) => void> = []
    constructor(server: Server) {
        this.server = server
    }

    public async putTxs(txs: SignedTx[]): Promise<number> {
        try {
            let putCount = 0
            for (const tx of txs) {
                if (!this.existCheck(tx)) {
                    if (await this.server.consensus.validateTx(tx)) {
                        this.queue(tx)
                        putCount++
                    }
                }
            }
            return Promise.resolve(putCount)
        } catch (e) {
            return Promise.reject(`Fail to put Txs : ${e}`)
        }
    }
    public updateTx(txs: SignedTx[], n: number): SignedTx[] {
        this.remove(txs)
        return this.getTxs(n)
    }

    public onTopTxChanges(count: number, callback: (txs: SignedTx[]) => void): void {
        this.topNumber = count
        this.txListCallbacks.push(callback)
    }

    private queue(tx: SignedTx) {
        let isInserted = false
        for (const txEle of this.txPool) {
            if (txEle.fee < tx.fee) {
                this.txPool.splice(this.txPool.indexOf(txEle), 0, tx)
                this.topTxCallback()
                isInserted = true
            }
        }
        if (!isInserted) {
            this.txPool.push(tx)
            this.topTxCallback()
        }
    }

    private remove(txs: SignedTx[]) {
        txs.sort((a, b) => b.fee - a.fee)
        let poolIndex = 0
        for (const tx of txs) {
            for (let i = poolIndex; i < this.txPool.length; i++) {
                const txElement = this.txPool[i]
                if (txElement.equals(tx)) {
                    this.txPool.splice(i, 1)
                    poolIndex = i
                    break
                }
            }
        }
    }

    private existCheck(tx: SignedTx): boolean {
        let isExsited = false
        for (const txEle of this.txPool) {
            if (txEle.equals(tx)) {
                isExsited = true
                break
            }
        }
        return isExsited
    }

    private getTxs(n: number): SignedTx[] {
        const txs = []
        for (let i = 0; i < n; i++) {
            txs.push(this.txPool[i])
        }
        return txs
    }

    private topTxCallback(): void {
        if (this.txPool.length < this.topNumber) {
            return
        } else {
            const currentTop: SignedTx[] = []
            for (let i = 0; i < this.topNumber; i++) {
                if (this.topList.indexOf(this.txPool[i]) === -1) {
                    currentTop.push(this.txPool[i])
                    if (currentTop.length === this.topNumber) {
                        this.topList = currentTop
                        this.callback()
                    }
                } else {
                    break
                }
            }
        }
    }

    private callback(): void {
        for (const callBackFunction of this.txListCallbacks) {
            callBackFunction(this.getTxs(this.topNumber))
        }
    }
}
