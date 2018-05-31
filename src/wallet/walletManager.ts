import {Wallet} from "./wallet"
// tslint:disable-next-line:no-var-requires
const readline = require("readline")
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
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            while (true) {
                const pwd = Math.floor(Math.random() * 0xFFFFFF)
                let pw1 = ""
                let pw2 = ""
                await new Promise( (resolve) => {
                    rl.question("Please type your miner password?", (answer: string) => {
                        pw1 = answer
                        resolve()
                    })
                })

                await new Promise((resolve) => {
                    rl.question("Please type your miner password again?", (answer: string) => {
                        pw2 = answer
                        resolve()
                    })
                })

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
