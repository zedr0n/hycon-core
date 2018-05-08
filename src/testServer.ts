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
    constructor(server: Server) {
        this.server = server
        this.txPool = server.txPool
        assert(this.txPool)
        this.makeWallet()
        setInterval(() => {
            this.makeTx()
        }, 1000)
        setInterval(() => {
            this.makeBlock()
        }, 5000)
    }

    public async makeWallet() {
        for (let i = 0; i < 10; i++) {
            const name = `test${i}`
            const password = ""
            const w = await Wallet.loadKeys(name, password)
            logger.debug(`Make Wallet=${name} Public=${w.pubKey.address().toString()}`)
            assert(w)
            this.wallets.push(w)
        }
    }
    private async makeTx() {
        const amt = 100
        const fee = 10
        this.nonce = 0

        const n = randomInt(50, 99)
        const txList: SignedTx[] = []
        for (let i = 0; i < n; i++) {
            // get nonce, increase 1
            const toWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            const toAddr = toWallet.pubKey.address()
            const fromWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            const fromAddr = fromWallet.pubKey.address()
            if (!fromAddr.equals(toAddr)) {
                const nonce = await this.server.consensus.getNonce(fromAddr) + 1
                const tx = fromWallet.send(toAddr, amt + randomInt(0, 50), nonce, fee + randomInt(0, 10))
                //  logger.debug(`TX ${i + 1} Amount=${tx.amount} Fee=${tx.fee} From=${fromAddr.toString()} To = ${toAddr.toString()}`)
                txList.push(tx)
            }
        }

        // logger.debug(`Make Tx  Current Queue = ${ this.txs.length }`)
        // const newTx = new Tx({ amount: this.index++, fee: Math.random() * 10 })
        // this.txs.push(newTx)
        // const encoded: Uint8Array = proto.Network.encode({ putTx: { txs: [txList] } }).finish()

        const added = await this.txPool.putTxs(txList)
        logger.debug(`Added Tx=${added}`)
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
