import { getLogger } from "log4js"
const logger = getLogger("Server")
const commandLineArgs = require("command-line-args")
import { AppTxPool } from "./common/appTxPool"
import { AppConsensus } from "./consensus/appConsensus"
import { IConsensus } from "./consensus/consensus"
import { AppMiner } from "./miner/appMiner"
import { IMiner } from "./miner/miner"
import { AppNetwork } from "./network/appNetwork"
import { INetwork } from "./network/network"
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

export class Server {
    public network: INetwork = undefined // hycon network
    public consensus: IConsensus = undefined // the core
    public miner: IMiner = undefined // miner

    public wallet: WalletManager = undefined

    public txPool: AppTxPool = undefined // tx pool
    public rest: RestManager = undefined // api server for hycon
    public options: any // json options

    constructor() {
        this.readOptions()
        this.consensus = new AppConsensus(this)
        this.network = new AppNetwork(this.options.port, this)
        this.wallet = new WalletManager(this)
        this.miner = new AppMiner(this)
        this.txPool = new AppTxPool(this)
        this.rest = new RestManager(this)
        this.network.start()

    }
    public run() {
        logger.info("Starting server...")
        setInterval(() => {
            // just polling
        }, 1000)
    }
    private readOptions() {
        const options = commandLineArgs(optionDefinitions)
        this.options = options
        logger.info(`Options=${JSON.stringify(options)}`)
        logger.info(`Verbose=${options.verbose}`)
        logger.info(`Port=${options.port}`)
    }
}
