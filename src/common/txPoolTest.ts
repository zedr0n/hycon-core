// tslint:disable:no-console
import { randomBytes } from "crypto"
import Long = require("long")
import { Consensus } from "../consensus/consensus"
import { Server } from "../server"
import { Hash } from "../util/hash"
import { Address } from "./address"
import { TxPool } from "./txPool"
import { SignedTx } from "./txSigned"

enum TxValidity {
    Invalid,
    Valid,
    Waiting,
}

const fromA: Address = randomBytes(20)
const fromB: Address = randomBytes(20)
let fromANonce = 0
let currentANonce = 0
let fromBNonce = 0
let currentBNonce = 0
const server: any = {
    consensus: {
        txValidity: (tx: TxSpy) => {
            let currentNonce
            if (tx.from.equals(fromA)) { currentNonce = currentANonce }
            if (tx.from.equals(fromB)) { currentNonce = currentBNonce }
            return tx.nonce !== currentNonce ? TxValidity.Waiting : TxValidity.Valid
        },
    },
    // consensus: {
    //     txValidity: () => TxValidity.Valid,
    // },
}
const txPool = new TxPool(server)
const txPoolA: any = txPool
// const isFirst = true

class TxSpy {
    public from: Address
    public fee: Long
    public nonce: number
    constructor(maxFee: number = 10) {
        this.fee = Long.fromNumber(Math.floor(Math.random() * (maxFee + 1)), true)
        if (Math.round(Math.random()) % 2 === 0) {
            this.from = new Address(fromA)
            this.nonce = fromANonce++
        } else {
            this.from = new Address(fromB)
            this.nonce = fromBNonce++
        }
        // this.from = new Address(fromA)
        // this.nonce = fromANonce
    }
    public equals(other: TxSpy) {
        return other.fee.equals(this.fee) && this.nonce === other.nonce && this.from.equals(other.from)
    }
}
function randomTxs(n: number, maxFee: number = 3): SignedTx[] {
    const txs: SignedTx[] = []
    for (let i = 0; i < n; i++) {
        const x: any = new TxSpy(maxFee)
        if (i === 0) { x.fee = Long.fromNumber(0) }
        txs.push(x)
    }
    return txs
}

async function test() {
    for (let i = 0; i < 1; i++) {
        const txs = randomTxs(5, 10)
        console.log(`Original Txs ->`)
        printAll(txs)
        const count = await txPool.putTxs(txs)
        console.log(`After putTx getTxs()->`)
        const afterPutTx = txPool.getTxs()
        printAll(afterPutTx)
        const tx: any = randomTxs(1, 1)[0]
        tx.from = new Address(fromB)
        tx.nonce = 0
        console.log(`Removing...`)
        printAll([afterPutTx[0]])
        if (afterPutTx[0].from.equals(fromA)) {
            currentANonce++
        } else {
            currentBNonce++
        }
        // isFirst = false
        await txPool.removeTxs([afterPutTx[0]])
        console.log(`After Remove getTxs()->`)
        printAll(txPool.getTxs())
    }
    return false
}

function printAll(arr: SignedTx[]) {
    let count = 0
    for (const tx of arr) {
        console.log(`Tx : ${count++} / from:${tx.from} / fee:${tx.fee} / nonce : ${tx.nonce}`)
    }
}

test().then(() => console.log("Done"))
