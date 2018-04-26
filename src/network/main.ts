import { getLogger } from "log4js"
import { Block } from "../serialization/proto"
import { Ping } from "../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { INetwork } from "./network"
import { IPeer } from "./peer"
import { PeerApp } from "./peerApp"

const logger = getLogger("Network")
logger.level = "debug"

let sampleClient: any
async function pollingNewone() {

    let result
    result = await sampleClient.putBlock(new Block({ miner: Buffer.from("apple") }))
    result = await sampleClient.ping()
    result = await sampleClient.getTxs(100)
    result = await sampleClient.getHeadersByHash([])
    result = await sampleClient.getBlocksByHash([])
    result = await sampleClient.getBlocksByRange(0, 0)
    result = await sampleClient.getHeadersByRange(0, 0)
    logger.debug(`Result=${JSON.stringify(result)}`)
}
function testNetwork() {
    logger.debug(`Network`)
    const tcp: AppNetwork = new AppNetwork(undefined, undefined)
    tcp.start()
    sampleClient = tcp.addClient("localhost", 8148)
    tcp.addClient("localhost", 8148)
    sampleClient.setConnectedCallback(() => {
        logger.debug(`OnConnected`)
        setTimeout(() => {
            pollingNewone()
        }, 1000)
    })
}

// testNetwork()
// // run the main loop
// setInterval(
//     () => { }, 1000)
