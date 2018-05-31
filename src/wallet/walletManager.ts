import {Wallet} from "./wallet"
// tslint:disable-next-line:no-var-requires
const input = require("input")
export class WalletManager {

    public static async getDefaultWallet(): Promise<string> {
        try {
            const address = await Wallet.getAddress("defaultMiner")
            return address
        } catch (error) {
            return ""
        }    }
    public static async initialize(): Promise < string > {
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
            await newWallet.save("defaultMiner", password, "")
            const address = newWallet.pubKey.address().toString()
            // tslint:disable-next-line:no-console
            console.log(`Default Miner Wallet ${address}`)
            return address
        } catch (error) {
        }
    }
}
