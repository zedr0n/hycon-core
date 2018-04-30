import commandLineArgs = require("command-line-args")
import { getLogger } from "log4js"
import { AppTxPool } from "./common/appTxPool"
import { AppConsensus } from "./consensus/appConsensus"
import { IConsensus } from "./consensus/consensus"
import { AppMiner } from "./miner/appMiner"
import { IMiner } from "./miner/miner"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/network" // for speed
import { AppNetwork } from "./network/turtle/appNetwork" // for development only
import { RestManager } from "./rest/restManager"
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
    public readonly consensus: IConsensus = undefined // the core
    public readonly network: INetwork = undefined // hycon network
    public readonly miner: IMiner = undefined // miner

    public readonly wallet: WalletManager = undefined

    public readonly txPool: AppTxPool = undefined // tx pool
    public readonly rest: RestManager = undefined // api server for hycon
    public options: any // json options

    constructor() {
        this.options = commandLineArgs(optionDefinitions)
        logger.info(`Options=${JSON.stringify(this.options)}`)
        logger.info(`Verbose=${this.options.verbose}`)
        logger.info(`Port=${this.options.port}`)

        this.consensus = new AppConsensus(this)
        this.network = new RabbitNetwork(this.consensus, this.options.port)
        this.wallet = new WalletManager(this)
        this.miner = new AppMiner(this)
        this.txPool = new AppTxPool(this)
        this.rest = new RestManager(this)

    }
    public run() {
        logger.info("Starting server...")
        this.network.start()
    }
}
