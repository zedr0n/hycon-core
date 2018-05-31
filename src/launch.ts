
import conf = require("./settings")
import { WalletManager } from "./wallet/walletManager"
if (conf.minerAddress === undefined || conf.minerAddress === "") {
    WalletManager.initialize()

}
