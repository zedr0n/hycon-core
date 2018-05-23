import { getLogger } from "log4js"
import * as Long from "long"
import { Address } from "../../common/address"
import { BlockHeader } from "../../common/blockHeader"
import { ITxPool } from "../../common/itxPool"
import { Tx } from "../../common/tx"
import { SignedTx } from "../../common/txSigned"
import { IConsensus } from "../../consensus/iconsensus"
import { INetwork } from "../../network/inetwork"
import * as proto from "../../serialization/proto"
import { hyconfromString, hycontoString, zeroPad } from "../../util/commonUtil"
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
    private txPool: ITxPool
    private network: INetwork

    constructor(consensus: IConsensus, network: INetwork, txPool: ITxPool) {
        this.consensus = consensus
        this.network = network
        this.txPool = txPool
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
            const results = await this.consensus.getLastTxs(addressOfWallet, n)
            const webTxs: ITxProp[] = []
            for (const result of results) {
                let webTx: ITxProp
                if (result.txList.tx instanceof SignedTx && result.txList.tx.nonce >= nonce) {
                    webTx = {
                        hash: result.txList.tx.unsignedHash().toString(),
                        amount: hycontoString(result.txList.tx.amount),
                        fee: hycontoString(result.txList.tx.fee),
                        from: result.txList.tx.from.toString(),
                        to: result.txList.tx.to.toString(),
                        signature: result.txList.tx.signature.toString(),
                        estimated: hycontoString(result.txList.tx.amount.add(result.txList.tx.fee)),
                        receiveTime: result.timestamp,
                    }
                }
                // unsigned Txs are unlisted
                webTxs.push(webTx)
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
            await wallet.save(Hwallet.name, Hwallet.password, Hwallet.hint)
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
            const results = await this.consensus.getLastTxs(addressOfWallet, n)
            const webTxs: ITxProp[] = []
            for (const result of results) {
                let webTx: ITxProp
                if (result.txList.tx instanceof SignedTx) {
                    webTx = {
                        hash: result.txList.tx.unsignedHash().toString(),
                        amount: hycontoString(result.txList.tx.amount),
                        fee: hycontoString(result.txList.tx.fee),
                        from: result.txList.tx.from.toString(),
                        to: result.txList.tx.to.toString(),
                        signature: result.txList.tx.signature.toString(),
                        estimated: hycontoString(result.txList.tx.amount.add(result.txList.tx.fee)),
                        receiveTime: result.timestamp,
                    }
                    // unsigned Txs are unlisted
                } else {
                    webTx = {
                        hash: result.txList.tx.unsignedHash().toString(),
                        amount: hycontoString(result.txList.tx.amount),
                        to: result.txList.tx.to.toString(),
                        signature: result.txList.tx.signature.toString(),
                        estimated: hycontoString(result.txList.tx.amount),
                        receiveTime: result.timestamp,
                    }
                }
                webTxs.push(webTx)
            }
            return Promise.resolve<IWalletAddress>({
                hash: address,
                balance: account ? hycontoString(account.balance) : "0.0",
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
                        estimated: hycontoString(hyconTx.amount.add(hyconTx.fee)),
                        receiveTime: hyconBlock.header.timeStamp,
                    })
                } else {
                    txs.push({
                        amount: hycontoString(hyconTx.amount),
                        hash: new Hash(hyconTx).toString(),
                        to: hyconTx.to.toString(),
                        estimated: hycontoString(hyconTx.amount),
                        receiveTime: hyconBlock.header.timeStamp,
                    })
                }
            }

            const webBlock = {
                hash,
                difficulty: hyconBlock.header.difficulty,
                stateRoot: hyconBlock.header.stateRoot.toString(),
                merkleRoot: hyconBlock.header.merkleRoot.toString(),
                txs,
                height: await this.consensus.getBlockHeight(Hash.decode(hash)),
                timeStamp: Number(hyconBlock.header.timeStamp),

            }
            if (hyconBlock.header instanceof BlockHeader) {
                Object.assign(webBlock, {
                    prevBlock: hyconBlock.header.previousHash.toString(),
                    nonce: zeroPad(hyconBlock.header.nonce.low.toString(16), 8) + zeroPad(hyconBlock.header.nonce.high.toString(16), 8),
                    miner: hyconBlock.header.miner.toString(),
                })

                const buffer = Buffer.allocUnsafe(72)
                buffer.fill(hyconBlock.header.preHash(), 0, 64)
                buffer.writeUInt32LE(hyconBlock.header.nonce.getLowBitsUnsigned(), 64)
                buffer.writeUInt32LE(hyconBlock.header.nonce.getHighBitsUnsigned(), 68)
                const result = await Hash.hashCryptonight(buffer)

                Object.assign(webBlock, {
                    resultHash: Buffer.from(result.buffer).toString("hex"),
                })
            }

            return Promise.resolve(webBlock)
        } catch (e) {
            return Promise.reject("Error while getting block information from server : " + e)
        }
    }
    public async getBlockList(index: number): Promise<{ blocks: IBlock[], length: number }> {
        const blockList: IBlock[] = []
        let pageCount: number = 0
        try {
            const blockTip = await this.consensus.getBlocksTip()
            let indexCount = 20
            let startIndex = blockTip.height - (indexCount * (Number(index) + 1)) + 1
            pageCount = Math.ceil(blockTip.height / 20)
            if (startIndex < 0) {
                indexCount += startIndex
                startIndex = 0
            }
            const dbblocks = await this.consensus.getBlocksRange(startIndex, indexCount)

            for (const dbblock of dbblocks) {
                const txs: ITxProp[] = []
                const size = dbblock.encode().byteLength
                for (const tx of dbblock.txs) {
                    if (tx instanceof SignedTx) {
                        txs.push({
                            amount: hycontoString(tx.amount),
                            hash: new Hash(tx).toString(),
                            fee: hycontoString(tx.fee),
                            from: tx.from.toString(),
                            to: tx.to.toString(),
                            estimated: hycontoString(tx.amount.add(tx.fee)),
                        })
                    } else {
                        txs.push({
                            amount: hycontoString(tx.amount),
                            hash: new Hash(tx).toString(),
                            to: tx.to.toString(),
                            estimated: hycontoString(tx.amount),
                        })
                    }
                }
                const hash = new Hash(dbblock.header)
                const webBlock = {
                    hash: hash.toString(),
                    difficulty: dbblock.header.difficulty,
                    height: await this.consensus.getBlockHeight(hash),
                    size,
                    txs,
                    timeStamp: Number(dbblock.header.timeStamp),
                }
                if (dbblock.header instanceof BlockHeader) {
                    Object.assign(webBlock, {
                        prevBlock: dbblock.header.previousHash,
                        nonce: zeroPad(dbblock.header.nonce.low.toString(16), 8) + zeroPad(dbblock.header.nonce.high.toString(16), 8),
                        miner: dbblock.header.miner.toString(),
                    })
                }
                blockList.push(webBlock)
            }
        } catch (e) {
            logger.error(e)
        }
        return Promise.resolve({ blocks: blockList, length: pageCount })
    }
    public async getMnemonic(lang: string): Promise<string> {
        await Wallet.walletInit()
        logger.debug(lang)
        return Wallet.getRandomMnemonic(lang)
    }
    public async getTx(hash: string): Promise<ITxProp | IResponseError> {
        try {
            const getTxResult = await this.consensus.getTx(new Hash(Hash.decode(hash)))
            const hyconBlockTx = getTxResult.tx
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
                    blockHash: hyconBlockTx.blockHash.toString(),
                    receiveTime: getTxResult.timestamp,
                    estimated: hycontoString(hyconBlockTx.tx.amount.add(hyconBlockTx.tx.fee)),
                    confirmation: getTxResult.confirmation,
                }
            } else {
                tx = {
                    hash,
                    amount: hycontoString(hyconBlockTx.tx.amount),
                    fee: "0.0",
                    to: hyconBlockTx.tx.to.toString(),
                    blockHash: hyconBlockTx.blockHash.toString(),
                    receiveTime: getTxResult.timestamp,
                    estimated: hycontoString(hyconBlockTx.tx.amount),
                    confirmation: getTxResult.confirmation,
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
            const results = await this.consensus.getLastTxs(addrOfWallet, n)
            logger.debug(`getLastTxs result = ${results.length}`)
            const webTxs: ITxProp[] = []
            for (const result of results) {
                let webTx: ITxProp
                if (result.txList.tx instanceof SignedTx) {
                    webTx = {
                        hash: new Hash(result.txList.tx).toString(),
                        amount: hycontoString(result.txList.tx.amount),
                        fee: hycontoString(result.txList.tx.fee),
                        from: result.txList.tx.from.toString(),
                        to: result.txList.tx.to.toString(),
                        signature: result.txList.tx.signature.toString(),
                        blockHash: result.txList.blockHash.toString(),
                        estimated: hycontoString(result.txList.tx.amount.add(result.txList.tx.fee)),
                        receiveTime: result.timestamp,
                    }
                } else {
                    webTx = {
                        hash: new Hash(result.txList.tx).toString(),
                        amount: hycontoString(result.txList.tx.amount),
                        to: result.txList.tx.to.toString(),
                        signature: result.txList.tx.signature.toString(),
                        estimated: hycontoString(result.txList.tx.amount),
                        receiveTime: result.timestamp,
                    }
                }
                // unsigned Txs are unlisted
                webTxs.push(webTx)
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
            const amt = hyconfromString(tx.amount.toString()).add(hyconfromString(tx.minerFee.toString()))
            logger.warn(`TX Total: ${hycontoString(amt)}`)
            if (amt.greaterThan(account.balance)) {
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

    public getPendingTxs(index: number): Promise<{ txs: ITxProp[], length: number, totalCount: number, totalAmount: string, totalFee: string }> {
        let pageCount: number = 0
        const cntPerPage: number = 10
        const startIndex = cntPerPage * index
        const txPoolTxs = this.txPool.getPending(startIndex, cntPerPage)
        pageCount = Math.ceil(txPoolTxs.length / cntPerPage)
        const txList: ITxProp[] = []
        for (const tx of txPoolTxs.txs) {
            txList.push({
                hash: new Hash(tx).toString(),
                amount: hycontoString(tx.amount),
                fee: hycontoString(tx.fee),
                from: tx.from.toString(),
                to: tx.to.toString(),
                signature: tx.signature.toString("hex"),
                estimated: hycontoString(tx.amount.add(tx.fee)),
            })
        }
        return Promise.resolve({ txs: txList, length: pageCount, totalCount: txPoolTxs.length, totalAmount: hycontoString(txPoolTxs.totalAmount), totalFee: hycontoString(txPoolTxs.totalFee) })
    }

    public async getPeerList(): Promise<IPeer[]> {
        const peerList: IPeer[] = []
        const peers: proto.IPeer[] = await this.network.getConnections()
        for (const peer of peers) {
            const temp: IPeer = {
                host: peer.host,
                port: peer.port,
                lastSeen: peer.lastSeen,
                failCount: peer.failCount,
                lastAttempt: peer.lastAttempt,
                location: undefined,
                latitude: undefined,
                longitude: undefined,
            }
            peerList.push(temp)
        }
        return peerList
    }

    public getHint(name: string): Promise<string> {
        return Wallet.getHint(name)
    }

    public async getNextTxs(address: string, txHash: string): Promise<ITxProp[]> {
        const cntPerPage: number = 10
        const nextTxs = await this.consensus.getNextTxs(new Address(address), Hash.decode(txHash), cntPerPage)
        const txList: ITxProp[] = []
        for (const next of nextTxs) {
            const tx = next.txList.tx
            const txProp: ITxProp = {
                hash: new Hash(tx).toString(),
                amount: hycontoString(tx.amount),
                to: tx.to.toString(),
                signature: tx.signature.toString("hex"),
                estimated: hycontoString(tx.amount),
                receiveTime: next.timestamp,
            }
            if (tx instanceof SignedTx) {
                Object.assign(txProp, {
                    fee: hycontoString(tx.fee),
                    from: tx.from.toString(),
                })
            }
            txList.push(txProp)
        }
        return txList
    }
}
