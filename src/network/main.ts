import { getLogger } from "log4js"
import { Block } from "../serialization/proto"
import { Ping } from "../serialization/proto"
import { AppNetwork } from "./appNetwork"
import { INetwork } from "./network"
import { IPeer } from "./peer"
import { peerApp } from "./peerApp"

const logger = getLogger("Network")
logger.level = "debug"

let newone: IPeer

async function pollingNewone() {
    let result
    result = await newone.putBlock(new Block({ miner: Buffer.from("apple") }))
    result = await newone.ping()
    result = await newone.getTxs(100)
    result = await newone.getHeadersByHash([])
    result = await newone.getBlocksByHash([])
    result = await newone.getBlocksByRange(0, 0)
    result = await newone.getHeadersByRange(0, 0)
    logger.debug(`Result=${JSON.stringify(result)}`)
}
function testNetwork() {
    logger.debug(`Network`)
    const tcp: INetwork = new AppNetwork(undefined, undefined)
    tcp.start()
    newone = tcp.addClient("localhost", 8148)
    newone.setConnectedCallback(() => {
        logger.debug(`OnConnected`)
        setTimeout(() => {
            pollingNewone()
        }, 1000)
    })
}

testNetwork()
// run the main loop
setInterval(
    () => { }, 1000)
