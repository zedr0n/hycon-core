import { randomBytes } from "crypto"
import { Hash } from "../util/hash"
import { PublicKey } from "./publicKey"
import { GenesisSignedTx, GenesisTx, SignedTx, Tx } from "./tx"
// tslint:disable:member-access
// tslint:disable-next-line:no-var-requires
const secp256k1 = require("secp256k1")

export class PrivateKey {
    readonly privKey: Buffer
    constructor(privateKey?: Buffer) {
        if (privateKey !== undefined) {
            this.privKey = privateKey
        } else {
            do {
                this.privKey = randomBytes(32)
            } while (!secp256k1.privateKeyVerify(this.privKey))
        }
    }

    public toHexString(): string {
        return this.privKey.toString("hex")
    }

    public sign(tx: (Tx | GenesisTx)): (SignedTx | GenesisSignedTx) {
        const hash = new Hash(tx)
        const signature = secp256k1.sign(hash.toBuffer(), this.privKey)

        if (tx instanceof Tx) {
            return new SignedTx(tx, signature.signature, signature.recovery)
        } else {
            return new GenesisSignedTx(tx, signature.signature, signature.recovery)
        }
    }

    public publicKey(): PublicKey {
        const buffer = secp256k1.publicKeyCreate(this.privKey)
        return new PublicKey(buffer)
    }
}
