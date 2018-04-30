import { getLogger } from "log4js"
import { Server } from "./server"
const logger = getLogger("TestServer")

export class TestServer {
    public server: Server
    constructor(server: Server) {
        this.server = server
        setInterval(() => {
            this.makeTx()
        }, 1000)
        setInterval(() => {
            this.makeBlock()
        }, 5000)
    }

    private makeTx() {
        logger.debug(`Make Tx`)
    }

    private makeBlock() {
        logger.debug(`Make Block`)
    }

}
