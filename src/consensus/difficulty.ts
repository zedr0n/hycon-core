import { Hash } from "../util/hash"

// tslint:disable:no-bitwise

export class Difficulty {

    public static minimumMantissa: number = 0xFF
    public static minimumExponent: number = 0

    public static decode(num: number): Difficulty {
        const exponent = num >> 24
        const mantissa = num & 0xFFFFFF

        return new Difficulty(mantissa, exponent)
    }
    private static normalize(mantissa: number, exponent: number) {
        if ( mantissa === 0 ) {
            return { mantissa : Difficulty.minimumMantissa, exponent: Difficulty.minimumExponent }
        }

        if ( exponent > 28 ) {
            return { mantissa , exponent: 28 }
        }

        while ((mantissa & 0xFF) === 0 && exponent < 29) {
            mantissa = mantissa >> 8
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
        target.writeUIntBE(Math.pow(2, 24) - 1 - this.mantissa, index, 3)
        if ( this.exponent + 3 !== 31) {
            target.fill(0xFF, 0, index)
        }
        return target
    }

    public getMinerTarget(): string {
        return this.getTarget().slice(24, 32).toString("hex")
    }

    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        return (this.exponent << 24) + this.mantissa
    }

    public acceptable(hash: Hash): boolean {
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

    public multiply(num: number): Difficulty {
        let newMantissa = num * this.mantissa
        let newExponent = this.exponent
        const mBits = Math.ceil(Math.log2(newMantissa))
        const shift = Math.ceil((mBits - 24) / 8)
        newExponent = this.exponent + shift

        if (newExponent < 0) {
            newExponent = 0
        }

        if (shift !== 0 && newExponent !== 0) {
            newMantissa = Math.round(newMantissa / Math.pow(2, shift * 8))
        }
        newMantissa = Math.round(newMantissa)

        // Normalize the mantissa
        const { mantissa, exponent } = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }

    public add(diff: Difficulty) {
        const expDiff = this.exponent - diff.getExponent()
        let newExponent = this.exponent
        let newMantissa = 0
        let shift = 0
        if (expDiff > 0 && expDiff < 24) {
            newMantissa = ((this.mantissa * Math.pow(2, expDiff)) + diff.getMantissa())
            const mBits = Math.ceil(Math.log2(newMantissa))
            shift = Math.ceil((mBits - 24) / 8)
            newExponent = this.exponent + shift
        } else if (expDiff > -24 && expDiff < 0) {
            newMantissa = ((diff.getMantissa() * Math.pow(2, -expDiff)) + this.mantissa)
            const mBits = Math.ceil(Math.log2(newMantissa))
            shift = Math.ceil((mBits - 24) / 8)
            newExponent = diff.getExponent() + shift
        } else if (expDiff === 0) {
            newMantissa = this.mantissa + diff.getMantissa()
        } else {
            return new Difficulty(this.mantissa, this.exponent)
        }

        if (newExponent < 0) {
            newExponent = 0
        }

        if (shift !== 0) {
            newMantissa = Math.round(newMantissa / Math.pow(2, shift * 8))
        } else {
            newMantissa = Math.round(newMantissa)
        }

        const { mantissa, exponent } = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }

    private reverseByte(target: string) {
        return target.substr(4, 2) + target.substr(2, 2 ) + target.substr(0, 2 )
    }

}
