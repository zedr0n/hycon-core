import commandLineArgs = require("command-line-args")
import { getLogger } from "log4js"
import { HttpServer } from "./api/server/server"
import { Address } from "./common/address"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { SingleChain } from "./consensus/singleChain"
import { Sync } from "./consensus/sync"
import { IMiner } from "./miner/iminer"
import { MinerServer } from "./miner/minerServer"
import { StratumServer } from "./miner/stratumServer"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { TestServer } from "./testServer"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"
const optionDefinitions = [
    { name: "api", alias: "a", type: Boolean },
    { name: "api_port", alias: "A", type: Number },
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
    { name: "disable_upnp", alias: "x", type: Boolean },
    { name: "postfix", alias: "P", type: String },
]
const logger = getLogger("Server")

/*
main start of hycon
*/
export class Server {
    public static subsid = 0
    public static globalOptions: any
    public subscription: Map<number, any> | undefined
    public readonly consensus: IConsensus = undefined // the core
    public readonly network: INetwork = undefined // hycon network
    public readonly miner: IMiner = undefined // miner
    public readonly wallet: WalletManager = undefined
    public readonly txPool: ITxPool = undefined // tx pool
    public readonly rest: RestManager = undefined // api server for hycon
    public db: Database
    public accountDB: WorldState
    public test: TestServer
    public httpServer: HttpServer
    public sync: Sync
    constructor() {
        Server.globalOptions = commandLineArgs(optionDefinitions)
        Server.globalOptions = Server.globalOptions
        logger.info(`Options=${JSON.stringify(Server.globalOptions)}`)
        logger.info(`Verbose=${Server.globalOptions.verbose}`)
        logger.info(`Port=${Server.globalOptions.port}`)
        if (Server.globalOptions.api_port !== "") {
            logger.info(`API Port=${Server.globalOptions.api_port}`)
        }
        if (Server.globalOptions.postfix === undefined) {
            Server.globalOptions.postfix = ""
        }
        const postfix = Server.globalOptions.postfix
        this.consensus = new SingleChain(this, "deleteme.db" + postfix, "deleteme.ws" + postfix, "deleteme.file" + postfix)
        this.network = new RabbitNetwork(this, Server.globalOptions.port, "deleteme.peer" + postfix)

        this.wallet = new WalletManager(this)
        this.miner = new MinerServer(this, Server.globalOptions.str_port)
        this.txPool = new TxPool(this)
        this.rest = new RestManager(this)
        // sync is now being coded
        // this.sync = new Sync(this)
    }
    public async run() {
        this.readOptions()
        await this.consensus.init()
        logger.info("Starting server...")
        logger.debug(`API flag is ${Server.globalOptions.api}`)
        if (Server.globalOptions.api) {
            logger.info("Test API")
            logger.info(`API Port ${Server.globalOptions.api_port}`)
            this.httpServer = new HttpServer(this.rest, Server.globalOptions.api_port)
        }
        await this.network.start()
        await Wallet.walletInit()
        if (Server.globalOptions.peer) {
            for (const peer of Server.globalOptions.peer) {
                const [ip, port] = peer.split(":")
                logger.info(`Connecting to ${ip}:${port}`)
                this.network.connect(ip, port, true).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }
        await this.runSync()
        this.miner.start()
    }

    public async runSync(): Promise<void> {
        logger.debug(`begin sync`)
        let sync = new Sync(this)
        await sync.sync()
        setImmediate(() => {
            this.runSync()
        })
        sync = null
        logger.debug(`end sync`)
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
}
