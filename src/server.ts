import { getLogger } from "log4js"

const logger = getLogger("Server")

import { AppConsensus } from "./consensus/appConsensus"
import { IConsensus } from "./consensus/consensus"
import { AppMiner } from "./miner/appMiner"
import { IMiner } from "./miner/miner"
import { AppNetwork } from "./network/appNetwork"
import { INetwork } from "./network/network"
export class Server {
    public network: INetwork = undefined
    public consensus: IConsensus = undefined
    public miner: IMiner = undefined

    private constructor() {
        this.consensus = new AppConsensus(this)
        this.network = new AppNetwork(8148, this)
        this.miner = new AppMiner(this)
        this.network.start()
    }
    public run() {
        logger.info("Starting server...")
        setInterval(() => {
            // just polling
        }, 1000)
    }
}
