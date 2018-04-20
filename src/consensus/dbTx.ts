import { Block } from "../common/block"
import { BlockHeader } from "../common/blockHeader"
import { SignedTx, Tx } from "../common/tx"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"

// tslint:disable:member-access
export class DBTx implements proto.ITxDB {
    public static decode(data: Uint8Array): DBTx {
        const tx = proto.TxDB.decode(data)
        return new DBTx(tx)
    }
    public hash !: Hash
    public blockHash !: Hash
    public blockHeight !: number
    public txNumber !: number

    constructor(dbTx?: proto.ITxDB) {
        if (dbTx) {
            this.set(dbTx)
        }
    }

    public set(tx: proto.ITxDB): void {
        if (tx.hash === undefined) { throw new Error("Hash is missing in DBTx") }
        if (tx.blockHash === undefined) { throw new Error("BlockHash is missing in DBTx") }
        if (tx.blockHeight === undefined) { throw new Error("blockHeight is missing in DBTx") }
        if (tx.txNumber === undefined) { throw new Error("TxNumber is missing in DBTx") }
        if (this.hash) {
            this.hash.set(tx.hash)
        } else {
            this.hash = new Hash(tx.hash)
        }
        if (this.blockHash) {
            this.blockHash.set(tx.blockHash)
        } else {
            this.blockHash = new Hash(tx.blockHash)
        }
        this.blockHeight = tx.blockHeight
        this.txNumber = tx.txNumber
    }
    public encode(): Uint8Array {
        return proto.TxDB.encode(this).finish()
    }
}
