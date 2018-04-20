import { Address } from "./address"
import { GenesisSignedTx, SignedTx } from "./tx"
// tslint:disable-next-line:no-var-requires
const secp256k1 = require("secp256k1")
import { Hash } from "../util/hash"

export class PublicKey {
    private pubKey: Buffer
    constructor(publicKey: Buffer)
    // tslint:disable-next-line:unified-signatures
    constructor(tx: (SignedTx | GenesisSignedTx))
    constructor(a: (SignedTx | GenesisSignedTx | Buffer)) {
        if (a instanceof Buffer) {
            this.pubKey = a
        } else {
            this.pubKey = secp256k1.recover(a.unsignedHash().toBuffer(), a.signature, a.recovery)
        }
    }

    public verify(tx: (SignedTx | GenesisSignedTx)): boolean {
        let txAddress: Address
        if (tx instanceof SignedTx) {
            txAddress = tx.from
        } else {
            txAddress = tx.to
        }
        const address = this.address()

        if (!txAddress.equals(address)) { return false }
        if (!tx.signature) { return false }

        try {
            return secp256k1.verify(tx.unsignedHash().toBuffer(), tx.signature, this.pubKey)
        } catch (e) {
            return false
        }
    }

    public address(): Address {
        const hash: Uint8Array = Hash.hash(this.pubKey)
        const address = new Address(hash.slice(12))
        return address
    }
}
