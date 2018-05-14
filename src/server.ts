import commandLineArgs = require("command-line-args")
import { randomBytes } from "crypto"
import { getLogger } from "log4js"
import { HttpServer } from "./api/server/server"
import { Address } from "./common/address"
import { ITxPool } from "./common/itxPool"
import { TxPool } from "./common/txPool"
import { Database } from "./consensus/database/database"
import { WorldState } from "./consensus/database/worldState"
import { IConsensus } from "./consensus/iconsensus"
import { SingleChain } from "./consensus/singleChain"
import { Sync } from "./consensus/sync"
import { IMiner } from "./miner/iminer"
import { MinerServer } from "./miner/minerServer"
import { StratumServer } from "./miner/stratumServer"
import { INetwork } from "./network/inetwork"
import { RabbitNetwork } from "./network/rabbit/rabbitNetwork" // for speed
import { RestManager } from "./rest/restManager"
import { TestServer } from "./testServer"
import { Wallet } from "./wallet/wallet"
import { WalletManager } from "./wallet/walletManager"
const optionDefinitions = [
    { name: "api", alias: "a", type: Boolean },
    { name: "api_port", alias: "A", type: Number },
    { name: "writing", alias: "w", type: Boolean },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "plot", alias: "g", type: Boolean },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "port", alias: "p", type: Number },
    { name: "str_port", alias: "s", type: Number },
    { name: "networkid", alias: "n", type: Number },
    { name: "mine", alias: "m", type: Boolean },
    { name: "visDAG", alias: "d", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
    { name: "disable_upnp", alias: "x", type: Boolean },
]
const logger = getLogger("Server")

/*
main start of hycon
*/
export class Server {
    public static subsid = 0
    public static globalOptions: any
    public subscription: Map<number, any> | undefined
    public readonly consensus: IConsensus = undefined // the core
    public readonly network: INetwork = undefined // hycon network
    public readonly miner: IMiner = undefined // miner
    public readonly wallet: WalletManager = undefined
    public readonly txPool: ITxPool = undefined // tx pool
    public readonly rest: RestManager = undefined // api server for hycon
    public db: Database
    public accountDB: WorldState
    public test: TestServer
    public httpServer: HttpServer
    public sync: Sync
    constructor() {
        Server.globalOptions = commandLineArgs(optionDefinitions)
        Server.globalOptions = Server.globalOptions
        logger.info(`Options=${JSON.stringify(Server.globalOptions)}`)
        logger.info(`Verbose=${Server.globalOptions.verbose}`)
        logger.info(`Port=${Server.globalOptions.port}`)
        if (Server.globalOptions.api_port !== "") {
            logger.info(`API Port=${Server.globalOptions.api_port}`)
        }

        this.consensus = new SingleChain(this, "./deleteme.db", "./deleteme.ws", "./deleteme.file")
        this.network = new RabbitNetwork(this, Server.globalOptions.port)

        this.wallet = new WalletManager(this)
        this.miner = new MinerServer(this, Server.globalOptions.str_port)
        this.txPool = new TxPool(this)
        this.rest = new RestManager(this)
        // sync is now being coded
        // this.sync = new Sync(this)
    }
    public async run() {
        this.readOptions()
        await this.consensus.init()
        logger.info("Starting server...")
        logger.debug(`API flag is ${Server.globalOptions.api}`)
        if (Server.globalOptions.api) {
            logger.info("Test API")
            logger.info(`API Port ${Server.globalOptions.api_port}`)
            this.httpServer = new HttpServer(this.rest, Server.globalOptions.api_port)
        }
        await this.network.start()
        await Wallet.walletInit()
        if (Server.globalOptions.peer) {
            for (const peer of Server.globalOptions.peer) {
                const [ip, port] = peer.split(":")
                logger.info(`Connecting to ${ip}:${port}`)
                this.network.connect(ip, port, true).catch((e) => logger.error(`Failed to connect to client: ${e}`))
            }
        }
        await this.runSync()
        this.miner.start()
    }

    public async runSync(): Promise<void> {
        logger.debug(`begin sync`)
        let sync = new Sync(this)
        await sync.sync()
        setImmediate(() => {
            this.runSync()
        })
        sync = null
        logger.debug(`end sync`)
    }

    private readOptions() {
        const options = commandLineArgs(optionDefinitions)
        logger.info(`Options=${JSON.stringify(options)}`)
        logger.info(`Verbose=${options.verbose}`)
        logger.info(`Port=${options.port}`)
        if (options.writing) {
            logger.info("Test Writing")
            this.test = new TestServer(this)
        }
        if (options.mine) {
            MinerServer.useCpuMiner = true
        }
    }

