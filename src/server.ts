import { getLogger } from "log4js"

const logger = getLogger("Server")

import { AppTxPool } from "./common/appTxPool"
import { AppConsensus } from "./consensus/appConsensus"
import { IConsensus } from "./consensus/consensus"
import { AppMiner } from "./miner/appMiner"
import { IMiner } from "./miner/miner"
import { AppNetwork } from "./network/appNetwork"
import { INetwork } from "./network/network"
import { WalletManager } from "./wallet/walletManager"
export class Server {
    public network: INetwork = undefined
    public consensus: IConsensus = undefined
    public miner: IMiner = undefined

    public wallet: WalletManager = undefined

    public txPool: AppTxPool = undefined

    constructor() {
        this.consensus = new AppConsensus(this)
        this.network = new AppNetwork(8148, this)
        this.wallet = new WalletManager(this)
        this.miner = new AppMiner(this)
        this.txPool = new AppTxPool(this)
        this.network.start()
    }
    public run() {
        logger.info("Starting server...")
        setInterval(() => {
            // just polling
        }, 1000)
    }
}
