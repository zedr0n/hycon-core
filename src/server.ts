import { getLogger } from "log4js"
import { HttpServer } from "./api/server/server"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { Consensus } from "./consensus/consensus"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { Sync } from "./consensus/sync"
import { globalOptions } from "./main"
import { MinerServer } from "./miner/minerServer"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"

const logger = getLogger("Server")

export class Server {
    public static subsid = 0
    public static triedSync: boolean = false
    public subscription: Map<number, any> | undefined
    public readonly consensus: IConsensus
    public readonly network: INetwork
    public readonly miner: MinerServer
    public readonly wallet: WalletManager
    public readonly txPool: ITxPool
    public readonly rest: RestManager
    public httpServer: HttpServer
    public sync: Sync
    private triggerMining: () => void
    constructor() {

        const postfix = globalOptions.postfix
        this.txPool = new TxPool()
        this.consensus = new Consensus(this.txPool, "blockdb" + postfix, "worldstate" + postfix, "rawblock" + postfix, "txDB" + postfix, "minedDB" + postfix)
        this.network = new RabbitNetwork(this.txPool, this.consensus, globalOptions.port, "peerdb" + postfix, globalOptions.networkid)
        this.miner = new MinerServer(this.consensus, this.network, globalOptions.cpuMiners, globalOptions.str_port)
        this.wallet = new WalletManager(this)
        this.rest = new RestManager(this)
    }
    public setTriggerMining(f: () => void) {
        this.triggerMining = f
    }
    public async run() {
        await this.consensus.init()
        logger.info("Starting server...")
        logger.debug(`API flag is ${globalOptions.api}`)
        if (globalOptions.api) {
            logger.info("Test API")
            logger.info(`API Port ${globalOptions.api_port}`)
            this.httpServer = new HttpServer(this.rest, globalOptions.api_port, globalOptions)
        }
        await this.network.start()
        await Wallet.walletInit()
        if (globalOptions.peer) {
            for (const peer of globalOptions.peer) {
                const [ip, port] = peer.split(":")
                logger.info(`Connecting to ${ip}:${port}`)
                this.network.connect(ip, port).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }
        if (globalOptions.writing) {
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
