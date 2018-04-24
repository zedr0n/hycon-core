import { getLogger } from "log4js"
import { AppNetwork } from "./appNetwork"
import { INetwork } from "./network"
const logger = getLogger("Network")
logger.level = "debug"

function testNetwork() {
    logger.debug(`Network`)
    const tcp: INetwork = new AppNetwork()
    tcp.start()
    let newone: IPeer = tcp.addClient("localhost", 8148)
}

testNetwork()
// run the main loop
setInterval(
    () => { }, 1000)
