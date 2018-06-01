import { getLogger } from "log4js"
import Long = require("long")
import { hyconfromString, hycontoString } from "../api/client/stringUtil"
import { TxValidity } from "../consensus/database/worldState"
import { NewTx } from "../serialization/proto"
import { Server } from "../server"
import { Hash } from "../util/hash"
import { Address } from "./address"
import { AsyncLock } from "./asyncLock"
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
    private minFee: Long
    private lock: AsyncLock

    constructor(server: Server, minFee?: Long) {
        this.server = server
        this.addresses = []
        this.callbacks = []
        this.minFee = minFee === undefined ? hyconfromString("0.000000001") : minFee
        this.txsMap = new Map<string, SignedTx[]>()
    }

    public async putTxs(newTxsOriginal: SignedTx[]): Promise<number> {
        const filteredTxs: Array<{ tx: SignedTx, valid: TxValidity }> = []
        for (const tx of newTxsOriginal) {
            if (tx.fee.lessThan(this.minFee.toUnsigned())) {
                logger.debug(`Less than Min fee in txPool`)
                continue
            }
            const isValid = await this.server.consensus.txValidity(tx)
            if (isValid === TxValidity.Invalid) {
                logger.debug(`Invalid Tx : ${new Hash(tx).toString()}`)
                continue
            }
            filteredTxs.push({ tx, valid: isValid })
        }
        let newTxsCount: number = 0
        // drop it, if we already has it
        for (const { tx, valid } of filteredTxs) {
            let isExist = false
            const fromString = tx.from.toString()
            let txs = this.txsMap.get(fromString)
            if (txs !== undefined) {
                for (let i = 0; i < txs.length; i++) {
                    const txInMap = txs[i]
                    if (tx.nonce === txInMap.nonce) {
                        if (!txInMap.equals(tx)) {
                            if (tx.fee.greaterThan(txInMap.fee)) {
                                if (valid === TxValidity.Valid) {
                                    this.removeFromAddresses(txInMap.from)
                                }
                                txs.splice(i, 1, tx)
                                newTxsCount++
                            }
                        } else {
                            isExist = true
                            continue
                        }
                        break
                    }
                    if (tx.nonce < txInMap.nonce) {
                        txs.splice(i, 0, tx)
                        newTxsCount++
                        break
                    }
                    if (i === txs.length - 1) {
                        txs.push(tx)
                        newTxsCount++
                        break
                    }
                }
            } else {
                txs = [tx]
                this.txsMap.set(fromString, txs)
                newTxsCount++
            }
            if (!isExist) {
                if (valid === TxValidity.Valid && txs[0].equals(tx)) {
                    this.setAddresses(fromString, tx)
                }
            }
        }
        return newTxsCount
    }

    public removeTxs(old: SignedTx[], maxReturn?: number): SignedTx[] {
        this.remove(old.slice(0, old.length))
        return this.getTxs().slice(0, maxReturn)
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
        const txsMap = this.txsMap
        const mapIndex: Map<string, number> = new Map<string, number>()
        for (const address of addresses) {
            let index = mapIndex.get(address.address)
            if (index === undefined) { index = 0 } else { index++ }
            const txs = txsMap.get(address.address)
            if (txs === undefined || txs.length === 0 || index >= txs.length) { throw new Error(`TX Pool error while getTxs, resetting TX Pool`) }
            mapIndex.set(address.address, index)
            getTxsResult.push(txs[index])
            index += 1
            if (index < txs.length) { this.setAddresses(address.address, txs[index], addresses) }
        }
        return getTxsResult
    }

    public isExist(address: Address): { isExist: boolean, totalAmount?: Long, lastNonce?: number } {
        let isExist = false
        let lastNonce: number | undefined
        let totalAmount = Long.fromString("0", true)
        const txs = this.txsMap.get(address.toString())
        if (txs !== undefined && txs.length > 0) {
            isExist = true
            for (const tx of txs) {
                totalAmount = totalAmount.add(tx.amount).add(tx.fee)
            }
            lastNonce = txs[txs.length - 1].nonce
        }
        return { isExist, totalAmount, lastNonce }
    }

    public getTxsOfAddress(address: Address): SignedTx[] | undefined {
        return this.txsMap.get(address.toString())
    }

    private setAddresses(address: string, tx: SignedTx, addressArray?: Array<{ address: string, fee: Long }>): void {
        let addresses
        addressArray ? addresses = addressArray : addresses = this.addresses
        const addressFee = { address, fee: tx.fee }
        let isInsert = false
        for (let i = 0; i < addresses.length; i++) {
            if (tx.fee.greaterThan(addresses[i].fee)) {
                addresses.splice(i, 0, addressFee)
                isInsert = true
                break
            }
        }
        if (!isInsert) {
            addresses.push(addressFee)
        }
    }

    private remove(txsOriginal: SignedTx[]) {
        for (const txOriginal of txsOriginal) {
            const fromAddress = txOriginal.from.toString()
            const txsOfAddress = this.txsMap.get(fromAddress)
            if (txsOfAddress === undefined) {
                continue
            }
            while (txsOfAddress.length > 0 && txsOfAddress[0].nonce <= txOriginal.nonce) {
                this.removeFromAddresses(txsOfAddress[0].from)
                txsOfAddress.splice(0, 1)
            }
            if (txsOfAddress.length === 0) {
                this.txsMap.delete(fromAddress)
                continue
            }

            if (txsOfAddress[0].nonce === txOriginal.nonce + 1) {
                this.setAddresses(fromAddress, txsOfAddress[0])
            }
        }
    }

    private removeFromAddresses(address: Address) {
        const stringAddress = address.toString()
        for (let i = 0; i < this.addresses.length; i++) {
            if (this.addresses[i].address === stringAddress) {
                this.addresses.splice(i, 1)
                break
            }
        }
    }

}
