import commandLineArgs = require("command-line-args")
import { getLogger } from "log4js"
import { HttpServer } from "./api/server/server"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { Consensus } from "./consensus/consensus"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { Sync } from "./consensus/sync"
import { MinerServer } from "./miner/minerServer"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"

const optionDefinitions = [
    { name: "api", alias: "a", type: Boolean },
    { name: "api_port", alias: "A", type: Number },
    { name: "cpuMiners", alias: "m", type: Number },
    { name: "disable_upnp", alias: "x", type: Boolean },
    { name: "disable_nat", alias: "N", type: Boolean },
    { name: "networkid", alias: "n", type: String },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "plot", alias: "g", type: Boolean },
    { name: "port", alias: "p", type: Number },
    { name: "postfix", alias: "P", type: String },
    { name: "str_port", alias: "s", type: Number },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "visualize", alias: "V", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
    { name: "writing", alias: "w", type: Boolean },
    { name: "localOnly", alias: "l", type: Boolean, defaultOption: true },
]
const logger = getLogger("Server")

/*
main start of hycon
*/
export class Server {
    public static subsid = 0
    public static globalOptions: any
    public static triedSync: boolean = false
    public subscription: Map<number, any> | undefined
    public readonly consensus: IConsensus
    public readonly network: INetwork
    public readonly miner: MinerServer
    public readonly wallet: WalletManager
    public readonly txPool: ITxPool
    public readonly rest: RestManager
    public db: Database
    public accountDB: WorldState
    public httpServer: HttpServer
    public sync: Sync
    private triggerMining: () => void
    constructor() {

        Server.globalOptions = commandLineArgs(optionDefinitions)
        logger.info(`Options=${JSON.stringify(Server.globalOptions)}`)
        logger.info(`Verbose=${Server.globalOptions.verbose}`)

        if (Server.globalOptions.port === 0) {
            Server.globalOptions.port = 20000 + Math.floor(40000 * Math.random())
        }
        logger.info(`Port=${Server.globalOptions.port}`)

        if (Server.globalOptions.str_port === 0) {
            Server.globalOptions.str_port = 20000 + Math.floor(40000 * Math.random())
        }
        logger.info(`Stratum Port=${Server.globalOptions.str_port}`)

        if (Server.globalOptions.api_port !== "") {
            logger.info(`API Port=${Server.globalOptions.api_port}`)
        }
        if (Server.globalOptions.postfix === undefined) {
            Server.globalOptions.postfix = ""
        }
        if (Server.globalOptions.networkid === undefined) {
            Server.globalOptions.networkid = "hycon"
        }
        if (Server.globalOptions.verbose) {
            logger.level = "debug"
        }
        if (Server.globalOptions.cpuMiners === undefined) {
            Server.globalOptions.cpuMiners = 0
        }

        const postfix = Server.globalOptions.postfix
        this.txPool = new TxPool()
        this.consensus = new Consensus(this.txPool, "blockdb" + postfix, "worldstate" + postfix, "rawblock" + postfix, "txDB" + postfix)
        this.network = new RabbitNetwork(this.txPool, this.consensus, Server.globalOptions.port, "peerdb" + postfix, Server.globalOptions.networkid)
        this.miner = new MinerServer(this.consensus, this.network, Server.globalOptions.cpuMiners, Server.globalOptions.str_port)
        this.wallet = new WalletManager(this)
        this.rest = new RestManager(this)
    }
    public setTriggerMining(f: () => void) {
        this.triggerMining = f
    }
    public async run() {
        await this.consensus.init()
        logger.info("Starting server...")
        logger.debug(`API flag is ${Server.globalOptions.api}`)
        if (Server.globalOptions.api) {
            logger.info("Test API")
            logger.info(`API Port ${Server.globalOptions.api_port}`)
            this.httpServer = new HttpServer(this.rest, Server.globalOptions.api_port, { localOnly: Server.globalOptions.localOnly })
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
            throw new Error("Deprecated")
        }
        await this.runSync()
    }

    public async runSync(): Promise<void> {
        logger.debug(`begin sync`)
        const sync = new Sync(this)
        await sync.sync()
        // if (!Server.triedSync) {
        //     Server.triedSync = true
        //     this.triggerMining()
        // }
        setTimeout(async () => {
            await this.runSync()
        }, 5000)
        logger.debug(`end sync`)
    }
}
