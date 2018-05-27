import { getLogger } from "log4js"
import { TxValidity } from "../consensus/database/worldState"
import { NewTx } from "../serialization/proto"
import { Server } from "../server"
import { hyconfromString } from "../util/commonUtil"
import { Hash } from "../util/hash"
import { Address } from "./address"
import { ITxPool } from "./itxPool"
import { SignedTx } from "./txSigned"
// tslint:disable-next-line:no-var-requires
const assert = require("assert")
const logger = getLogger("AppTxPool")
interface ITxCallback {
    callback: (txs: SignedTx[]) => void,
    n: number
}
export class TxPool implements ITxPool {
    private server: Server

    private addresses: Array<{ address: string, fee: Long }>
    private txsMap: Map<string, SignedTx[]>

    private callbacks: ITxCallback[]
    private minFee: number

    constructor(server: Server, minFee?: number) {
        this.server = server
        this.addresses = []
        this.callbacks = []
        this.minFee = minFee === undefined ? 0 : minFee
        this.txsMap = new Map<string, SignedTx[]>()
    }

    public async putTxs(newTxsOriginal: SignedTx[]): Promise<number> {
        let newTxsCount: number = 0
        let lowestIndex
        // drop it, if we already has it
        for (const oneTx of newTxsOriginal) {
            const isValid = await this.server.consensus.txValidity(oneTx)
            if (isValid === TxValidity.Invalid) {
                logger.error(`Invalid Tx : ${new Hash(oneTx).toString()}`)
                continue
            }
            const fromString = oneTx.from.toString()
            const txs = this.txsMap.get(fromString)
            if (txs !== undefined) {
                for (let i = 0; i < txs.length; i++) {
                    const tx = txs[i]
                    if (oneTx.nonce === tx.nonce) {
                        // Should using another map for check existed Tx???
                        if (!tx.equals(oneTx)) {
                            if (oneTx.fee.greaterThan(tx.fee)) {
                                txs[txs.indexOf(tx)] = oneTx
                                newTxsCount++
                            }
                        }
                        break
                    }
                    if (oneTx.nonce < tx.nonce) {
                        txs.splice(i, 0, oneTx)
                        newTxsCount++
                        break
                    }
                    if (i === txs.length - 1) {
                        txs.push(oneTx)
                        newTxsCount++
                    }
                }
            } else {
                this.txsMap.set(fromString, [oneTx])
                newTxsCount++
            }
            if (isValid === TxValidity.Valid && txs[0].equals(oneTx)) {
                const index = this.setAddresses(fromString, oneTx)
                lowestIndex ? (index > lowestIndex ? lowestIndex = index : lowestIndex++) : lowestIndex = index
            }
        }
        // notify
        this.callback(lowestIndex)
        return newTxsCount
    }

    public removeTxs(old: SignedTx[], maxReturn?: number): SignedTx[] {
        this.remove(old.slice(0, old.length))
        return this.getTxs().slice(0, maxReturn)
    }

    public onTopTxChanges(n: number, callback: (txs: SignedTx[]) => void): void {
        this.callbacks.push({ callback, n })
    }

    public getPending(index: number, count: number): { txs: SignedTx[], length: number, totalAmount: Long, totalFee: Long } {
        const txs = this.getTxs().slice()
        let totalAmount = hyconfromString("0")
        let totalFee = hyconfromString("0")
        for (const tx of txs) {
            totalAmount = totalAmount.add(tx.amount)
            totalFee = totalFee.add(tx.fee)
        }
        let final = index + count
        final > txs.length ? final = txs.length : final = final
        return { txs: txs.slice(index, final), length: txs.length, totalAmount, totalFee }
    }

    public getTxs(): SignedTx[] {
        const getTxsResult = []
        const addresses = this.addresses.slice()
        const mapIndex: Map<string, number> = new Map<string, number>()
        let address = addresses.pop()
        while (address) {
            let index = mapIndex.get(address.address)
            if (index === undefined) { index = 0 } else { index++ }
            const txs = this.txsMap.get(address.address)
            if (txs === undefined || txs.length === 0 || index >= txs.length) { throw new Error(`TX Pool error while getTxs, resetting TX Pool`) }
            mapIndex.set(address.address, index)
            getTxsResult.push(txs[index])
            index += 1
            if (index < txs.length) { this.setAddresses(address.address, txs[index], addresses) }
            address = addresses.pop()
        }
        return getTxsResult
    }

    // TODO : Return nonce of last tx and remove function that send restrict realated with nonce.
    // nonce를 설정해줘야함 따로.
    public isExist(address: Address): boolean {
        let isExist = false
        const txs = this.txsMap.get(address.toString())
        if (txs !== undefined && txs.length > 0) { isExist = true }
        return isExist
    }

    public getTxsOfAddress(address: Address): SignedTx[] {
        return this.txsMap.get(address.toString())
    }

    private setAddresses(address: string, tx: SignedTx, addressArray?: Array<{ address: string, fee: Long }>): number {
        let addresses
        addressArray ? addresses = addressArray : addresses = this.addresses
        const addressFee = { address, fee: tx.fee }
        let isInsert = false
        let index
        for (let i = 0; i < addresses.length; i++) {
            if (tx.fee.greaterThan(addresses[i].fee)) {
                addresses.splice(i, 0, addressFee)
                index = i
                isInsert = true
            }
        }
        if (!isInsert) {
            addresses.push(addressFee)
            index = addresses.length - 1
        }
        return index
    }

    private remove(txsOriginal: SignedTx[]) {
        for (const txOriginal of txsOriginal) {
            const fromAddress = txOriginal.from.toString()
            const txsOfAddress = this.txsMap.get(fromAddress)
            if (txsOfAddress !== undefined) {
                if (txsOfAddress[0].nonce < txOriginal.nonce) { throw new Error(`Previous transaction is exist in txPool yet.`) }
                if (txsOfAddress[0].nonce === txOriginal.nonce) { txsOfAddress.pop() }
                if (txsOfAddress.length === 0) {
                    this.txsMap.delete(fromAddress)
                } else { this.setAddresses(fromAddress, txsOfAddress[0]) }
            }
        }
    }

    private callback(lowestIndex: number): void {
        const n = lowestIndex + 1
        for (const callback of this.callbacks) {
            if (callback.n >= n) {
                setImmediate(callback.callback, this.getTxs().slice(0, callback.n))
            }
        }
    }

}
