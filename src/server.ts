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
    { name: "disable_upnp", alias: "x", type: Boolean },
    { name: "mine", alias: "m", type: Boolean },
    { name: "networkid", alias: "n", type: Number },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "plot", alias: "g", type: Boolean },
    { name: "port", alias: "p", type: Number },
    { name: "postfix", alias: "P", type: String },
    { name: "str_port", alias: "s", type: Number },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "visualize", alias: "V", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
    { name: "writing", alias: "w", type: Boolean },
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

        if (Server.globalOptions.port === undefined) {
            Server.globalOptions.port = 20000 + Math.floor(40000 * Math.random())
        }
        logger.info(`Port=${Server.globalOptions.port}`)

        if (Server.globalOptions.str_port === undefined) {
            Server.globalOptions.str_port = 20000 + Math.floor(40000 * Math.random())
        }
        logger.info(`Stratum Port=${Server.globalOptions.str_port}`)

        if (Server.globalOptions.api_port !== "") {
            logger.info(`API Port=${Server.globalOptions.api_port}`)
        }
        if (Server.globalOptions.postfix === undefined) {
            Server.globalOptions.postfix = ""
        }

        const postfix = Server.globalOptions.postfix
        this.consensus = new SingleChain(this, "blockdb" + postfix, "worldstate" + postfix, "rawblock" + postfix, "txDB" + postfix)
        this.network = new RabbitNetwork(this, Server.globalOptions.port, "peerdb" + postfix)

        this.wallet = new WalletManager(this)
        this.miner = new MinerServer(this, Server.globalOptions.str_port)
        if (Server.globalOptions.mine) {
            MinerServer.useCpuMiner = true
        }
        this.txPool = new TxPool(this)
        this.rest = new RestManager(this)

        // this.sync = new Sync(this)
    }
    public async run() {
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
                this.network.connect(ip, port).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }
        if (Server.globalOptions.writing) {
            logger.info("Test Writing")
            this.test = new TestServer(this)
        }
        await this.runSync()
        this.miner.start()
    }

    public async runSync(): Promise<void> {
        logger.debug(`begin sync`)
        let sync = new Sync(this)
        await sync.sync()
        setTimeout(() => {
            this.runSync()
        }, 5000)
        sync = null
        logger.debug(`end sync`)
    }
}
