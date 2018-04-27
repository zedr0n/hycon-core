import { getLogger } from "log4js"
import { setInterval } from "timers"
import { Block } from "../../serialization/proto"
import { Ping } from "../../serialization/proto"
import { IPeer } from "../ipeer"
import { INetwork } from "../network"
import { RabbitPeer } from "./netPeer"
import { RabbitNetwork } from "./network"

const logger = getLogger("Network")
logger.level = "debug"

logger.debug("OK")

async function pollingNewone(sampleClient: any) {

    let result
    result = await sampleClient.putBlocks(
        [new Block({ miner: Buffer.from("apple") })])
    result = await sampleClient.ping()
    result = await sampleClient.getTxs(100)
    result = await sampleClient.getHeadersByHash([])
    result = await sampleClient.getBlocksByHash([])
    result = await sampleClient.getBlocksByRange(0, 0)
    result = await sampleClient.getHeadersByRange(0, 0)
    logger.debug(`*************** Result=${JSON.stringify(result)}`)
}
async function testNetwork() {
    logger.debug(`Network`)
    const tcp: RabbitNetwork = new RabbitNetwork(undefined, 8148)
    tcp.start()
    const sampleClient = await tcp.addClient("localhost", 8148)
    sampleClient.test()
    setTimeout(() => {
        pollingNewone(sampleClient)
    }, 2000)
}

testNetwork()
// run the main loop
setInterval(
    () => { }, 1000)
