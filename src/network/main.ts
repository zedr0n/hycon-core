import { getLogger } from "log4js"
import { AppNetwork } from "./appNetwork"
const logger = getLogger("Network")
logger.level = "debug"

function testNetwork() {
    logger.debug(`Network`)
    const tcp = new AppNetwork()
    tcp.start()

    tcp.addClient("localhost", 8148)

}

testNetwork()
// run the main loop
setInterval(
    () => { }, 1000)
