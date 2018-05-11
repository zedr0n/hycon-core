// tslint:disable:no-bitwise

export class Difficulty {

    public static decode(num: number): Difficulty {
        const exponent = num >> 24
        const mantissa = num & 0xFF_FF_FF

        return new Difficulty(mantissa, exponent)
    }
    public static normalize(mantissa: number, exponent: number) {
        if (mantissa !== 0) {
            while ((mantissa & 0xFF) === 0) {
                mantissa = mantissa >> 8
                exponent += 1
            }
        }
        return {mantissa, exponent}
    }
    public static unpackMantissa(num: Uint8Array ): number {
        let mantissa = 0
        const mantissaBytes = new Uint8Array(3)

        if (num.length === 32) {
            const msb = Difficulty.getMsb(num)
            if (msb > 2) {
                for (let i = msb - 2; i < msb + 1; i++) {
                    mantissaBytes[i] = num[i]
                }
            } else {
                for (let i = 0; i < 3; i++) {
                    mantissaBytes[i] = num[i]
                }
            }
        } else if (num.length === 4) {
            for (let i = 1; i < 4; i++) {
                mantissaBytes[i - 1] = num[i]
            }
        } else {
            throw Error("num must be either 3, 4, or 32 bytes long")
        }

        for (let i = 2; i >= 0; i--) {
            mantissa = mantissa << 8
            mantissa = mantissa + mantissaBytes[i]
        }
        return mantissa
    }
    public static unpackExponent(num: Uint8Array): number {
        const msb = Difficulty.getMsb(num)

        let exponent = 0
        if (msb === 0) {
            exponent = 0
        } else {
            // Byte align the exponent value
            exponent = (msb - 1) * 8 + Math.ceil(Math.log2(num[msb] === 0 ? 1 : num[msb]))
        }
        return exponent
    }

    public static getMsb(num: Uint8Array): number {
        let msb = 0
        for (let i = 31; i >= 0 ; i--) {
            if (num[i] > 0) {
                msb = i
                break
            }
        }
        return msb
    }

    private m: number

    private e: number

    constructor(mantissa: number, exponent: number) {
        const normalized = Difficulty.normalize(mantissa, exponent)
        this.m = normalized.mantissa
        this.e = normalized.exponent
    }
    public inspect(value: number) {
        const buf = new Buffer(6)
        buf.writeUIntBE(value, 0, 6)
        return "0x" + buf.toString("hex")
    }

    public encode(): number {
        const packedBytes = new Uint8Array([0, 0, 0, 0])
        packedBytes[3] = this.e
        for (let i = 2; i >= 0; i--) {
            packedBytes[i] = this.m >> ((i - 1) * 8)
        }
        let packed = 0
        for (let i = 0; i < 4; i++) {
            packed += packedBytes[i] << (i * 8)
        }
        return (this.e << 24) + this.m
    }

    public greaterThan(byteArray: Uint8Array): boolean {
        const mantissa = Difficulty.unpackMantissa(byteArray)
        const exponent = Difficulty.unpackExponent(byteArray)

        const exponentCompare = this.e >= exponent
        const mantissaCompare = this.m > mantissa

        if (mantissaCompare && exponentCompare) {
            return true
        } else if (mantissa > 0 && exponentCompare) {
            return true
        } else {
            return false
        }
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
        const {mantissa, exponent} = Difficulty.normalize(newMantissa, newExponent)
        return new Difficulty(mantissa, exponent)
    }
}
