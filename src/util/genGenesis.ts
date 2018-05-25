import * as fs from "fs-extra"
import { configure, getLogger } from "log4js"
import Long = require("long")
import merkle = require("merkle-lib")
import { Address } from "../common/address"
import { GenesisBlock } from "../common/blockGenesis"
import { GenesisTx } from "../common/txGenesis"
import { GenesisSignedTx } from "../common/txGenesisSigned"
import { SignedTx } from "../common/txSigned"
import { WorldState } from "../consensus/database/worldState"
import { Block } from "../serialization/proto"
import { Wallet } from "../wallet/wallet"
import { hycontoString } from "./commonUtil"
import { Hash } from "./hash"

// When generate genesisBlock, you should remove extends BaseBlockHeader from BlockHeader !!
// blockHeader.ts

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

const logger = getLogger("Genesis")

const g = GenesisBlock.loadFromFile()
logger.info(`Genesis hash : ${new Hash(g.header)}`)
for (const tx of g.txs) {
    if (tx.verify()) {
        logger.info(`Tx amount : ${tx.amount} /  Address : ${tx.to} / rec : ${tx.recovery}`)
    }
}
logger.info(`Genesis : `, g)
editGenesis(g)

const nameList = [
    { name: "ico", balance: 2e09 }, { name: "airdrop", balance: 4e08 },
    { name: "team", balance: 5e08 }, { name: "devfund", balance: 5e08 },
    { name: "bounty", balance: 5e08 }, { name: "csr", balance: 1e08 },
    // Just for testGenesis
    { name: "test1", balance: 1e6 }, { name: "test2", balance: 2e6 },
    { name: "test3", balance: 3e6 }, { name: "test4", balance: 4e6 },
    { name: "test5", balance: 5e6 }, { name: "test6", balance: 6e6 },
    { name: "test7", balance: 7e6 }, { name: "test8", balance: 8e6 },
    { name: "test9", balance: 9e6 }, { name: "test10", balance: 1e7 },
    { name: "test11", balance: 11e6 }, { name: "test12", balance: 12e6 },
]

async function editGenesis(genesis: GenesisBlock) {
    genesis.txs = []
    const stx = await makeWallet()
    stx.sort((a, b) => a.to[0] - b.to[0])
    genesis.txs = stx
    genesis.header.merkleRoot = merkleRoot(genesis.txs)
    genesis.txs.unshift(new SignedTx({
        amount: 0,
        fee: 0,
        from: Buffer.from("Glosfer"),
        nonce: 0,
        recovery: 0,
        signature: Buffer.from("Everyone connected to everyone through GLObal tranSFER"),
        to: Buffer.from("The world"),
    }))
    const ws = new WorldState("./deleteme.ws", undefined)
    const firstResult = await ws.first(genesis)
    genesis.header.stateRoot = firstResult.currentStateRoot
    logger.info(`Genesis hash : ${new Hash(genesis.header)}`)

    fs.writeFileSync("./data/genesisTest.dat", genesis.encode())
    const editedGen = GenesisBlock.decode(fs.readFileSync("./data/genesisTest.dat"))
    logger.info(`Genesis : `, editedGen)
    for (const tx of editedGen.txs) {
        if (!tx.verify()) { continue }
        logger.info(`Tx amount : ${hycontoString(tx.amount)}`)
    }
}

async function makeWallet() {
    const wallets: Wallet[] = []
    const addressList: Address[] = []
    const stx: GenesisSignedTx[] = []
    await Wallet.walletInit()
    // for (let i = 0; i < 6; i++) {
    for (let i = 0; i < 18; i++) {
        let w
        do {
            w = Wallet.generate()
        } while (compareFirstLetter(addressList, w.pubKey.address()))
        logger.info(`Mnemonic setting is over name is : ${nameList[i].name}`)
        await w.save(nameList[i].name, "")
        const address = w.pubKey.address()
        addressList.push(address)
        const tx = new GenesisTx({
            amount: Long.fromNumber(nameList[i].balance, true).multiply(Math.pow(10, 9)),
            to: address,
        })
        stx.push(w.privKey.sign(tx))
    }
    return stx
}

function compareFirstLetter(addressList: Address[], compareTarget: Address): boolean {
    for (const address of addressList) {
        if (compareTarget[0] === address[0]) {
            return true
        }
    }
    return false
}

function merkleRoot(stx: GenesisSignedTx[]) {
    // Update merkleRoot
    const values: Uint8Array[] = []
    stx.forEach((tx) => {
        const hash = new Hash(tx)
        values.push(hash)
    })
    const outArr = merkle(values, Hash.hash)
    return new Hash(outArr[outArr.length - 1])
}
