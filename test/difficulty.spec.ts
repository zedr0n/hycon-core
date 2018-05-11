import { Difficulty } from "../src/consensus/difficulty"
import { Hash } from "../src/util/hash"

fdescribe("Difficulty", () => {
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
        expect(repackedNumber).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]))
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(0x01, 0x00)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode the mantissa in the first position", () => {
        difficulty = new Difficulty(0x00_00_01, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = new Uint8Array([0x00, 0x01, 0x00, 0x00])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the second position", () => {
        difficulty = new Difficulty(0x00_01_00, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = new Uint8Array([0x00, 0x00, 0x01, 0x00])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the third position", () => {
        difficulty = new Difficulty(0x01_00_00, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = new Uint8Array([0x00, 0x00, 0x00, 0x01])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x01)
        let encodedDifficulty = difficulty.encode()
        let correctEncodedDifficulty = new Uint8Array([0x01, 0x00, 0x00, 0x00])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        difficulty = new Difficulty(0x00, 0x10)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([0x10, 0x00, 0x00, 0x00])
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
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 3
        const correctDifficulty = new Difficulty(0x030609, 0x10)
        expect(difficulty.multiply(scalar).encode()).toEqual(correctDifficulty.encode())
    })

})
