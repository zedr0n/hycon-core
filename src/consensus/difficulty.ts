import { getLogger } from "log4js"
import { MapField } from "protobufjs"
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
        mantissa = Math.ceil(mantissa)

        while (mantissa % 2 === 0 && mantissa > 0) {
            mantissa = mantissa / 2
            exponent += 1
        }

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
        const targetMantissa = (0xFFFFFF - this.mantissa) * Math.pow(2, 8 - (this.exponent % 8)) + (Math.pow(2, 8 - (this.exponent % 8)) - 1)
        const index = 28 - Math.floor(this.exponent / 8)
        target.writeUInt32LE(targetMantissa, index)
        target.fill(0xFF, 0, index)
        return target
    }

    public getMinerTarget(): string {
        return this.getTarget().slice(24, 32).toString("hex")
    }

    public getShowMinerTarget(): string {
        return Buffer.from(this.getTarget().reverse().buffer).slice(0, 8).toString("hex")
    }

    public encode(): number {
        if (this.mantissa > 0xFFFFFF || this.mantissa < 0) {
            throw new Error(`Mantissa(0x${this.mantissa.toString(16)}) out of range, can not encode`)
        }
        if (this.exponent > 0xFF || this.exponent < 0) {
            throw new Error(`Exponent(0x${this.exponent.toString(16)}) out of range, can not encode`)
        }
        return (this.exponent * Math.pow(2, 24)) + this.mantissa
    }

    public acceptable(hash: Uint8Array | Hash, target?: Buffer): boolean {
        if (!(hash instanceof Hash) && hash.length !== 32) {
            throw new Error(`Expected 32 byte hash, got ${hash.length} bytes`)
        }
        if (target === undefined) {
            target = this.getTarget()
        }

        for (let i = 31; i >= 0; i--) {
            if (hash[i] < target[i]) {
                return true
            }
            if (hash[i] > target[i]) {
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
