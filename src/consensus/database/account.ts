import Long = require("long")
import * as proto from "../../serialization/proto"
export class Account implements proto.IAccount {
    public static decode(data: Uint8Array): Account {
        const account = proto.Account.decode(data)
        return new Account(account)
    }
    public balance: number
    public nonce: number

    constructor(account?: proto.IAccount) {
        if (account !== undefined) {
            this.set(account)
        }
    }

    public set(account: proto.IAccount) {
        if (account.balance === undefined) { throw new Error("Balance is missing") }
        if (account.nonce === undefined) { throw new Error("Nonce is missing") }
        this.balance = account.balance instanceof Long ? account.balance.toInt() : account.balance
        this.nonce = account.nonce
    }

    public encode(): Uint8Array {
        return proto.Account.encode(this).finish()
    }
}
