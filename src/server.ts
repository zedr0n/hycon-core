import { getLogger } from "log4js"

const logger = getLogger("Server")

import { AppTxPool } from "./common/appTxPool"
import { AppConsensus } from "./consensus/appConsensus"
import { IConsensus } from "./consensus/consensus"
import { AppMiner } from "./miner/appMiner"
import { IMiner } from "./miner/miner"
import { AppNetwork } from "./network/appNetwork"
import { INetwork } from "./network/network"
import { RestManager } from "./rest/restManager"
import { WalletManager } from "./wallet/walletManager"
export class Server {
    public network: INetwork = undefined // hycon network
    public consensus: IConsensus = undefined // the core
    public miner: IMiner = undefined // miner

    public wallet: WalletManager = undefined

    public txPool: AppTxPool = undefined // tx pool
    public rest: RestManager = undefined // api server for hycon

    constructor() {
        this.consensus = new AppConsensus(this)
        this.network = new AppNetwork(8148, this)
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
}
