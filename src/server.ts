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
    public async testReorg() {
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
            await this.consensus.testMakeBlock(stxArray.slice(0, 3)).then(async (value: Block) => {
                await this.consensus.testMakeBlock(stxArray.slice(3, 7)).then(async (value2: Block) => {
                    await this.consensus.putBlock(value2)
                })
                await this.consensus.putBlock(value).then(async () => {
                    setTimeout(() => {
                        logger.debug(`Start 3`)
                        this.consensus.testMakeBlock(stxArray.slice(0, 2)).then(async (value3: Block) => {
                            await this.consensus.putBlock(value3)
                        })
                    }, 100)
                })
            })
        }, 1000)
    }
}
