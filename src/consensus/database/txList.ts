import { Block } from "../../common/block"
import { BlockHeader } from "../../common/blockHeader"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
import * as proto from "../../serialization/proto"
import { Hash } from "../../util/hash"
import { AnySignedTx } from "../iconsensus"

export class TxList implements proto.ITxList {
    public static decode(data: Uint8Array): TxList {
        const tx = proto.TxList.decode(data)
        return new TxList(tx)
    }
    public tx: AnySignedTx
    public previousFrom?: Hash
    public previousTo?: Hash
    public blockHash: Hash

    constructor(tx?: AnySignedTx | proto.ITxList) {
        if (tx) {
            if (tx instanceof GenesisSignedTx || tx instanceof SignedTx) {
                this.tx = tx
            } else { this.set(tx) }
        }
    }

    public set(txList: proto.ITxList): void {
        if (txList.tx === undefined) { throw new Error("tx is missing in TxList") }

        if (txList.previousFrom !== undefined && txList.previousFrom.length > 0) {
            if (this.previousFrom) {
                this.previousFrom.set(txList.previousFrom)
            } else { this.previousFrom = new Hash(txList.previousFrom) }
        }

        if (txList.previousTo !== undefined && txList.previousTo.length > 0) {
            if (this.previousTo) {
                this.previousTo.set(txList.previousTo)
            } else { this.previousTo = new Hash(txList.previousTo) }
        }

        if (txList.blockHash !== undefined) {
            if (this.blockHash) {
                this.blockHash.set(txList.blockHash)
            } else { this.blockHash = new Hash(txList.blockHash) }
        }

        if (this.tx) {
            this.tx.set(txList.tx)
        } else if (txList.previousFrom.length === 0 && txList.previousTo.length === 0 && txList.tx.from.length === 0) {
            this.tx = new GenesisSignedTx(txList.tx)
        } else {
            this.tx = new SignedTx(txList.tx)
        }

    }

    public encode(): Uint8Array {
        return proto.TxList.encode(this).finish()
    }
}
