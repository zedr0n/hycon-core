import { getLogger } from "log4js"
import * as Long from "long"
import { Address } from "../../common/address"
import { BlockHeader } from "../../common/blockHeader"
import { Tx } from "../../common/tx"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import { hyconfromString, hycontoString } from "../../util/commonUtil"
import { Hash } from "../../util/hash"
import { Wallet } from "../../wallet/wallet"
import { IBlock, IHyconWallet, IPeer, IResponseError, IRest, ITxProp, IUser, IWalletAddress } from "../client/rest"
const logger = getLogger("RestServer")
// tslint:disable-next-line:no-var-requires
const googleMapsClient = require("@google/maps").createClient({
    key: "AIzaSyAp-2W8_T6dZjq71yOhxW1kRkbY6E1iyuk",
})

// tslint:disable:object-literal-sort-keys
// tslint:disable:ban-types
// tslint:disable:no-bitwise
export class RestServer implements IRest {
    private consensus: IConsensus

    constructor(consensus: IConsensus) {
        this.consensus = consensus
    }

    public setIsHyconWallet(isHyconWallet: boolean): void { }
    public hyconWalletListener(callback: (isHyconWallet: boolean) => void): void {
        callback(false)
    }
    public loadingListener(callback: (loading: boolean) => void): void {
        callback(false)
    }
    public setLoading(loading: boolean): void { }

