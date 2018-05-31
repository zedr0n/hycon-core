import { startHycon } from "../main"
import {Wallet} from "./wallet"
// tslint:disable-next-line:no-var-requires
const input = require("input")
export class WalletManager {
    public static async initialize() {
        try {
            Wallet.walletInit()
            let password = ""
            while (true) {
                const pwd = Math.floor(Math.random() * 0xFFFFFF)
                const pw1 = await input.text("Please type your miner password?", { default: pwd })
                const pw2 = await input.text("Please type your miner password again?", { default: pwd })
                if (pw1 === pw2) {
                    password = pw1
                    break
                } else {
                    // tslint:disable-next-line:no-console
                    console.log("password not matched")
                }
            }
            const newWallet = Wallet.randomWallet()
            await newWallet.save("miner", password, "")
        } catch (error) {
        }
        startHycon()
    }
}
