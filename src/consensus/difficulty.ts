// import { Hash } from "../util/hash"

// tslint:disable:no-bitwise
export class Difficulty {

    public static decode(num: Uint8Array): Difficulty {
        if (num.length === 4) {
            const exponent = num[0]
            const mantissa = Difficulty.unpackMantissa(num)

            return new Difficulty(mantissa, exponent)
        } else {
            throw new Error("num must be 4 bytes long")
        }
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

    constructor(mantissa?: number, exponent?: number, byteArray?: Uint8Array) {
        if ((mantissa !== undefined) && (exponent !== undefined)) {
            this.m = mantissa
            this.e = exponent
        } else if (byteArray !== undefined) {
            if (byteArray.length === 4) {
                return Difficulty.decode(byteArray)
            }
        } else {
            throw new Error("You must supply either both the mantissa and exponent, or a byte array")
        }
    }

    public encode(): Uint8Array {

        const packed = new Uint8Array([0, 0, 0, 0])
        packed[0] = this.e
        for (let i = 3; i > 0; i--) {
            packed[i] = this.m >> ((i - 1) * 8)
        }
        return packed
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

    public multiply(num: number) {
        return 0
    }
}
