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
        let target: string = this.m.toString(16)
        if ( target.length % 2 ) {
            target = "0" + target
        }
        while ( target.length < 6) {
            target += "f"
        }
        return { offset: this.e * 2, target}
    }

    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        return (this.e << 24) + this.m
    }

    /**
     * We can handle maximum 61 zeros in this function because a hash result is 256 bits (32 bytes, 64 characters in hex value).
     * We don't have to handle all of the edge cases.
     * It seems hard to make a block in a minute with more than 61 zeros in crypto-night.
     */
    public greaterThan(byteArray: Uint8Array): boolean {
        let i = 31
        const exponetCount = 32 - this.e
        while (i >= exponetCount) {
            if (byteArray[i] !== 0) {
                return false
            }
            i--
        }
        const mantisaByteCount = Math.ceil( Math.log2(this.m) / 8)
        let j = i - mantisaByteCount + 1
        j  = j < 0 ? 0 : j

        let mComp = 0
        while (j <= i)  {
            mComp <<= 8
            mComp += byteArray[j]
            ++j
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
