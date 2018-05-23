import { getLogger } from "log4js"
import { Hash } from "../util/hash"
const logger = getLogger("Difficulty")

// tslint:disable:no-bitwise

export class Difficulty {
    public static decode(num: number): Difficulty {
        if (num > 0xFFFFFFFF) {
            // Node js can not perform bitwise operations on numbers with more than 32 bits
            throw new Error("Invalid difficulty")
        }
        const exponent = num >> 24
        const mantissa = num & 0xFFFFFF

        return new Difficulty(mantissa, exponent)
    }
    private static normalize(mantissa: number, exponent: number) {
        if (mantissa === 0) {
            return { mantissa: 1, exponent: 0 }
        }

        if (exponent > 232) {
            // TODO: Adjust mantissa
            return { mantissa, exponent: 232 }
        }

        const mBits = Math.ceil(Math.log2(mantissa + 1))
        let shift = mBits - 24

        // If after a shift, the exponent would be negative
        if (exponent + shift < 0) {
            shift = -exponent
        }
        // If after a shift, the exponent would be greater than 232
        if (exponent + shift > 232) {
            shift = 232 - exponent
        }
        if (shift !== 0) {
            mantissa = mantissa / Math.pow(2, shift)
            exponent = exponent + shift
        }
        mantissa = Math.round(mantissa)

        return { mantissa, exponent }
    }

    private mantissa: number

    private exponent: number

    constructor(mantissa: number, exponent: number) {
        const normalized = Difficulty.normalize(mantissa, exponent)
        this.mantissa = normalized.mantissa
        this.exponent = normalized.exponent
    }

    public getMantissa(): number {
        return this.mantissa
    }

    public getExponent(): number {
        return this.exponent
    }

    public getTarget(): Buffer {
        const target = Buffer.alloc(32)
        const index = Math.floor((256 - 24 - this.exponent) / 8)
        const alignment = (256 - 24 - this.exponent) - index * 8
        let bytes
        if (alignment === 0) {
            bytes = 3
        } else {
            bytes = 4
        }
        target.writeUIntLE(((0xFFFFFF - this.mantissa) << alignment), index, bytes)
        if (index <= 29) {
            target.fill(0xFF, 0, index)
        }

        let str = ""
        for (let i = 24; i < 32; i++) {
            str = target[i].toString(16) + str
        }
        logger.info(`Target: ${str}`)
        return target
    }

    public getMinerTarget(): string {
        return this.getTarget().slice(24, 32).toString("hex")
    }

    public encode(): number {
        return (this.exponent << 24) + this.mantissa
    }

    public acceptable(hash: Uint8Array | Hash, target?: Buffer): boolean {
        if (!(hash instanceof Hash) && hash.length !== 32) {
            throw new Error(`Expected 32 byte hash, got ${hash.length} bytes`)
        }
        if (target === undefined) {
            target = this.getTarget()
        }

        for (let i = 31; i >= 0; i--) {
            if ((0xFF - hash[i]) < target[i]) {
                return true
            }
            if ((0xFF - hash[i]) > target[i]) {
                return false
            }
        }
        return true
    }

    public greaterThan(difficulty: Difficulty): boolean {
        if (this.exponent < difficulty.exponent) {
            return !difficulty.greaterThan(this)
        }
        const expDiff = this.exponent - difficulty.exponent
        return this.mantissa > Math.pow(2, expDiff) * difficulty.mantissa
    }
    public multiply(num: number): Difficulty {
        const newMantissa = num * this.mantissa
        const newExponent = this.exponent

        const { mantissa, exponent } = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }

    public add(diff: Difficulty): Difficulty {
        if (this.exponent < diff.exponent) {
            return diff.add(this)
        }

        const expDiff = diff.exponent - this.exponent
        const newMantissa = this.mantissa + diff.mantissa * Math.pow(2, expDiff)

        const { mantissa, exponent } = Difficulty.normalize(newMantissa, this.exponent)
        return new Difficulty(mantissa, exponent)
    }
}
