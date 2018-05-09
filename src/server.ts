import commandLineArgs = require("command-line-args")
import { randomBytes } from "crypto"
import { getLogger } from "log4js"
import { IResponseError } from "./api/client/rest"
import { Address } from "./common/address"
import { Block } from "./common/block"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { SignedTx } from "./common/txSigned"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { SingleChain } from "./consensus/singleChain"
import { IMiner } from "./miner/iminer"
import { MinerServer } from "./miner/minerSever"
import { StratumServer } from "./miner/stratumServer"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { TestServer } from "./testServer"
import { Hash } from "./util/hash"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"
const optionDefinitions = [
    { name: "ui", alias: "u", type: Boolean },
    { name: "writing", alias: "w", type: Boolean },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "plot", alias: "g", type: Boolean },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "port", alias: "p", type: Number },
    { name: "str_port", alias: "s", type: Number },
    { name: "networkid", alias: "n", type: Number },
    { name: "mine", alias: "m", type: Boolean },
    { name: "visDAG", alias: "d", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
]

const logger = getLogger("Server")

export class Server {
    public static subsid = 0
    public static globalOptions: any
    public useRabbit = true
    // public peerList: PeerList
    public subscription: Map<number, any> | undefined
    public readonly consensus: IConsensus = undefined // the core
    public readonly network: INetwork = undefined // hycon network
    public readonly miner: IMiner = undefined // miner
    public readonly wallet: WalletManager = undefined
    public readonly txPool: ITxPool = undefined // tx pool
    public readonly rest: RestManager = undefined // api server for hycon
    public options: any // json options
    public db: Database
    public accountDB: WorldState
    public test: TestServer

    constructor() {
        this.options = commandLineArgs(optionDefinitions)
        Server.globalOptions = this.options
        logger.info(`Options=${JSON.stringify(this.options)}`)
        logger.info(`Verbose=${this.options.verbose}`)
        logger.info(`Port=${this.options.port}`)

        this.consensus = new SingleChain(this, "./deleteme.db", "./deleteme.ws", "./deleteme.file")
        this.network = new RabbitNetwork(this, this.options.port)

        this.wallet = new WalletManager(this)
        this.miner = new MinerServer(this, this.options.str_port)
        this.txPool = new TxPool(this)
        this.rest = new RestManager(this)
    }
    public async run() {
        this.readOptions()
        await this.consensus.init()
        logger.info("Starting server...")
        await this.network.start()
        if (this.options.peer) {
            for (const peer of this.options.peer) {
                const [ip, port] = peer.split(":")
                logger.info(`Connecting to ${ip}:${port}`)
                this.network.connect(ip, port).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }
        this.miner.start()
    }

    private readOptions() {
        const options = commandLineArgs(optionDefinitions)
        logger.info(`Options=${JSON.stringify(options)}`)
        logger.info(`Verbose=${options.verbose}`)
        logger.info(`Port=${options.port}`)
        if (options.writing) {
            logger.info("Test Writing")
            this.test = new TestServer(this)
        }
        if (options.mine) {
            MinerServer.useCpuMiner = true
        }
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
            logger.info(`Make block2`)
            const block2 = await this.consensus.testMakeBlock(stxArray.slice(3, 7))
            logger.info(`Save block1`)

            await this.consensus.putBlock(block1)
            let status1 = await this.consensus.getBlockStatus(new Hash(block1.header))
            const bTip1 = this.consensus.getBlocksTip()
            const hTip1 = this.consensus.getHeaderTip()
            logger.info(`Block1 Status : ${status1}\n`)
            logger.info(`Block1Tip : ${bTip1.hash}(${bTip1.height}) / Header1Tip : ${hTip1.hash}(${hTip1.height})`)

            logger.info(`Save block2`)
            await this.consensus.putBlock(block2)
            status1 = await this.consensus.getBlockStatus(new Hash(block1.header))
            let status2 = await this.consensus.getBlockStatus(new Hash(block2.header))
            const bTip2 = this.consensus.getBlocksTip()
            const hTip2 = this.consensus.getHeaderTip()
            logger.info(`Block2 Status : ${status2}\n`)
            logger.info(`Block1 Status : ${status1}\n`)
            logger.info(`Block2Tip : ${bTip2.hash}(${bTip2.height}) / Header2Tip : ${hTip2.hash}(${hTip2.height})`)

            logger.info(`Make block3`)
            const block3 = await this.consensus.testMakeBlock(stxArray.slice(0, 2))
            logger.info(`Save block3`)
            await this.consensus.putBlock(block3)
            status1 = await this.consensus.getBlockStatus(new Hash(block1.header))
            status2 = await this.consensus.getBlockStatus(new Hash(block2.header))
            const status3 = await this.consensus.getBlockStatus(new Hash(block3.header))
            const bTip3 = this.consensus.getBlocksTip()
            const hTip3 = this.consensus.getHeaderTip()
            logger.info(`Block3 Status : ${status3}\n`)
            logger.info(`Block2 Status : ${status2}\n`)
            logger.info(`Block1 Status : ${status1}\n`)
            logger.info(`Block3Tip : ${bTip3.hash}(${bTip3.height}) / Header3Tip : ${hTip3.hash}(${hTip3.height})`)
        }, 1000)
    }
}
