import * as Long from "long"
import * as proto from "../serialization/proto"

import { getLogger } from "log4js"
import { Address } from "../common/address"
import { PublicKey } from "../common/publicKey"
import { Hash } from "../util/hash"
const logger = getLogger("Tx")
// tslint:disable:member-access
// tslint:disable:max-classes-per-file
export class Tx implements proto.ITx {
    public from !: Address
    public to !: Address
    public amount !: number
    public fee !: number
    public nonce !: number

    constructor(tx?: proto.ITx) {
        if (tx) { this.set(tx) }
    }

    public set(tx: proto.ITx) {
        if (tx.from === undefined) { throw (new Error("from address not defined in input")) }
        if (tx.to === undefined) { throw (new Error("to address not defined in input")) }
        if (tx.amount === undefined) { throw (new Error("amount not defined in input")) }
        if (tx.fee === undefined) { throw (new Error("fee not defined in input")) }
        if (tx.nonce === undefined) { throw (new Error("nonce not defined in input")) }

        this.from = new Address(tx.from)
        this.to = new Address(tx.to)
        this.amount = tx.amount instanceof Long ? tx.amount.toInt() : tx.amount
        this.fee = tx.fee instanceof Long ? tx.fee.toInt() : tx.fee
        this.nonce = tx.nonce
    }

    public equals(tx: Tx): boolean {
        if (!this.to.equals(tx.to)) { return false }
        if (!this.from.equals(tx.from)) { return false }
        if (this.amount !== tx.amount) { return false }
        if (this.fee !== tx.fee) { return false }
        if (this.nonce !== tx.nonce) { return false }
        return true
    }

    public encode(): Uint8Array {
        return proto.Tx.encode(this).finish()
    }
}

export class SignedTx implements proto.ITx {
    public static decode(data: Uint8Array): SignedTx {
        const stx = proto.Tx.decode(data)
        return new SignedTx(stx)
    }
    public from !: Address
    public to !: Address
    public amount !: number
    public fee !: number
    public nonce !: number
    public signature !: Uint8Array
    public recovery !: number

    constructor()
    // tslint:disable-next-line:unified-signatures
    constructor(tx: proto.ITx)
    constructor(tx: proto.ITx, signature: Uint8Array, recovery: number)
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
        this.signature = stx.signature
        this.recovery = stx.recovery
    }

    public verify(): boolean {
        const pubkey = new PublicKey(this)
        return pubkey.verify(this)
    }

    public equals(tx: SignedTx): boolean {
        if (!this.to.equals(tx.to)) { return false }
        if (!this.from.equals(tx.from)) { return false }
        if (this.amount !== tx.amount) { return false }
        if (this.fee !== tx.fee) { return false }
        if (this.nonce !== tx.nonce) { return false }
        if (this.signature !== undefined && !(new Buffer(this.signature).equals(new Buffer(tx.signature)))) {
            logger.error("sig error")
            return false
        }
        if (this.recovery !== tx.recovery) { return false }

        return true
    }

    public encode(): Uint8Array {
        return proto.Tx.encode(this).finish()
    }
}
export class GenesisTx implements proto.ITx {
    public to !: Address
    public amount !: number

    constructor(tx?: proto.ITx) {
        if (tx) { this.set(tx) }
    }

    public set(tx: proto.ITx) {
        if (tx.to === undefined) { throw (new Error("to address not defined in input")) }
        if (tx.amount === undefined) { throw (new Error("amount not defined in input")) }

        this.to = new Address(tx.to)
        this.amount = tx.amount instanceof Long ? tx.amount.toInt() : tx.amount
    }

    public equals(tx: GenesisTx): boolean {
        if (!this.to.equals(tx.to)) { return false }
        if (this.amount !== tx.amount) { return false }
        return true
    }
    public encode(): Uint8Array {
        return proto.Tx.encode(this).finish()
    }
}

export class GenesisSignedTx implements proto.ITx {
    public static decode(data: Uint8Array): GenesisSignedTx {
        const genesisStx = proto.Tx.decode(data)
        return new GenesisSignedTx(genesisStx)
    }
    public to !: Address
    public amount !: number
    public signature !: Uint8Array
    public recovery !: number

    constructor()
    // tslint:disable-next-line:unified-signatures
    constructor(tx: proto.ITx)
    constructor(tx: proto.ITx, signature: Uint8Array, recovery: number)
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
        return new Hash(new GenesisTx(this))
    }

    public set(stx: proto.ITx): void {
        if (stx.to === undefined) { throw (new Error("to address not defined in input")) }
        if (stx.amount === undefined) { throw (new Error("amount not defined in input")) }
        if (stx.signature === undefined) { throw (new Error("signature not defined in input")) }
        if (stx.recovery === undefined) { throw (new Error("recovery not defined in input")) }

        this.to = new Address(stx.to)
        this.amount = stx.amount instanceof Long ? stx.amount.toInt() : stx.amount
        this.signature = stx.signature
        this.recovery = stx.recovery
    }

    public verify(): boolean {
        try {
            const pubkey = new PublicKey(this)
            return pubkey.verify(this)
        } catch (e) {
            return false
        }
    }

    public encode(): Uint8Array {
        return proto.Tx.encode(this).finish()
    }
}
