import { getLogger } from "log4js"
import { ITxPool } from "./common/itxPool"
import { SignedTx } from "./common/txSigned"
import { Block, INetwork, Tx } from "./serialization/proto"
import * as proto from "./serialization/proto"
import { Server } from "./server"
import { Wallet } from "./wallet/wallet"
// tslint:disable-next-line:no-var-requires
const randomInt = require("random-int")
// tslint:disable-next-line:no-var-requires
const assert = require("assert")

const logger = getLogger("TestServer")

export class TestServer {

    public server: Server
    private txs: Tx[] = []
    private index: number = 1
    private wallets: Wallet[] = []
    private nonce: number = 0
    private txPool: ITxPool

    private nonceTable: Map<string, number>
    constructor(server: Server) {
        this.server = server
        this.txPool = server.txPool
        this.nonceTable = new Map<string, number>()
        assert(this.txPool)
        setTimeout(() => {
            this.makeWallet()
        }, 3000)

    }

    public async showWallets() {
        for (let i = 0; i < 100; i++) {
            const name = `test${i}`
            const w = this.wallets[i]
            const account = await this.server.consensus.getAccount(w.pubKey.address())
            assert(account)
            assert(account.balance > 0)
            logger.debug(`Make Wallet=${name} Public=${w.pubKey.address().toString()} Balance=${account.balance}`)
            assert(w)
        }
    }
    public async makeWallet() {
        for (let i = 0; i < 100; i++) {
            const name = `test${i}`
            const password = ""
            const w = await Wallet.loadKeys(name, password)
            const account = await this.server.consensus.getAccount(w.pubKey.address())
            assert(account)
            assert(account.balance > 0)
            this.wallets.push(w)
        }
        await this.showWallets()
        logger.debug(`done`)

        setInterval(() => {
            // this.showWallets()
            this.makeTx()
        }, 10000)
        setInterval(() => {
            this.makeBlock()
        }, 5000)
    }
    private async makeTx() {
        const amt = 5
        const fee = 10
        this.nonce = 0

        let n = randomInt(0, 90)
        n = 5
        const txList: SignedTx[] = []
        for (let i = 0; i < n; i++) {
            // get nonce, increase 1
            const toWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            assert(0 <= i && i < this.wallets.length)
            assert(toWallet)
            const toAddr = toWallet.pubKey.address()
            const fromWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            assert(0 <= i + 1 && i + 1 < this.wallets.length)
            assert(fromWallet)
            const fromAddr = fromWallet.pubKey.address()
            const fromAddrString = fromAddr.toString()
            let nonce
            if (this.nonceTable.has(fromAddrString)) {
                nonce = this.nonceTable.get(fromAddrString) + 1
            } else {
                nonce = await this.server.consensus.getNonce(fromAddr) + 1
            }
            this.nonceTable.set(fromAddrString, nonce)
            if (!fromAddr.equals(toAddr)) {
                const tx = fromWallet.send(toAddr, amt + randomInt(0, 200), nonce, fee + randomInt(0, 10) / 10)
                logger.debug(`TX ${i + 1} Amount=${tx.amount} Fee=${tx.fee} From=${fromAddr.toString()} To = ${toAddr.toString()}`)
                txList.push(tx)
            }
        }

        const added = await this.txPool.putTxs(txList)
        // logger.debug(`Added Tx=${added}`)
        const encoded: Uint8Array = proto.Network.encode({ putTx: { txs: txList } }).finish()
        this.server.network.broadcast(new Buffer(encoded), null)

    }

    private async makeBlock() {
        // logger.debug(`Make Block`)
        /* const newBlock = new Block({ txs: this.txs })
         this.txs = []

         const encoded: Uint8Array = proto.Network.encode({ putBlock: { blocks: [newBlock] } }).finish()
         this.server.network.broadcast(new Buffer(encoded), null)*/
    }
}
