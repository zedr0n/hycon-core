import * as Base58 from "base-58"
import { getLogger } from "log4js"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"

const logger = getLogger("Address")

function checkSum(arr: Uint8Array): string {
    const hash = Hash.hash(arr)
    let str = Base58.encode(hash)
    str = str.slice(0, 4)
    return str
}

function toUint8Array(address: (string | Uint8Array)): Uint8Array {
    if (typeof address === "string") {
        // TODO: Check 'H' prefix
        const check = address.slice(-4)
        address = address.slice(1, -4)
        const out: Uint8Array = Base58.decode(address)
        const expectedChecksum = checkSum(out)
        if (expectedChecksum !== check) {
            throw new Error(`Address hash invalid checksum '${check}' epected '${expectedChecksum}'`)
        }
        return out
    }
    return address
}

export class Address extends Uint8Array {
    public static isAddress(address: string): boolean {
        try {
            toUint8Array(address)
            return true
        } catch (e) {
            return false
        }
    }

    constructor(address: string | Uint8Array | number) {
        // tslint:disable-next-line:max-line-length
        typeof address === "number" ? super(address) : super(toUint8Array(address)) // Need to allow for super constructor for number due to extension of Uint8Array
    }

    public toString(): string {
        try {
            return "H" + Base58.encode(this) + checkSum(this)
        } catch (err) {
            logger.error(err)
        }
    }

    public equals(address: Address): boolean {
        if (this.length !== address.length) { return false }
        for (let i = 0; i < address.length; i++) {
            if (this[i] !== address[i]) {
                return false
            }
        }
        return true
    }
}
