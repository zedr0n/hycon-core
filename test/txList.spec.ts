import { randomBytes } from "crypto"
import { } from "jasmine"
import { Address } from "../src/common/address"
import { Tx } from "../src/common/tx"
import { SignedTx } from "../src/common/txSigned"
import { TxList } from "../src/consensus/database/txList"
import * as proto from "../src/serialization/proto"
describe("TxLst", () => {
    let txList: TxList
    let tx: SignedTx
    beforeEach(() => {
        txList = new TxList()
        tx = new SignedTx({
            from: new Address(randomBytes(20)), to: new Address(randomBytes(20)),
            amount: 10000, fee: 100, nonce: 1234,
            signature: randomBytes(32), recovery: 1,
        })
    })
})
