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
        mantissa = Math.round(mantissa)

        while (mantissa % 2 === 0) {
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

    public getTarget(): Uint8Array {
        const target = Buffer.alloc(32)

        const lowerBits = (this.exponent % 8)
        const targetMantissa = (this.mantissa << lowerBits) | ((1 << lowerBits) - 1)
        const mBits = Math.ceil(Math.log2(targetMantissa + 1))
        const offset = Math.floor((256 - this.exponent) / 8)

        target.writeUIntLE(targetMantissa, offset, 4)

        for (let i = offset; i < target.length; i++) {
            target[i] = 0xFF - target[i]
        }
        return target
    }

    public getTarget2(): Buffer {
        const target = Buffer.alloc(33)
        const mantissaBits = Math.ceil(Math.log2(this.mantissa + 1))
        const mantissaBytes = Math.ceil(mantissaBits / 8)
        const targetNum = Math.pow(0x100, mantissaBytes) - 1 - this.mantissa
        const targetBits = Math.ceil(Math.log2(targetNum + 1))
        let targetBytes = Math.ceil(targetBits / 8)
        if (targetBytes === 0) {
            targetBytes = 1
        }
        const index = Math.floor(((256 - targetBytes * 8) - this.exponent) / 8)
        const alignment = (256 - targetBits - this.exponent) - index * 8
        // logger.warn(`mantissaBits: ${mantissaBits}, mantissa: ${this.mantissa}, targetBits: ${targetBits}, targetNum: ${targetNum}, index: ${index}, alignment: ${alignment}`)

        // const targetMantissa = (Math.pow(2, mantissaBits) - 1 - this.mantissa)
        // const index = Math.floor((256 - mantissaBytes * 8 - this.exponent) / 8)
        // const alignment = (256 - mantissaBits - this.exponent) - index * 8
        target.writeUIntLE(targetNum, index, targetBytes)
        // if (index <= 29) {
        target.fill(0xFF, 0, index)
        // }

        // let str = ""
        // for (let i = 24; i < 32; i++) {
        //     str = target[i].toString(16) + str
        // }
        // logger.info(`Target: ${str}`)
        return target
    }

    public getMinerTarget(): string {
        return this.getTarget().slice(24, 32).toString("hex")
    }

    public encode(): number {
        return (this.exponent << 24) + this.mantissa
    }

    public acceptable(hash: Uint8Array | Hash, target?: Uint8Array): boolean {
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

    public iterateMantissa() {
        this.mantissa = 1
        this.exponent = 0
        const hashBytes = new Uint8Array(32)
        while (this.mantissa <= 0xFFFF) {
            let trueCount = 0
            const target = this.getTarget()
            for (let i = 0; i <= 0xFFFF; i++) {
                hashBytes[31] = i & 0xFF
                hashBytes[30] = (i & 0xFF00) >> 8
                if (this.acceptable(hashBytes, target)) {
                    trueCount++
                }
                // for (let j = 0; j <= 0xFF; j++) {
                //     hashBytes[30] = j
                // }
            }
            logger.warn(`Mantissa: ${this.mantissa.toString(16)}, target: ${target.reverse().toString("hex")}, trueCount: ${trueCount}, ratio: ${trueCount / 0x10000}`)
            this.mantissa += Math.floor(Math.random() * 255)
        }
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
