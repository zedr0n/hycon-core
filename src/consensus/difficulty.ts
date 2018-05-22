import { Hash } from "../util/hash"

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

        if (exponent > 28) {
            // TODO: Adjust mantissa
            return { mantissa, exponent: 28 }
        }

        const mBits = Math.ceil(Math.log2(mantissa))
        let shift = Math.ceil((mBits - 24) / 8)

        // If after a shift, the exponent would be negative
        if (exponent + shift < 0) {
            shift = -exponent
        }
        // If after a shift, the exponent would be greater than 29
        if (exponent + shift > 29) {
            shift = 29 - exponent
        }
        if (shift !== 0) {
            mantissa = mantissa / Math.pow(2, shift * 8)
            exponent = exponent + shift
        }
        mantissa = Math.round(mantissa)

        while ((mantissa % 0x100) === 0 && exponent < 28) {
            mantissa = mantissa / 0x100
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
        const target = new Buffer(32)
        target.fill(0x00)
        const index = 32 - (this.exponent + 3)
        target.writeUIntLE(Math.pow(2, 24) - 1 - this.mantissa, index, 3)
        if (index <= 29) {
            target.fill(0xFF, 0, index)
        }
        return target
    }

    public getMinerTarget(): string {
        return this.getTarget().slice(24, 32).toString("hex")
    }

    public encode(): number {
        return (this.exponent << 24) + this.mantissa
    }

    public acceptable(hash: Uint8Array | Hash): boolean {
        if (!(hash instanceof Hash) && hash.length !== 32) {
            throw new Error(`Expected 32 byte hash, got ${hash.length} bytes`)
        }
        const target = this.getTarget()

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
        return this.mantissa > Math.pow(0x100, expDiff) * difficulty.mantissa
    }
    public multiply(num: number): Difficulty {
        const newMantissa = num * this.mantissa
        const newExponent = this.exponent

        // Normalize the mantissa
        const { mantissa, exponent } = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }

    public add(diff: Difficulty): Difficulty {
        if (this.exponent < diff.getExponent()) {
            return diff.add(this)
        }

        const expDiff = diff.getExponent() - this.exponent
        const newMantissa = this.mantissa + diff.getMantissa() * Math.pow(2, expDiff * 8)

        const { mantissa, exponent } = Difficulty.normalize(newMantissa, this.exponent)
        return new Difficulty(mantissa, exponent)
    }
}
