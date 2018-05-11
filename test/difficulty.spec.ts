import { Difficulty } from "../src/consensus/difficulty"
import { Hash } from "../src/util/hash"

describe("Difficulty", () => {
    let difficulty: Difficulty

    it("unpackMantissa: should correctly unpack mantissa from a 4 byte number", () => {
        const packedNumber = new Uint8Array([0, 1, 0, 0])
        const mantissa = Difficulty.unpackMantissa(packedNumber)
        expect(mantissa).toEqual(1)
    })

    it("unpackMantissa: should correctly unpack mantissa from a 4 byte number", () => {
        const packedNumber = new Uint8Array([0, 1, 2, 3])
        const mantissa = Difficulty.unpackMantissa(packedNumber)
        expect(mantissa).toEqual(197121)
    })

    it("decode: should decode a 4 byte number into a Difficulty object", () => {
        const packedNumber = new Uint8Array([1, 2, 3, 4])
        difficulty = Difficulty.decode(packedNumber)
        const repackedNumber = difficulty.encode()
        expect(repackedNumber).toEqual(new Uint8Array([1, 2, 3, 4]))
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(1, 0)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode the mantissa in the proper position", () => {
        // 0x00_00_01
        difficulty = new Difficulty(1, 0)
        let encodedDifficulty = difficulty.encode()
        let correctEncodedDifficulty = new Uint8Array([0, 1, 0, 0])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        // 0x00_01_00
        difficulty = new Difficulty(256, 0)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([0, 0, 1, 0])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        // 0x01_00_00
        difficulty = new Difficulty(65536, 0)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([0, 0, 0, 1])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0, 1)
        let encodedDifficulty = difficulty.encode()
        let correctEncodedDifficulty = new Uint8Array([1, 0, 0, 0])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        difficulty = new Difficulty(0, 16)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([16, 0, 0, 0])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("greaterThan: should return true if the difficulty value is greater than the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const littleHashBytes = new Uint8Array([9, 0, 0, 0, 0, 0, 0, 0,
                                             0, 0, 0, 0, 0, 0, 0, 0,
                                             0, 0, 0, 0, 0, 0, 0, 0,
                                             0, 0, 0, 0, 0, 0, 0, 0])
        const littleHash = new Hash(littleHashBytes)
        const compare = difficulty.greaterThan(littleHash)
        expect(compare).toEqual(true)
    })

    it("greaterThan: should return false if the difficulty is less than the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const littleHashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 9])
        const littleHash = new Hash(littleHashBytes)
        const compare = difficulty.greaterThan(littleHash)
        expect(compare).toEqual(false)
    })

    xit("greaterThan: should return false if the difficulty is equal to the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const equalHashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 10])
        const equalHash = new Hash(equalHashBytes)
        const compare = difficulty.greaterThan(equalHash)

    })

    xit("multiply: should return the product of the difficulty value and the number", () => {
        expect(false).toBe(true)
    })

})