    // TODO : Block, hash, SignedTx, randomBytes import, and testMakeBlock(db, consensus) remove
    // tslint:disable-next-line:member-ordering
    public async testConsensus() {
        const block1 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const block1Hash = new Hash(block1.header)
        logger.error(`########################   Make block1:${block1Hash}`)
        const block2 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const decodeBlock = Block.decode(block1.encode())

        const block2Hash = new Hash(block1.header)
        logger.error(`########################   Make block2:${block2Hash}`)
        const block3 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3))
        const block3Hash = new Hash(block3.header)
        logger.error(`########################   Make block3:${block3Hash}`)

        setTimeout(async () => {
            logger.error(`########################   Save block1`)
            for (const tx of block1.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.consensus.putBlock(block1)
            const bTip1 = this.consensus.getBlocksTip()
            const hTip1 = this.consensus.getHeaderTip()
            logger.error(`########################   Block1Tip : ${bTip1.hash}(${bTip1.height}) / Header1Tip : ${hTip1.hash}(${hTip1.height})`)
            const tipHash1 = await this.consensus.getHash(bTip1.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash1}`)

            logger.error(`########################   Save block2`)
            for (const tx of block2.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.consensus.putBlock(block2)
            const bTip2 = this.consensus.getBlocksTip()
            const hTip2 = this.consensus.getHeaderTip()
            logger.error(`########################   Block2Tip : ${bTip2.hash}(${bTip2.height}) / Header2Tip : ${hTip2.hash}(${hTip2.height})`)
            const tipHash2 = await this.consensus.getHash(bTip2.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash2}`)

            logger.error(`########################   Save block3`)
            for (const tx of block3.txs) {
                logger.error(`Tx : ${new Hash(tx)}`)
            }
            await this.consensus.putBlock(block3)
            const bTip3 = this.consensus.getBlocksTip()
            const hTip3 = this.consensus.getHeaderTip()
            logger.error(`########################   Block3Tip : ${bTip3.hash}(${bTip3.height}) / Header2Tip : ${hTip3.hash}(${hTip3.height})`)
            const tipHash3 = await this.consensus.getHash(bTip3.height)
            logger.error(`########################   Get Hash using Tip Height : ${tipHash3}`)

            // Block4(block2)
            setTimeout(async () => {
                const block4 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block2)
                const block4Hash = new Hash(block4.header)
                logger.error(`########################   Make block4:${block4Hash}`)
                logger.error(`########################   Save block4`)
                for (const tx of block4.txs) {
                    logger.error(`Tx : ${new Hash(tx)}`)
                }
                await this.consensus.putBlock(block4)
                const bTip4 = this.consensus.getBlocksTip()
                const hTip4 = this.consensus.getHeaderTip()
                logger.error(`########################   Block4Tip : ${bTip4.hash}(${bTip4.height}) / Header4Tip : ${hTip4.hash}(${hTip4.height})`)
                const tipHash4 = await this.consensus.getHash(bTip4.height)
                logger.error(`########################   Get Hash using Tip Height : ${tipHash4}`)

                // Block5(block3)
                setTimeout(async () => {
                    const block5 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block3)
                    const block5Hash = new Hash(block5.header)
                    logger.error(`########################   Make block5:${block5Hash}`)
                    logger.error(`########################   Save block5`)
                    for (const tx of block5.txs) {
                        logger.error(`Tx : ${new Hash(tx)}`)
                    }
                    await this.consensus.putBlock(block5)
                    const bTip5 = this.consensus.getBlocksTip()
                    const hTip5 = this.consensus.getHeaderTip()
                    logger.error(`########################   Block5Tip : ${bTip5.hash}(${bTip5.height}) / Header5Tip : ${hTip5.hash}(${hTip5.height})`)
                    const tipHash5 = await this.consensus.getHash(bTip5.height)
                    logger.error(`########################   Get Hash using Tip Height : ${tipHash5}`)

                    // Block6(block5)
                    const block6 = await this.consensus.testMakeBlock(this.txPool.updateTxs([], 3), block5)
                    const block6Hash = new Hash(block6.header)
                    logger.error(`########################   Make block6:${block6Hash}`)
                    logger.error(`########################   Save block6`)
                    for (const tx of block6.txs) {
                        logger.error(`Tx : ${new Hash(tx)}`)
                    }
                    await this.consensus.putBlock(block6)
                    const bTip6 = this.consensus.getBlocksTip()
                    const hTip6 = this.consensus.getHeaderTip()
                    logger.error(`########################   Block6Tip : ${bTip6.hash}(${bTip6.height}) / Header5Tip : ${hTip6.hash}(${hTip6.height})`)
                    const tipHash6 = await this.consensus.getHash(bTip6.height)
                    logger.error(`########################   Get Hash using Tip Height : ${tipHash6}`)
                }, 1000)

            }, 1000)

        }, 2000)
    }
}
