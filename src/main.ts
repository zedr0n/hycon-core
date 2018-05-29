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
    { name: "cpuMiners", alias: "m", type: Number },
    { name: "disable_upnp", alias: "x", type: Boolean },
    { name: "disable_nat", alias: "N", type: Boolean },
    { name: "networkid", alias: "n", type: String },
    { name: "peer", type: String, multiple: true, defaultOption: true },
    { name: "plot", alias: "g", type: Boolean },
    { name: "port", alias: "p", type: Number },
    { name: "postfix", alias: "P", type: String },
    { name: "str_port", alias: "s", type: Number },
    { name: "verbose", alias: "v", type: Boolean, defaultOption: false },
    { name: "visualize", alias: "V", type: Boolean },
    { name: "wallet", alias: "W", type: Boolean },
    { name: "writing", alias: "w", type: Boolean },
    { name: "nonLocal", alias: "l", type: Boolean },
    { name: "genesis", alias: "G", type: String },
]
export const globalOptions = commandLineArgs(optionDefinitions)

import conf = require("./settings")
if (globalOptions.port === 0) {
    globalOptions.port = 20000 + Math.floor(40000 * Math.random())
}

if (globalOptions.str_port === 0) {
    globalOptions.str_port = 20000 + Math.floor(40000 * Math.random())
}

if (globalOptions.api_port !== "") {
    logger.info(`API Port=${globalOptions.api_port}`)
}
if (globalOptions.postfix === undefined) {
    globalOptions.postfix = ""
}
if (globalOptions.networkid === undefined) {
    globalOptions.networkid = "hycon"
}
if (globalOptions.verbose) {
    logger.level = "debug"
}
if (globalOptions.cpuMiners === undefined) {
    globalOptions.cpuMiners = 0
}
if (globalOptions.genesis !== undefined) {
    conf.dataGenesis = globalOptions.genesis
}
if (globalOptions.nonLocal === undefined) {
    globalOptions.nonLocal = false
}
logger.info(`GenesisBlock=${conf.dataGenesis}`)

logger.info(`Options=${JSON.stringify(globalOptions)}`)
logger.info(`Verbose=${globalOptions.verbose}`)
logger.info(`Port=${globalOptions.port}`)
logger.info(`Stratum Port=${globalOptions.str_port}`)

import { Server } from "./server"
const hycon = new Server()
hycon.run()
