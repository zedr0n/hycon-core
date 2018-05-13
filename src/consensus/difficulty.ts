// tslint:disable:no-bitwise

export class Difficulty {
    public static decode(num: number): Difficulty {
        const exponent = num >> 24
        const mantissa = num & 0xFFFFFF

        return new Difficulty(mantissa, exponent)
    }
    private static normalize(mantissa: number, exponent: number) {
        if (mantissa !== 0) {
            while ((mantissa & 0xFF) === 0) {
                mantissa = mantissa >> 8
                exponent += 1
            }
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

    public getMinerParameters(): {offset: number, target: string} {
        let offset = this.e * 2
        let target = this.m
        const extraHex = Math.ceil((Math.log2(this.m) - 16) / 4)
        if (extraHex > 0) {
            target >>= (extraHex * 4)
            offset += extraHex
        }
        return {offset, target: target.toString(16)}
    }

    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        return (this.e << 24) + this.m
    }

    public greaterThan(byteArray: Uint8Array): boolean {
        let i = 31
        let offset = 32 - this.e
        while (i >= offset) {
            if (byteArray[i] !== 0) {
                return false
            }
            i--
        }
        offset = i - 3
        let mComp = 0
        while (i > offset)  {
            mComp <<= 8
            if (i >= 0) {
                mComp += byteArray[i]
            }
            i--
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
}
