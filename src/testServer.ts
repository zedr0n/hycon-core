import commandLineArgs = require("command-line-args")
import { randomBytes } from "crypto"
import { getLogger } from "log4js"
import { IResponseError } from "./api/client/rest"
import { HttpServer } from "./api/server/server"
import { Address } from "./common/address"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { SignedTx } from "./common/txSigned"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { SingleChain } from "./consensus/singleChain"
import { IMiner } from "./miner/iminer"
import { MinerServer } from "./miner/minerServer"
import { StratumServer } from "./miner/stratumServer"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { Block, INetwork, Tx } from "./serialization/proto"
import * as proto from "./serialization/proto"
import { Server } from "./server"
import { Hash } from "./util/hash"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"
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

    // TODO : Block, hash, SignedTx, randomBytes import, and testMakeBlock(db, consensus) remove
    // tslint:disable-next-line:member-ordering
    public async testConsensus() {
        const block1 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const block1Hash = new Hash(block1.header)
        logger.error(`########################   Make block1:${block1Hash}`)
        const block2 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const decodeBlock = Block.decode(block1.encode())

        const block2Hash = new Hash(block1.header)
        logger.error(`########################   Make block2:${block2Hash}`)
        const block3 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const block3Hash = new Hash(block3.header)
        logger.error(`########################   Make block3:${block3Hash}`)

        setTimeout(async () => {
            logger.error(`########################   Save block1`)
            for (const tx of block1.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.server.consensus.putBlock(block1)
            const bTip1 = this.server.consensus.getBlocksTip()
            const hTip1 = this.server.consensus.getHeaderTip()
            logger.error(`########################   Block1Tip : ${bTip1.hash}(${bTip1.height}) / Header1Tip : ${hTip1.hash}(${hTip1.height})`)
            const tipHash1 = await this.server.consensus.getHash(bTip1.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash1}`)

            logger.error(`########################   Save block2`)
            for (const tx of block2.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.server.consensus.putBlock(block2)
            const bTip2 = this.server.consensus.getBlocksTip()
            const hTip2 = this.server.consensus.getHeaderTip()
            logger.error(`########################   Block2Tip : ${bTip2.hash}(${bTip2.height}) / Header2Tip : ${hTip2.hash}(${hTip2.height})`)
            const tipHash2 = await this.server.consensus.getHash(bTip2.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash2}`)

            logger.error(`########################   Save block3`)
            for (const tx of block3.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.server.consensus.putBlock(block3)
            const bTip3 = this.server.consensus.getBlocksTip()
            const hTip3 = this.server.consensus.getHeaderTip()
            logger.error(`########################   Block3Tip : ${bTip3.hash}(${bTip3.height}) / Header2Tip : ${hTip3.hash}(${hTip3.height})`)
            const tipHash3 = await this.server.consensus.getHash(bTip3.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash3}`)

            // Block4(block2)
            setTimeout(async () => {
                const block4 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block2)
                const block4Hash = new Hash(block4.header)
                logger.error(`########################   Make block4:${block4Hash}`)
                logger.error(`########################   Save block4`)
                for (const tx of block4.txs) {
                    logger.error(`Tx : ${new Hash(tx)}`)
                }
                await this.server.consensus.putBlock(block4)
                const bTip4 = this.server.consensus.getBlocksTip()
                const hTip4 = this.server.consensus.getHeaderTip()
                logger.error(`########################   Block4Tip : ${bTip4.hash}(${bTip4.height}) / Header4Tip : ${hTip4.hash}(${hTip4.height})`)
                const tipHash4 = await this.server.consensus.getHash(bTip4.height)
                logger.error(`########################   Get Hash using Tip Height : ${tipHash4}`)

                // Block5(block3)
                setTimeout(async () => {
                    const block5 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block3)
                    const block5Hash = new Hash(block5.header)
                    logger.error(`########################   Make block5:${block5Hash}`)
                    logger.error(`########################   Save block5`)
                    for (const tx of block5.txs) {
                        logger.error(`Tx : ${new Hash(tx)}`)
                    }
                    await this.server.consensus.putBlock(block5)
                    const bTip5 = this.server.consensus.getBlocksTip()
                    const hTip5 = this.server.consensus.getHeaderTip()
                    logger.error(`########################   Block5Tip : ${bTip5.hash}(${bTip5.height}) / Header5Tip : ${hTip5.hash}(${hTip5.height})`)
                    const tipHash5 = await this.server.consensus.getHash(bTip5.height)
                    logger.error(`########################   Get Hash using Tip Height : ${tipHash5}`)

                    // Block6(block5)
                    const block6 = await this.server.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block5)
                    const block6Hash = new Hash(block6.header)
                    logger.error(`########################   Make block6:${block6Hash}`)
                    logger.error(`########################   Save block6`)
                    for (const tx of block6.txs) {
                        logger.error(`Tx : ${new Hash(tx)}`)
                    }
                    await this.server.consensus.putBlock(block6)
                    const bTip6 = this.server.consensus.getBlocksTip()
                    const hTip6 = this.server.consensus.getHeaderTip()
                    logger.error(`########################   Block6Tip : ${bTip6.hash}(${bTip6.height}) / Header5Tip : ${hTip6.hash}(${hTip6.height})`)
                    const tipHash6 = await this.server.consensus.getHash(bTip6.height)
                    logger.error(`########################   Get Hash using Tip Height : ${tipHash6}`)
                }, 1000)

            }, 1000)

        }, 2000)
    }
}
