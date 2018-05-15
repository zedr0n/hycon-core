import { Hash } from "../util/hash"

// tslint:disable:no-bitwise

export class Difficulty {
    public static decode(num: number): Difficulty {
        const exponent = num >> 24
        const mantissa = num & 0xFFFFFF

        return new Difficulty(mantissa, exponent)
    }
    private static normalize(mantissa: number, exponent: number) {
        while ((mantissa & 0xFF) === 0 && exponent < 0x20) {
            mantissa = mantissa >> 8
            exponent += 1
        }
        return { mantissa, exponent }
    }

    private m: number

    private e: number

    constructor(mantissa: number, exponent: number) {
        const normalized = Difficulty.normalize(mantissa, exponent)
        this.m = normalized.mantissa
        this.e = normalized.exponent
    }

    public getMantissa(): number {
        return this.m
    }

    public getExponent(): number {
        return this.e
    }

    public getMinerParameters(): { offset: number, target: string } {
        let target: string = this.m.toString(16)
        if (target.length % 2) {
            target = "0" + target
        }
        while (target.length < 6) {
            target += "f"
        }
        return { offset: this.e * 2, target }
    }

    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        return (this.e << 24) + this.m
    }

    public greaterThan(byteArray: Hash): boolean {
        let i = 31
        const exponentCount = 32 - this.e
        while (i >= exponentCount) {
            if (byteArray[i] !== 0) {
                return false
            }
            i--
        }
        const mantisaByteCount = Math.ceil(Math.log2(this.m) / 8)
        let j = i - mantisaByteCount + 1
        j = j < 0 ? 0 : j

        let mComp = 0
        while (j <= i) {
            mComp <<= 8
            mComp += byteArray[i]
            --i
        }

        return (this.m > mComp)
    }

    public multiply(num: number): Difficulty {
        let newMantissa = num * this.m
        let newExponent = this.e
        const mBits = Math.ceil(Math.log2(newMantissa))
        const shift = Math.ceil((mBits - 24) / 8)
        newExponent = this.e + shift

        if (newExponent < 0) {
            newExponent = 0
        }

        if (shift !== 0) {
            newMantissa = Math.round(newMantissa / Math.pow(2, shift * 8))
        }
        newMantissa = Math.round(newMantissa)

        // Normalize the mantissa
        const { mantissa, exponent } = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }

    public add(diff: Difficulty) {
        const expDiff = this.e - diff.getExponent()
        let newExponent = this.e
        let newMantissa = 0
        let shift = 0
        if (expDiff > 0 && expDiff < 24) {
            newMantissa = ((this.m * Math.pow(2, expDiff)) + diff.getMantissa())
            const mBits = Math.ceil(Math.log2(newMantissa))
            shift = Math.ceil((mBits - 24) / 8)
            newExponent = this.e + shift
        } else if (expDiff > -24 && expDiff < 0) {
            newMantissa = ((diff.getMantissa() * Math.pow(2, -expDiff)) + this.m)
            const mBits = Math.ceil(Math.log2(newMantissa))
            shift = Math.ceil((mBits - 24) / 8)
            newExponent = diff.getExponent() + shift
        } else if (expDiff === 0) {
            newMantissa = this.m + diff.getMantissa()
        } else {
            return new Difficulty(this.m, this.e)
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
}
