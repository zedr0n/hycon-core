import * as fs from "fs-extra"
import { configure, getLogger } from "log4js"
configure({
    appenders: {
        // console: { type: "stdout" },
        console: {
            type: "log4js-protractor-appender",
        },
        fileLogs: {
            filename: `./logs/${new Date().getFullYear()}-${(new Date().getMonth()) + 1}-${new Date().getDate()}/logFile.log`,
            keepFileExt: true,
            maxLogSize: 16777216,
            pattern: ".yyyy-MM-dd",
            type: "dateFile",
        },
    },
    categories: {
        default: { appenders: ["console", "fileLogs"], level: "info" },
    },
})
const logger = getLogger("Main")

import commandLineArgs = require("command-line-args")
const optionDefinitions = [
    { name: "api", alias: "a", type: Boolean },
    { name: "api_port", alias: "A", type: Number },
    { name: "bootstrap", type: Boolean },
    { name: "cpuMiners", alias: "m", type: Number },
    { name: "disable_upnp", alias: "x", type: Boolean },
    { name: "disable_nat", alias: "N", type: Boolean },
    { name: "genesis", alias: "G", type: String },
    { name: "minerAddress", alias: "M", type: String },
    { name: "networkid", alias: "n", type: String },
    { name: "nonLocal", alias: "l", type: Boolean },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "port", alias: "p", type: Number },
    { name: "postfix", alias: "P", type: String },
    { name: "str_port", alias: "s", type: Number },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "visualize", alias: "V", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
    { name: "writing", alias: "w", type: Boolean },
]
export const globalOptions = commandLineArgs(optionDefinitions)

import conf = require("./settings")

if (globalOptions.cpuMiners === undefined) {
    globalOptions.cpuMiners = 1
}
if (globalOptions.genesis !== undefined) {
    conf.dataGenesis = globalOptions.genesis
}
if (globalOptions.api_port !== "") {
    logger.info(`API Port=${globalOptions.api_port}`)
}
if (globalOptions.minerAddress === undefined) {
    globalOptions.minerAddress = conf.minerAddress
}
if (globalOptions.networkid === undefined) {
    globalOptions.networkid = "hycon"
}
if (globalOptions.nonLocal === undefined) {
    globalOptions.nonLocal = false
}
if (globalOptions.port === 0) {
    globalOptions.port = 20000 + Math.floor(40000 * Math.random())
}
if (globalOptions.postfix === undefined) {
    globalOptions.postfix = ""
}
if (globalOptions.str_port === 0) {
    globalOptions.str_port = 20000 + Math.floor(40000 * Math.random())
}
if (globalOptions.verbose) {
    logger.level = "debug"
}
logger.info(`GenesisBlock=${conf.dataGenesis}`)

logger.info(`Options=${JSON.stringify(globalOptions)}`)
logger.info(`Verbose=${globalOptions.verbose}`)
logger.info(`Port=${globalOptions.port}`)
logger.info(`Stratum Port=${globalOptions.str_port}`)

import { Server } from "./server"
import { WalletManager } from "./wallet/walletManager"

async function startHycon() {
    if (globalOptions.minerAddress === undefined || globalOptions.minerAddress === "") {
        let walletAddress = await WalletManager.getDefaultWallet()
        if (walletAddress === "") {
            walletAddress = await WalletManager.initialize()
        }
        globalOptions.minerAddress = conf.minerAddress = walletAddress
        fs.writeFileSync("./data/config.json", JSON.stringify(conf))
    }
    const hycon = new Server()
    hycon.run()
}

startHycon()
