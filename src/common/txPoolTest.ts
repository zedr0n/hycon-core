// tslint:disable:no-console
import { TxPool } from "./txPool"
import { SignedTx } from "./txSigned"

const server: any = { consensus: { isTxValid: () => true } }
const txPool = new TxPool(server)
const txPoolA: any = txPool

class TxSpy {
    public fee: number
    public g: number
    constructor(maxFee: number = 2) {
        this.fee = Math.floor(Math.random() * (maxFee + 1))
        this.g = Math.round(Math.random())
    }
    public equals(other: any) {
        return other.fee === this.fee && this.g === other.g
    }
}
function randomTxs(n: number, maxFee: number = 3): SignedTx[] {
    const txs: SignedTx[] = []
    for (let i = 0; i < n; i++) {
        const x: any = new TxSpy(maxFee)
        txs.push(x)
    }
    return txs
}

async function test() {
    for (let i = 0; i < 2; i++) {
        const txs = randomTxs(5, 1)
        console.log(`Txs ->`)
        console.log(txs)
        const count = await txPool.putTxs(txs)
        console.log(`After putTx ->`)
        console.log(txPoolA.txs)
        const tx: any = randomTxs(1, 1)[0]
        console.log(`Removing... {fee: ${tx.fee}, g: ${tx.g}}`)
        txPool.updateTxs(randomTxs(1, 1), 0)
        console.log(txPoolA.txs)
        console.log(count)
    }
    return false
}

test().then(() => console.log("Done"))
