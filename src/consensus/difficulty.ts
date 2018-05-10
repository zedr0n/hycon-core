import { Hash } from "../util/hash"

// tslint:disable:no-bitwise
export class Difficulty {

    public static decode(num: Uint8Array): Difficulty {
        const exponent = num[0]
        let mantissa = 0

        for (let i = 1; i < 4; i++) {
            mantissa = mantissa << 8
            mantissa = mantissa + num[i]
        }

        return new Difficulty(mantissa, exponent)
    }

    // TODO: Move msb logic to lessThan
    public static pack(num: Uint8Array): Uint8Array {
        let msb = 0
        for (let i = 31; i >= 0 ; i--) {
            if (num[i] > 0) {
                msb = i
                break
            }
        }

        let mantissa: Uint8Array
        if (msb > 2) {
            mantissa = num.slice(msb - 2, msb + 1)
        } else {
            mantissa = num.slice(0, 3)
        }

        const packedBytes = new Uint8Array(4)
        packedBytes[0] = (msb - 1) * 8 + Math.ceil(Math.log2(num[msb] === 0 ? 1 : num[msb]))
        for (let i = 1; i < 4; i++) {
            packedBytes[i] = mantissa[i - 1]
        }

        return packedBytes
    }
    private m: number

    private e: number

    constructor(mantissa?: number, exponent?: number, byteArray?: Uint8Array) {
        if ((mantissa !== undefined) && (exponent !== undefined)) {
            this.m = mantissa
            this.e = exponent
        } else if (byteArray !== undefined) {
            if (byteArray.length === 32) {
                return Difficulty.decode(Difficulty.pack(byteArray))
            } else if (byteArray.length === 4) {
                return Difficulty.decode(byteArray)
            }
        } else {
            return new Difficulty(0, 0)
        }
    }

    public encode(): Uint8Array {

        const packed = new Uint8Array([0, 0, 0, 0])
        packed[0] = this.e
        for (let i = 1; i < 4; i++) {
            packed[i] = this.m >> ((3 - i) * 8)
        }
        return packed
    }

    public lessThan(hash: Hash): boolean {

        const packedHash = Difficulty.pack(hash)
        const packedDifficulty = this.encode()

        const exponentCompare = packedDifficulty[0] < packedHash[0]
        let mantissaCompare = false
        for (let i = 2; i >= 0; i--) {
            if (packedDifficulty[i] < packedHash[i]) {
                mantissaCompare = true
                break
            }
        }

        if (mantissaCompare && exponentCompare) {
            return true
        } else if (packedHash[0] > 0 && exponentCompare) {
            return true
        } else {
            return false
        }
    }

    public multiply(num: number) {
        return 0
    }
}
