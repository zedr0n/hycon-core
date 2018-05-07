import { SignedTx } from "./txSigned"
const topNumber = 5
import { getLogger } from "log4js"
const logger = getLogger("TxList")

export class TxList {
    public blockTxLimit: number
    public txListCallbacks: Array<() => void> = []
    public topNList: SignedTx[] = []
    private txList: SignedTx[] = []
    constructor(limit: number = 4) {
        this.blockTxLimit = limit
    }
    get list() {
        return this.txList
    }
    public queue(tx: SignedTx): boolean {
        /* istanbul ignore next */
        if (!tx.verify()) {
            logger.error("Tx Not Verified")
            return false
        }
        let equals = false
        for (tx of this.txList) {
            if (tx.equals(tx)) {
                equals = true
                break
            }
        }
        if (!equals) {
            if (this.txList.length === 0) {
                this.txList.push(tx)
                this.doCallbacks()
            } else {
                for (let i = 0; i < this.txList.length; i++) {
                    if (this.txList[i].fee < tx.fee) {
                        this.txList.splice(i, 0, tx)
                        this.doCallbacks()
                        break
                    }
                    if (i === this.txList.length - 1) {
                        this.txList.push(tx)
                        this.doCallbacks()
                        break
                    }
                }
            }
            return true
        } else {
            return false
        }
    }

    public unqueue(): SignedTx | undefined {
        return this.list.pop()
    }

    public unqueueN(n: number): SignedTx[] {
        const list: SignedTx[] = []
        for (let i = 0; i < n; i++) {
            const tx = this.unqueue()
            if (tx) {
                list.push(tx)
            }
        }
        return list
    }

    public remove(tx: SignedTx): boolean {
        let index = -1
        for (let i = 0; i < this.txList.length; i++) {
            if (tx.equals(this.txList[i])) {
                index = i
                break
            }
        }
        if (index > -1) {
            this.txList.splice(index, 1)
            return true
        }
        return false
    }
    public doCallbacks(): void {
        if (this.list.length < topNumber) {
            return
        } else {
            const currentTopN: SignedTx[] = []
            for (let i = 0; i < topNumber; i++) {
                if (this.topNList.indexOf(this.list[i]) === -1) {
                    currentTopN.push(this.list[i])
                    if (i === topNumber - 1) {
                        logger.debug(`The condition for generating a trigger to create a block is satisfied.`)
                        this.topNList = currentTopN
                        for (const callback of this.txListCallbacks) {
                            callback()
                        }
                    }
                    continue
                } else {
                    break
                }
            }
        }
    }
    public onTxListChange(callback: () => void): void {
        this.txListCallbacks.push(callback)
    }
}
