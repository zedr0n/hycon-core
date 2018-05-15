import * as jwt from "jsonwebtoken"
import { getLogger } from "log4js"
import * as Long from "long"
import { Address } from "../../common/address"
import { Tx } from "../../common/tx"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import { hyconfromString, hycontoString } from "../../util/commonUtil"
import { Hash } from "../../util/hash"
import { Wallet } from "../../wallet/wallet"
import { IHyconWallet, IPeer, IResponseError, IRest, ITxProp, IUser, IWalletAddress } from "../client/rest"
const logger = getLogger("RestServer")

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
            if (account.balance.lessThan(total)) {
                throw new Error("insufficient wallet balance to send transaction")
            }
            const signedTx = wallet.send(address, hyconfromString(tx.amount), account.nonce + 1, hyconfromString(tx.fee))
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
                    if (tx instanceof SignedTx) {
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
            return Promise.resolve<IWalletAddress>({
                hash: address,
                balance: account ? account.balance.toInt() : 0,
                txs: webTxs,
            })

        } catch (e) {
            return Promise.reject(e)
        }
    }
}
