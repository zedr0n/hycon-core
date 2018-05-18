import { configure } from "log4js"
import { Server } from "./server"

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
        default: { appenders: ["console", "fileLogs"], level: "debug" },
    },
})

const hycon = new Server()
hycon.run()
