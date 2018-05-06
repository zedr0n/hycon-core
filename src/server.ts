import commandLineArgs = require("command-line-args")
import { randomBytes } from "crypto"
import { getLogger } from "log4js"
<<<<<<< HEAD
import { IResponseError } from "../rest/client/rest"
import { Address } from "./common/address"
import { AppTxPool } from "./common/appTxPool"
import { Block } from "./common/block"
import { ITxPool } from "./common/itxPool"
import { TxList } from "./common/txList"
=======
import { Block } from "./common/block"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
>>>>>>> Tidy up
import { SignedTx } from "./common/txSigned"
import { AppConsensus } from "./consensus/appConsensus"
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
]

const logger = getLogger("Server")

export class Server {
    public static subsid = 0
    public useRabbit = true
    // public peerList: PeerList
    public subscription: Map<number, any> | undefined
    public txQueue: TxList
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
        await this.consensus.init()
        logger.info("Starting server...")
        this.readOptions()
        this.network.start()
        this.miner.start()
    }

    // tslint:disable:object-literal-sort-keys
    public async createSubscription(sub: { address: string, url: string, from: boolean, to: boolean }): Promise<{ id: number } | IResponseError> {
        try {
            const addressOfWallet = new Address(sub.address)
            const account = await this.accountDB.getAccount(this.db.tips[0].header.stateRoot, addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            this.subscription = new Map()
            this.subscription.set(Server.subsid, [sub.address, sub.url, sub.from, sub.to])

            return Promise.resolve({
                id: Server.subsid++,
            })
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }

    public async deleteSubscription(address: string, id: number): Promise<number | IResponseError> {
        try {
            const addressOfWallet = new Address(address)
            const account = await this.accountDB.getAccount(this.db.tips[0].header.stateRoot, addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            this.subscription = new Map()
            this.subscription.delete(id)

            return Promise.resolve(204)
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
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
