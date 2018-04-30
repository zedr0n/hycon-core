import { getLogger } from "log4js"
import { SignedTx } from "./common/txSigned"
import { Block, Tx } from "./serialization/proto"

import { Server } from "./server"
const logger = getLogger("TestServer")

export class TestServer {
    public server: Server
    private txs: Tx[] = []
    constructor(server: Server) {
        this.server = server
        setInterval(() => {
            this.makeTx()
        }, 700)
        setInterval(() => {
            this.makeBlock()
        }, 5000)
    }

    private async makeTx() {
        logger.debug(`Make Tx  Current Queue=${this.txs.length}`)
        const newTx = new Tx({ amount: Math.random() * 1000, fee: Math.random() * 10 })
        this.txs.push(newTx)

    }

    private async makeBlock() {
        logger.debug(`Make Block`)
        const newBlock = new Block({ txs: this.txs })
        this.txs = []
    }
}
