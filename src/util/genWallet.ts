import { configure, getLogger } from "log4js"
import { Wallet } from "../wallet/wallet"

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

const logger = getLogger("GenWallet")
export const TestWalletMnemonics = [
    { name: "ico", mnemonic: "coach situate canyon dentist impulse topic cave ten clown glass increase proud" },
    { name: "airdrop", mnemonic: "unusual spray oven couch sustain gap cream join situate ginger bus metal" },
    { name: "team", mnemonic: "drift royal sight admit gasp city bread tomorrow consider mushroom dwarf enact" },
    { name: "devfund", mnemonic: "wrong rival detail shoulder just evolve menu remember habit world waste enjoy" },
    { name: "bounty", mnemonic: "onion wool wall relief pluck crunch bean amused learn earth body exclude" },
    { name: "csr", mnemonic: "angle man real shoe convince until noodle hurt attract prosper garage brass" },
    { name: "test1", mnemonic: "until diesel wolf climb era animal glance inquiry street music cheap hundred" },
    { name: "test2", mnemonic: "rural drama slight time link you reason river benefit brick narrow trust" },
    { name: "test3", mnemonic: "wish tornado radar rare daring bulk old toward sting hybrid vote demise" },
    { name: "test4", mnemonic: "perfect aim sauce stick lady net tooth print gym prepare fence radar" },
    { name: "test5", mnemonic: "cover recycle dentist spread veteran inner squeeze seed copper stadium rule photo" },
    { name: "test6", mnemonic: "math unique observe enlist window sunset drive early joke refuse various upon" },
    { name: "test7", mnemonic: "first pupil room ranch liar wonder economy peace left edge then indicate" },
    { name: "test8", mnemonic: "hint gap bridge head beef action manage sad cool tooth check add" },
    { name: "test9", mnemonic: "man laptop smoke able black same shock tuition observe bounce maid upper" },
    { name: "test10", mnemonic: "abuse anchor hello exotic company agree print category mesh heavy near thumb" },
    { name: "test11", mnemonic: "echo inherit solve own mirror remind panda must narrow equal evil glass" },
    { name: "test12", mnemonic: "ecology sort vicious urban luggage file jump kit park rocket fuel vessel" },
]

async function recoverWallet() {
    await Wallet.walletInit()
    const addressList = []
    for (let i = 0; i < 18; i++) {
        const address = await Wallet.recoverWallet({
            hint: "",
            language: "english",
            mnemonic: TestWalletMnemonics[i].mnemonic,
            name: TestWalletMnemonics[i].name,
            password: "",
        })
        addressList.push(address)
        logger.info(`Recovered Wallet : ${address}`)
    }
}

// recoverWallet().then(() => {
//     logger.info(`End of Recover Wallet`)
// })
