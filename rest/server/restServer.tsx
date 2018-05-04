// import GoogleMap from "google-map-react"
import * as jwt from "jsonwebtoken"
import { getLogger } from "log4js"
import * as Long from "long"
import { Address } from "../../src/common/address"
import { GenesisBlock } from "../../src/common/blockGenesis"
import { BlockHeader } from "../../src/common/blockHeader"
import { GenesisBlockHeader } from "../../src/common/genesisHeader"
import { Tx } from "../../src/common/tx"
import { SignedTx } from "../../src/common/txSigned"
import { Account } from "../../src/consensus/database/account"
import { Database } from "../../src/consensus/database/database"
import { DBBlock } from "../../src/consensus/database/dbblock"
import { DBTx } from "../../src/consensus/database/dbTx"
import { WorldState } from "../../src/consensus/database/worldState"
// import { PeerList } from "../../src/network/peerList"
import { Hash } from "../../src/util/hash"
import { Wallet } from "../../src/wallet/wallet"
import { IBlock, IHyconWallet, ILocationDetails, IPeer, IResponseError, IRest, ITxProp, IUser, IWalletAddress } from "../client/rest"
const logger = getLogger("RestServer")
// const googleMapsClient = require("@google/maps").createClient({
    // key: "AIzaSyAp-2W8_T6dZjq71yOhxW1kRkbY6E1iyuk",
// })

// tslint:disable:object-literal-sort-keys
// tslint:disable:ban-types
// tslint:disable:no-bitwise
export class RestServer implements IRest {

    private db: Database
    private accountDB: WorldState
    private peerList: PeerList
    constructor(db: Database, accountDB: WorldState, peerList: PeerList) {
        this.db = db
        this.accountDB = accountDB
        this.peerList = peerList
    }

    public setIsHyconWallet(isHyconWallet: boolean): void { }
    public hyconWalletListener(callback: (isHyconWallet: boolean) => void): void {
        callback(false)
    }
    public loadingListener(callback: (loading: boolean) => void): void {
        callback(false)
    }
    public setLoading(loading: boolean): void { }

    public async apiLogin(user: IUser): Promise<string> {
        try {
            const token = jwt.sign({ user }, "secretkey")
            return Promise.resolve(token)
        } catch (e) {
            return Promise.reject(e)
        }
    }

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

    public async getWalletBalance(address: string): Promise<{ balance: number } | IResponseError> {
        try {
            const addressOfWallet = new Address(address)
            const account = await this.accountDB.getAccount(this.db.tips[0].header.stateRoot, addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            } else {
                return Promise.resolve({
                    balance: account ? account.balance : 0,
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
            const account = await this.accountDB.getAccount(this.db.tips[0].header.stateRoot, addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            const n = 10
            // TODO: Conditional for nonce can go here after it's implemented for wallet
            const dbTxs = await this.db.getTxsOfAddress(addressOfWallet, n)
            const txList: ITxProp[] = []
            for (const dbTx of dbTxs.dbTxs) {
                const tx = dbTxs.map.get(dbTx.hash.toString())
                let webTx: ITxProp
                if (tx !== undefined) {
                    if (tx.tx instanceof SignedTx) {
                        webTx = {
                            hash: dbTx.hash.toString(),
                            amount: Number(tx.tx.amount),
                            fee: Number(tx.tx.fee),
                            from: tx.tx.from.toString(),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                            timeStamp: tx.timeStamp,
                        }
                    } else {
                        webTx = {
                            hash: dbTx.hash.toString(),
                            amount: Number(tx.tx.amount),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                            timeStamp: tx.timeStamp,
                        }
                    }
                    txList.push(webTx)
                }
            }
            return Promise.resolve({
                txs: txList,
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

    public async outgoingSignedTx(tx: { privateKey: string, from: string, to: string, amount: number, fee: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        try {
            const address = new Address(tx.to)
            const wallet = new Wallet(Buffer.from(tx.privateKey))
            // TODO: Check balance
            const signedTx = wallet.send(address, tx.amount, 0, tx.fee)
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

    public async outgoingTx(tx: { signature: string, from: string, to: string, amount: number, fee: number, nonce: number, recovery: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError> {
        try {
            const address = new Tx({
                from: new Address(tx.from),
                to: new Address(tx.to),
                amount: tx.amount,
                fee: tx.fee,
                nonce: tx.nonce,
            })

            let signedTx = new SignedTx(address, Buffer.from(tx.signature), 0)
            if (!signedTx.verify()) {
                signedTx = new SignedTx(address, Buffer.from(tx.signature), 1)
                if (!signedTx.verify()) {
                    throw new Error("transaction information or signature is incorrect")
                }
            }
            // TODO: Check balance
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
            const hyconBlockTx = await this.db.getTxTime(new Hash(Hash.decode(hash)))
            let tx: ITxProp
            if (hyconBlockTx.tx instanceof SignedTx) {
                tx = {
                    hash,
                    amount: Number(hyconBlockTx.tx.amount),
                    fee: Number(hyconBlockTx.tx.fee),
                    from: hyconBlockTx.tx.from.toString(),
                    to: hyconBlockTx.tx.to.toString(),
                    timeStamp: hyconBlockTx.timeStamp,
                }
            } else {
                tx = {
                    hash,
                    amount: Number(hyconBlockTx.tx.amount),
                    to: hyconBlockTx.tx.to.toString(),
                    timeStamp: hyconBlockTx.timeStamp,
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
            const account = await this.accountDB.getAccount(this.db.tips[0].header.stateRoot, addressOfWallet)
            const dbTxs = await this.db.getTxsOfAddress(addressOfWallet, n)
            const txList: ITxProp[] = []
            for (const dbTx of dbTxs.dbTxs) {
                const tx = dbTxs.map.get(dbTx.hash.toString())
                let webTx: ITxProp
                if (tx !== undefined) {
                    if (tx.tx instanceof SignedTx) {
                        webTx = {
                            hash: dbTx.hash.toString(),
                            amount: Number(tx.tx.amount),
                            fee: Number(tx.tx.fee),
                            from: tx.tx.from.toString(),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                            timeStamp: tx.timeStamp,
                        }
                    } else {
                        webTx = {
                            hash: dbTx.hash.toString(),
                            amount: Number(tx.tx.amount),
                            to: tx.tx.to.toString(),
                            signature: tx.tx.signature.toString(),
                            timeStamp: tx.timeStamp,
                        }
                    }
                    txList.push(webTx)
                }
            }
            return Promise.resolve<IWalletAddress>({
                hash: address,
                balance: account ? account.balance : 0,
                txs: txList,
            })

        } catch (e) {
            return Promise.reject(e)
        }
    }
}
