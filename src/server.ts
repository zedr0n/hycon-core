import { getLogger } from "log4js"

const logger = getLogger("Server")

export class Server {
    public run() {
        logger.info("Starting server...")
    }
}
