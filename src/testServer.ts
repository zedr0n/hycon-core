import commandLineArgs = require("command-line-args")
import { randomBytes } from "crypto"
import { IResponseError } from "./api/client/rest"
import { HttpServer } from "./api/server/server"
import { Address } from "./common/address"
import { TxPool } from "./common/txPool"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { SingleChain } from "./consensus/singleChain"
import { IMiner } from "./miner/iminer"
import { MinerServer } from "./miner/minerSever"
import { StratumServer } from "./miner/stratumServer"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { Hash } from "./util/hash"
import { WalletManager } from "./wallet/walletManager"
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

/*
test functions
*/
export class TestServer {

    public static walletNumber = 5
    public server: Server
    private txs: Tx[] = []
    private index: number = 1
    private wallets: Wallet[] = []
    private nonce: number = 0
    private txPool: ITxPool
    private consensus: IConsensus = undefined // the core


    private nonceTable: Map<string, number>
    constructor(server: Server) {
        this.server = server
        this.txPool = server.txPool
        this.nonceTable = new Map<string, number>()
        this.consensus = server.consensus
        assert(this.txPool)
        setTimeout(() => {
            this.makeWallet()
        }, 3000)

    }

    public async showWallets() {
        for (let i = 0; i < TestServer.walletNumber; i++) {
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
        for (let i = 0; i < TestServer.walletNumber; i++) {
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
        }, 3000)
        setInterval(() => {
            this.makeBlock()
        }, 5000)
    }
    private async makeTx() {
        const amt = 5
        const fee = 10
        this.nonce = 0

        let n = randomInt(0, 90)
        n = 1
        const txList: SignedTx[] = []
        for (let i = 0; i < n; i++) {
            // get nonce, increase 1
            // const toWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            const toWallet = this.wallets[i]
            assert(0 <= i && i < this.wallets.length)
            assert(toWallet)
            const toAddr = toWallet.pubKey.address()
            // const fromWallet = this.wallets[randomInt(0, this.wallets.length - 1)]
            const fromWallet = this.wallets[i + 1]
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
        /* const encoded: Uint8Array = proto.Network.encode({ putTx: { txs: txList } }).finish()
         this.server.network.broadcast(new Buffer(encoded), null)*/

    }

    private async makeBlock() {
        // logger.debug(`Make Block`)
        /* const newBlock = new Block({ txs: this.txs })
         this.txs = []

         const encoded: Uint8Array = proto.Network.encode({ putBlock: { blocks: [newBlock] } }).finish()
         this.server.network.broadcast(new Buffer(encoded), null)*/
    }


    // TODO : remove Wallet
    // tslint:disable-next-line:member-ordering
    public async testTx(): Promise<void> {
        const wallets: Wallet[] = []
        await Wallet.walletInit()
        for (let i = 0; i < 10; i++) {
            wallets.push(Wallet.generateKey())
        }
        const idxX = Math.floor(Math.random() * 10)
        let idxY = idxX + 1
        if (idxY === 100) { idxY = idxY - 2 }

        const toWallet = wallets[idxX]
        const toAddr = toWallet.pubKey.address()
        const fromWallet = wallets[idxY]
        logger.debug(`>>>>>toWallet, fromWallet: ${toWallet.pubKey.address().toString()}, ${fromWallet.pubKey.address().toString()}`)
        let nonce = 0
        const tx = fromWallet.send(toAddr, 100, nonce++, 10)
        logger.debug(`>>>>>tx: ${tx.amount}, ${tx.fee}, ${tx.to}, ${tx.from}`)
        await this.txPool.putTxs([tx])
    }

    // TODO : Block, hash, SignedTx, randomBytes import, and testMakeBlock(db, consensus) remove
    // tslint:disable-next-line:member-ordering
    public async testConsensus() {
        const stxArray: SignedTx[] = []
        for (let i = 0; i < 10; i++) {
            stxArray.push(new SignedTx({
                amount: 10000,
                fee: 1,
                from: randomBytes(20),
                nonce: 1,
                recovery: 1,
                signature: randomBytes(32),
                to: randomBytes(20),
            }))
        }
        setTimeout(async () => {
            logger.info(`Make block1`)
            const block1 = await this.consensus.testMakeBlock(stxArray.slice(0, 3))
            const block1Hash = new Hash(block1.header)
            logger.info(`Make block2`)
            const block2 = await this.consensus.testMakeBlock(stxArray.slice(3, 7))
            const block2Hash = new Hash(block2.header)
            logger.info(`Save block1`)

            await this.consensus.putBlock(block1)
            let status1 = await this.consensus.getBlockStatus(block1Hash)
            const bTip1 = this.consensus.getBlocksTip()
            const hTip1 = this.consensus.getHeaderTip()
            logger.info(`Block1 Status : ${status1} / Hash : ${block1Hash}\n`)
            logger.info(`Block1Tip : ${bTip1.hash}(${bTip1.height}) / Header1Tip : ${hTip1.hash}(${hTip1.height})`)
            const tipHash1 = await this.consensus.getHash(bTip1.height)
            logger.info(`Get Hash using Tip Height : ${tipHash1}`)

            logger.info(`Save block2`)
            await this.consensus.putBlock(block2)
            status1 = await this.consensus.getBlockStatus(block1Hash)
            let status2 = await this.consensus.getBlockStatus(block2Hash)
            const bTip2 = this.consensus.getBlocksTip()
            const hTip2 = this.consensus.getHeaderTip()
            logger.info(`Block2 Status : ${status2} / Hash : ${block2Hash}\n`)
            logger.info(`Block1 Status : ${status1} / Hash : ${block1Hash}\n`)
            logger.info(`Block2Tip : ${bTip2.hash}(${bTip2.height}) / Header2Tip : ${hTip2.hash}(${hTip2.height})`)
            const tipHash2 = await this.consensus.getHash(bTip2.height)
            logger.info(`Get Hash using Tip Height : ${tipHash2}`)

            logger.info(`Make block3`)
            const block3 = await this.consensus.testMakeBlock(stxArray.slice(0, 2))
            const block3Hash = new Hash(block3.header)
            logger.info(`Save block3`)
            await this.consensus.putBlock(block3)
            status1 = await this.consensus.getBlockStatus(block1Hash)
            status2 = await this.consensus.getBlockStatus(block2Hash)
            const status3 = await this.consensus.getBlockStatus(block3Hash)
            const bTip3 = this.consensus.getBlocksTip()
            const hTip3 = this.consensus.getHeaderTip()
            logger.info(`Block3 Status : ${status3} / Hash : ${block3Hash}\n`)
            logger.info(`Block2 Status : ${status2} / Hash : ${block2Hash}\n`)
            logger.info(`Block1 Status : ${status1} / Hash : ${block1Hash}\n`)
            logger.info(`Block3Tip : ${bTip3.hash}(${bTip3.height}) / Header3Tip : ${hTip3.hash}(${hTip3.height})`)
            const tipHash3 = await this.consensus.getHash(bTip3.height)
            logger.info(`Get Hash using Tip Height : ${tipHash3}`)
        }, 1000)
    }
}