    public async createNewWallet(meta: IHyconWallet): Promise<IHyconWallet | IResponseError> {
        try {
            let wallet: Wallet
            await Wallet.walletInit()
            if (meta.mnemonic === undefined) {
                meta.mnemonic = Wallet.getRandomMnemonic(meta.language)
            }
            wallet = Wallet.generateKeyWithMnemonic(meta.mnemonic, meta.language)

            return Promise.resolve({
                mnemonic: meta.mnemonic,
                privateKey: wallet.privKey.toHexString(),
                address: wallet.pubKey.address().toString(),
            })
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }

    public async getWalletBalance(address: string): Promise<{ balance: string } | IResponseError> {
        try {
            const addressOfWallet = new Address(address)
            const account = await this.consensus.getAccount(addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            } else {
                const a = account.balance
                return Promise.resolve({
                    balance: account ? hycontoString(account.balance) : "0",
                })
            }
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_ADDRESS",
                message: e.toString(),
            })
        }
    }

    public async getWalletTransactions(address: string, nonce?: number): Promise<{ txs: ITxProp[] } | IResponseError> {
        try {
            const mapHashTx: Map<Hash, SignedTx> = new Map<Hash, SignedTx>()
            await Wallet.walletInit()
            const addressOfWallet = new Address(address)
            const account = await this.consensus.getAccount(addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            const n = 10
            const txList = await this.consensus.getLastTxs(addressOfWallet, n)
            const webTxs: ITxProp[] = []
            for (const tx of txList) {
                let webTx: ITxProp
                if (tx !== undefined) {
                    if (tx instanceof SignedTx && tx.nonce >= nonce) {
                        webTx = {
                            hash: tx.tx.unsignedHash().toString(),
                            amount: hycontoString(tx.tx.amount),
                            fee: hycontoString(tx.fee),
                            from: tx.from.toString(),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                        }
                    }
                    // unsigned Txs are unlisted
                    webTxs.push(webTx)
                }
            }
            return Promise.resolve({
                txs: webTxs,
            })
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_ADDRESS",
                message: e.toString(),
            })
        }
    }

    public async outgoingSignedTx(tx: { privateKey: string, from: string, to: string, amount: string, fee: string }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        try {
            const address = new Address(tx.to)
            const wallet = new Wallet(Buffer.from(tx.privateKey, "hex"))
            const account = await this.consensus.getAccount(new Address(tx.from))
            const total = hyconfromString(tx.amount).add(hyconfromString(tx.fee))
            logger.debug(`Total HYC: ${hycontoString(total)}`)
            logger.debug(`Account Balance: ${hycontoString(account.balance)}`)
            logger.debug(`Boolean: ${account.balance.lessThan(total)}`)
            if (account.balance.lessThan(total)) {
                throw new Error("insufficient wallet balance to send transaction")
            }
            const signedTx = wallet.send(address, hyconfromString(tx.amount.toString()), account.nonce + 1, hyconfromString(tx.fee.toString()))
            if (queueTx) {
                queueTx(signedTx)
            } else {
                throw new Error("could not queue transaction")
            }
            return Promise.resolve({
                txHash: new Hash(signedTx).toString(),
            })
        } catch (e) {
            return Promise.resolve({
                status: 404,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }

    public async outgoingTx(tx: { signature: string, from: string, to: string, amount: string, fee: string, nonce: number, recovery: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        try {
            const address = new Tx({
                from: new Address(tx.from),
                to: new Address(tx.to),
                amount: hyconfromString(tx.amount),
                fee: hyconfromString(tx.fee),
                nonce: tx.nonce,
            })

            let signedTx = new SignedTx(address, Buffer.from(tx.signature), 0)
            if (!signedTx.verify()) {
                signedTx = new SignedTx(address, Buffer.from(tx.signature), 1)
                if (!signedTx.verify()) {
                    throw new Error("transaction information or signature is incorrect")
                }
            }
            const account = await this.consensus.getAccount(new Address(tx.from))
            const total = hyconfromString(tx.amount).add(hyconfromString(tx.fee))
            if (account.balance.lessThan(total)) {
                throw new Error("insufficient wallet balance to send transaction")
            }
            if (queueTx) {
                queueTx(signedTx)
            } else {
                throw new Error("could not queue transaction")
            }
            return Promise.resolve({
                txHash: new Hash(signedTx).toString(),
            })
        } catch (e) {
            return Promise.resolve({
                status: 404,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }

    public async deleteWallet(name: string): Promise<boolean> {
        try {
            await Wallet.walletInit()
            const resultBool = await Wallet.delete(name)
            return Promise.resolve(resultBool)
        } catch (e) {
            return Promise.resolve(false)
        }
    }

    public async generateWallet(Hwallet: IHyconWallet): Promise<string> {
        await Wallet.walletInit()
        if (Hwallet.name !== undefined && Hwallet.password !== undefined && Hwallet.hint !== undefined && Hwallet.mnemonic !== undefined && Hwallet.language !== undefined) {
            const wallet = Wallet.generate({ name: Hwallet.name, password: Hwallet.password, mnemonic: Hwallet.mnemonic, language: Hwallet.language, hint: Hwallet.hint })
            await wallet.save(Hwallet.name, Hwallet.password)
            // TODO : save other information in wallet class
            const address = await Wallet.getAddress(Hwallet.name)
            return Promise.resolve(address.toString())
        } else {
            return Promise.reject("Information is missing.")
        }
    }

    public async getAddressInfo(address: string): Promise<IWalletAddress> {
        try {
            const addressOfWallet = new Address(address)
            const n = 10
            const account = await this.consensus.getAccount(addressOfWallet)
            const txList = await this.consensus.getLastTxs(addressOfWallet, n)
            const webTxs: ITxProp[] = []
            for (const tx of txList) {
                let webTx: ITxProp
                if (tx !== undefined) {
                    if (tx.tx instanceof SignedTx) {
                        webTx = {
                            hash: tx.tx.unsignedHash().toString(),
                            amount: hycontoString(tx.tx.amount),
                            fee: hycontoString(tx.tx.fee),
                            from: tx.tx.from.toString(),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                        }
                        // unsigned Txs are unlisted
                        webTxs.push(webTx)
                    }
                }
            }
            return Promise.resolve<IWalletAddress>({
                hash: address,
                balance: account ? account.balance.toInt() : 0,
                txs: webTxs,
            })

        } catch (e) {
            return Promise.reject(e)
        }
    }

    public async getAllAccounts(name: string): Promise<{ represent: number, accounts: Array<{ address: string, balance: string }> } | boolean> {
        try {
            await Wallet.walletInit()
            const account = await Wallet.getAddress(name)
            const result: Array<{ address: string, balance: string }> = []
            const acctFromWS = await this.consensus.getAccount(new Address(account))
            const acctElement = { address: account, balance: "0" }
            if (acctFromWS !== undefined) {
                acctElement.balance = hycontoString(acctFromWS.balance)
            }
            result.push(acctElement)
            return Promise.resolve({ represent: 0, accounts: result }) // TODO: Remove repressent
        } catch (e) {
            return Promise.resolve(false)
        }
    }

    public async getBlock(hash: string): Promise<IBlock> {
        try {
            // const dbBlock = await this.db.getDBBlock(Hash.decode(hash))
            const hyconBlock = await this.consensus.getBlockByHash(Hash.decode(hash))
            const txs: ITxProp[] = []
            for (const hyconTx of hyconBlock.txs) {
                if (hyconTx instanceof SignedTx) {
                    txs.push({
                        amount: hycontoString(hyconTx.amount),
                        hash: new Hash(hyconTx).toString(),
                        fee: hycontoString(hyconTx.fee),
                        from: hyconTx.from.toString(),
                        to: hyconTx.to.toString(),
                    })
                } else {
                    txs.push({
                        amount: hycontoString(hyconTx.amount),
                        hash: new Hash(hyconTx).toString(),
                        to: hyconTx.to.toString(),
                    })
                }
            }

            const webBlock = {
                hash,
                difficulty: hyconBlock.header.difficulty,
                // height: hyconBlock.height,
                txs,
                timeStamp: Number(hyconBlock.header.timeStamp),
            }

            if (hyconBlock.header instanceof BlockHeader) {
                Object.assign(webBlock, {
                    prevBlock: hyconBlock.header.previousHash,
                    nonce: hyconBlock.header.nonce,
                })
            }
            return Promise.resolve(webBlock)
        } catch (e) {
            return Promise.reject("Error while getting block information from server : " + e)
        }
    }
    public async getBlockList(index: number): Promise<{blocks: IBlock[], length: number}> {
        const n = 10
        const blockList: IBlock[] = []
        let pageCount: number = 0
        try {
            const blockTip = await this.consensus.getBlocksTip()
            let indexCount = 20
            let startIndex = blockTip.height - (indexCount * (Number(index) + 1))
            pageCount = Math.ceil(blockTip.height / 20)
            if (startIndex < 0 ) {
                indexCount += startIndex
                startIndex = 0
            }
            const dbblocks = await this.consensus.getBlocksRange(startIndex, indexCount)

            for (const dbblock of dbblocks) {
                const txs: ITxProp[] = []
                for (const tx of dbblock.txs) {
                    if (tx instanceof SignedTx) {
                        txs.push({
                            amount: hycontoString(tx.amount),
                            hash: new Hash(tx).toString(),
                            fee: hycontoString(tx.fee),
                            from: tx.from.toString(),
                            to: tx.to.toString(),
                        })
                    } else {
                        txs.push({
                            amount: hycontoString(tx.amount),
                            hash: new Hash(tx).toString(),
                            to: tx.to.toString(),
                        })
                    }
                }
                const hash = new Hash(dbblock.header)
                const webBlock = {
                    hash: hash.toString(),
                    difficulty: dbblock.header.difficulty,
                    height: await this.consensus.getBlockHeight(hash),
                    txs,
                    timeStamp: Number(dbblock.header.timeStamp),
                }
                if (dbblock.header instanceof BlockHeader) {
                    Object.assign(webBlock, {
                        prevBlock: dbblock.header.previousHash,
                        nonce: dbblock.header.nonce,
                    })
                }
                blockList.push(webBlock)
            }
        } catch (e) {
            logger.error(e)
        }
        return Promise.resolve({blocks: blockList, length: pageCount})
    }
    public async getLanguage(): Promise<string[]> {
        await Wallet.walletInit()
        let languages: string[] = []
        languages = await Wallet.getLang()
        return Promise.resolve(languages)
    }
    public async getMnemonic(lang: string): Promise<string> {
        await Wallet.walletInit()
        logger.debug(lang)
        return Wallet.getRandomMnemonic(lang)
    }
    public async getTx(hash: string): Promise<ITxProp | IResponseError> {
        try {
            const hyconBlockTx = await this.consensus.getTx(new Hash(Hash.decode(hash)))
            if (hyconBlockTx === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the transaction cannot be found",
                })
            }
            let tx: ITxProp
            if (hyconBlockTx.tx instanceof SignedTx) {
                tx = {
                    hash,
                    amount: hycontoString(hyconBlockTx.tx.amount),
                    fee: hycontoString(hyconBlockTx.tx.fee),
                    from: hyconBlockTx.tx.from.toString(),
                    to: hyconBlockTx.tx.to.toString(),
                }
            } else {
                tx = {
                    hash,
                    amount: hycontoString(hyconBlockTx.tx.amount),
                    to: hyconBlockTx.tx.to.toString(),
                }
            }
            return tx
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }
    public async getWalletDetail(name: string): Promise<IHyconWallet> {
        const mapHashTx: Map<Hash, SignedTx> = new Map<Hash, SignedTx>()
        await Wallet.walletInit()
        const addrOfWallet = new Address(await Wallet.getAddress(name))
        const n = 10
        try {
            const account = await this.consensus.getAccount(addrOfWallet)
            const txList = await this.consensus.getLastTxs(addrOfWallet, n)
            logger.debug(`Tx List = ${txList.length}`)
            const webTxs: ITxProp[] = []
            for (const tx of txList) {
                let webTx: ITxProp
                if (tx !== undefined) {
                    if (tx.tx instanceof SignedTx) {
                        webTx = {
                            hash: new Hash(tx.tx).toString(),
                            amount: hycontoString(tx.tx.amount),
                            fee: hycontoString(tx.tx.fee),
                            from: tx.tx.from.toString(),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                        }
                    }
                    // unsigned Txs are unlisted
                    webTxs.push(webTx)
                }
            }
            const hyconWallet: IHyconWallet = {
                name,
                address: addrOfWallet.toString(),
                balance: account ? hycontoString(account.balance) : "0",
                txs: webTxs,
            }
            return Promise.resolve(hyconWallet)
        } catch (e) {
            return Promise.reject("Error while getTxsOfAddress : " + e)
        }
    }

    public async getWalletList(): Promise<IHyconWallet[]> {
        try {
            await Wallet.walletInit()
            const walletList = new Array<IHyconWallet>()
            const walletArray = await Wallet.walletList()
            for (const wallet of walletArray) {
                const address = new Address(wallet.address)
                const name = wallet.name
                const account = await this.consensus.getAccount(address)
                const tmpHwallet: IHyconWallet = {
                    address: address.toString(),
                    name,
                    balance: account ? hycontoString(account.balance) : "0",
                }
                walletList.push(tmpHwallet)
            }
            return Promise.resolve(walletList)
        } catch (e) {
            return Promise.reject("Error get wallet list : " + e)
        }
    }

    public async recoverWallet(Hwallet: IHyconWallet): Promise<string | boolean> {
        await Wallet.walletInit()
        if (Hwallet.name !== undefined && Hwallet.password !== undefined && Hwallet.mnemonic !== undefined && Hwallet.language !== undefined && Hwallet.hint !== undefined) {
            const isValid = Wallet.validateMnemonic(Hwallet.mnemonic, Hwallet.language)
            if (isValid) {
                try {
                    const addressString = await Wallet.recoverWallet({ name: Hwallet.name, password: Hwallet.password, mnemonic: Hwallet.mnemonic, language: Hwallet.language, hint: Hwallet.hint })
                    return Promise.resolve(addressString)
                } catch (e) {
                    return Promise.resolve(false)
                }
            } else {
                return Promise.resolve(false)
            }
        } else {
            return Promise.resolve(false)
        }
    }

    public async sendTx(tx: { name: string, password: string, address: string, amount: number, minerFee: number }, queueTx?: Function): Promise<boolean> {
        tx.password === undefined ? tx.password = "" : tx.password = tx.password
        try {
            await Wallet.walletInit()
            const wallet = await Wallet.loadKeys(tx.name, tx.password)
            const address = new Address(tx.address)
            const account = await this.consensus.getAccount(wallet.pubKey.address())
            logger.warn(`Account Balance: ${account.balance}`)
            logger.warn(`TX Amount: ${tx.amount}`)
            logger.warn(`TX Miner Fee: ${tx.minerFee}`)
            const amt = parseInt(tx.amount.toString(), 10) + parseInt(tx.minerFee.toString(), 10)
            logger.warn(`TX Total: ${amt}`)
            if (hyconfromString(amt.toString()).greaterThan(account.balance)) {
                throw new Error("insufficient wallet balance to send transaction")
            }
            const signedTx = wallet.send(address, hyconfromString(tx.amount.toString()), account.nonce + 1, hyconfromString(tx.minerFee.toString()))
            if (queueTx) { queueTx(signedTx) } else { return Promise.reject(false) }
            return Promise.resolve(true)
        } catch (e) {
            logger.warn(e)
            return Promise.resolve(false)
        }
    }

    public getPendingTxs(arr: SignedTx[]): Promise<ITxProp[]> {
        if (arr.length === 0 || arr === null || arr === undefined) { return Promise.resolve([]) } else {
            const out = []
            for (const tx of arr) {
                out.push({
                    hash: new Hash(tx).toHex(),
                    amount: hycontoString(tx.amount),
                    fee: hycontoString(tx.fee),
                    from: tx.from.toString(),
                    to: tx.to.toString(),
                    signature: tx.signature.toString("hex"),
                })
            }
            return Promise.resolve(out)
        }
    }
}
