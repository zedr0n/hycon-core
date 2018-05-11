import { Difficulty } from "../src/consensus/difficulty"
import { Hash } from "../src/util/hash"

describe("Difficulty", () => {
    let difficulty: Difficulty

    it("unpackMantissa: should correctly unpack mantissa from a 4 byte number", () => {
        const packedNumber = new Uint8Array([0x00, 0x01, 0x00, 0x00])
        const mantissa = Difficulty.unpackMantissa(packedNumber)
        expect(mantissa).toEqual(0x01)
    })

    it("unpackMantissa: should correctly unpack mantissa from a 4 byte number", () => {
        const packedNumber = new Uint8Array([0x00, 0x01, 0x02, 0x03])
        const mantissa = Difficulty.unpackMantissa(packedNumber)
        expect(mantissa).toEqual(0x030201)
    })

    it("decode: should decode a 4 byte number into a Difficulty object", () => {
        const packedNumber = 0x01_04_03_02
        difficulty = Difficulty.decode(packedNumber)
        const repackedNumber = difficulty.encode()
        expect(repackedNumber).toEqual(0x01_04_03_02)
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(0x01, 0x00)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode the mantissa in the first position", () => {
        difficulty = new Difficulty(0x00_00_01, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x00_00_00_01
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the second position", () => {
        difficulty = new Difficulty(0x00_01_00, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x01_00_00_01
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the third position", () => {
        difficulty = new Difficulty(0x01_00_00, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x02_00_00_01
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x01)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x01_00_00_00
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x10)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x10_00_00_00
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("greaterThan: should return true if the difficulty value is greater than the given hash", () => {
        difficulty = new Difficulty(0x0a, 0x00)
        const littleHashBytes = new Uint8Array([0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
        const littleHash = new Hash(littleHashBytes)
        const compare = difficulty.greaterThan(littleHash)
        expect(compare).toEqual(true)
    })

    it("greaterThan: should return false if the difficulty is less than the given hash", () => {
        difficulty = new Difficulty(0x0a, 0x00)
        const bigHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09])
        const bigHash = new Hash(bigHashBytes)
        const compare = difficulty.greaterThan(bigHash)
        expect(compare).toEqual(false)
    })

    it("greaterThan: should return false if the difficulty is equal to the given hash", () => {
        difficulty = new Difficulty(0x0a, 0x00)
        const equalHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                               0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                               0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                               0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a])
        const equalHash = new Hash(equalHashBytes)
        const compare = difficulty.greaterThan(equalHash)

    })

    it("multiply: should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x03
        const correctDifficulty = new Difficulty(0x03_06_09, 0x10)

        const multipliedDifficulty = difficulty.multiply(scalar)

        expect(multipliedDifficulty.encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 1 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x10
        const correctDifficulty = new Difficulty(0x10_20_30, 0x10)
        expect(difficulty.multiply(scalar).encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 2 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x01_00
        const correctDifficulty = new Difficulty(0x01_02_03, 0x11)
        expect(difficulty.multiply(scalar).encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 3 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x10_00
        const correctDifficulty = 0x11_10_20_30

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 4 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x01_00_00
        const correctDifficulty = 0x12_01_02_03

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 5 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x01_02_03, 0x10)
        const scalar = 0x10_00_00
        const correctDifficulty = 0x12_10_20_30

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 6 should handle a non-integer multiplication", () => {
        difficulty = new Difficulty(0x01_02_04, 0x10)
        const scalar = 1.5
        const correctDifficulty = 0x10_01_83_06

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 7 should handle a non-integer multiplication that shifts the exponent", () => {
        difficulty = new Difficulty(0x01_02_04, 0x10)
        const scalar = 1 / 16
        const correctDifficulty = 0x0F_10_20_40

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 8 should handle a non-integer multiplication that shifts the exponent", () => {
        difficulty = new Difficulty(0x00_00_04, 0x10)
        const scalar = 256 + 1 / 16
        const correctDifficulty = 0x0F_04_00_40

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })
})
