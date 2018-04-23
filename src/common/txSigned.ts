import { getLogger } from "log4js"
import * as Long from "long"
import { Address } from "../common/address"
import { PublicKey } from "../common/publicKey"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"
import { Tx } from "./tx"
export class SignedTx implements proto.ITx {
    public static decode(data: Uint8Array): SignedTx {
        const stx = proto.Tx.decode(data)
        return new SignedTx(stx)
    }
    public from: Address
    public to: Address
    public amount: number
    public fee: number
    public nonce: number
    public signature: Buffer
    public recovery: number

    constructor(tx?: proto.ITx, signature?: Uint8Array, recovery?: number) {
        if (tx) {
            if (signature !== undefined) {
                if (tx.signature === undefined) {
                    tx.signature = signature
                } else { throw new Error("Two signature information exists.") }
            }
            if (recovery !== undefined) {
                if (tx.recovery === undefined) {
                    tx.recovery = recovery
                } else { throw new Error("Two recovery information exists.") }
            }
            this.set(tx)
        }
    }

    public unsignedHash(): Hash {
        return new Hash(new Tx(this))
    }

    public set(stx: proto.ITx): void {
        if (stx.from === undefined) { throw (new Error("from address not defined in input")) }
        if (stx.to === undefined) { throw (new Error("to address not defined in input")) }
        if (stx.amount === undefined) { throw (new Error("amount not defined in input")) }
        if (stx.fee === undefined) { throw (new Error("fee not defined in input")) }
        if (stx.nonce === undefined) { throw (new Error("nonce not defined in input")) }
        if (stx.signature === undefined) { throw (new Error("signature not defined in input")) }
        if (stx.recovery === undefined) { throw (new Error("recovery not defined in input")) }

        this.from = new Address(stx.from)
        this.to = new Address(stx.to)
        this.amount = stx.amount instanceof Long ? stx.amount.toInt() : stx.amount
        this.fee = stx.fee instanceof Long ? stx.fee.toInt() : stx.fee
        this.nonce = stx.nonce
        this.signature = new Buffer(stx.signature)
        this.recovery = stx.recovery
    }

    public verify(): boolean {
        const pubkey = new PublicKey(this)
        return pubkey.verify(this)
    }

    public equals(tx: SignedTx): boolean {
        if (this.amount !== tx.amount) {
            return false
        }
        if (this.fee !== tx.fee) {
            return false
        }
        if (this.nonce !== tx.nonce) {
            return false
        }
        if (this.recovery !== tx.recovery) {
            return false
        }
        if (!this.to.equals(tx.to)) {
            return false
        }
        if (!this.from.equals(tx.from)) {
            return false
        }
        if (!this.signature.equals(tx.signature)) {
            return false
        }
        return true
    }

    public encode(): Uint8Array {
        return proto.Tx.encode(this).finish()
    }
}
