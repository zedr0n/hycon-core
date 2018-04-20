import * as fs from 'fs-extra'
import conf = require('../settings')

export class FileUtil {
    public static init() {
        if (!fs.existsSync(conf.dataRoot)) {
            fs.mkdirSync(conf.dataRoot)
        }
        if (!fs.existsSync(conf.dataRaw)) {
            fs.mkdirSync(conf.dataRaw)
        }
        if (!fs.existsSync(conf.dataWallet)) {
            fs.mkdirSync(conf.dataWallet)
        }
    }
}