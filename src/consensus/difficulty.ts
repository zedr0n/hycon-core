import { Hash } from "../util/hash"

// tslint:disable:no-bitwise

export class Difficulty {

    public static minimumMantissa: number = 0xFF
    public static minimumExponent: number = 0

    public static readonly defaultDifficulty = new Difficulty(Difficulty.minimumMantissa, Difficulty.minimumExponent)

    public static decode(num: number): Difficulty {
        const exponent = num >> 24
        const mantissa = num & 0xFFFFFF

        return new Difficulty(mantissa, exponent)
    }
    private static normalize(mantissa: number, exponent: number) {
        if ( mantissa === 0 ) {
            return { mantissa : Difficulty.minimumMantissa, exponent: Difficulty.minimumExponent }
        }

        while ((mantissa & 0xFF) === 0 && exponent < 0x20) {
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

    public getMinerParameters(): { offset: number, target: string } {
        let target: string = this.mantissa.toString(16)
        if (target.length % 2) {
            target = "0" + target
        }
        while (target.length < 6) {
            target += "f"
        }

        return { offset: this.exponent * 2, target : this.reverseByte(target) }
    }

    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        return (this.exponent << 24) + this.mantissa
    }

    public greaterThan(targetInput: Hash | Difficulty): boolean {
        if ( targetInput instanceof Difficulty) {
            return this.exponent > targetInput.getExponent() ? true
            : this.exponent === targetInput.getExponent() && this.mantissa > targetInput.getMantissa()
        }

        let i = 31
        const exponentCount = 32 - this.exponent
        while (i >= exponentCount) {
            if (targetInput[i] !== 0) {
                return false
            }
            i--
        }
        const mantisaByteCount = Math.ceil(Math.log2(this.mantissa) / 8)
        let j = i - mantisaByteCount + 1
        j = j < 0 ? 0 : j

        let mComp = 0
        while (j <= i) {
            mComp <<= 8
            mComp += targetInput[i]
            --i
        }

        return (this.mantissa > mComp)
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
