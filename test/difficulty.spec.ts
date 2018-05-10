import { Difficulty } from "../src/consensus/difficulty"
import { Hash } from "../src/util/hash"

describe("Difficulty", () => {
    let difficulty: Difficulty

    it("decode: should decode a 4 byte number into a Difficulty object", () => {
        const packedNumber = new Uint8Array([1, 2, 3, 4])
        difficulty = Difficulty.decode(packedNumber)
        const repackedNumber = difficulty.encode()
        expect(repackedNumber).toEqual(packedNumber)
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(1, 0)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode the mantissa in the proper position", () => {
        // 0x00_00_01
        difficulty = new Difficulty(1, 0)
        let encodedDifficulty = difficulty.encode()
        let correctEncodedDifficulty = new Uint8Array([0, 0, 0, 1])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        // 0x00_01_00
        difficulty = new Difficulty(256, 0)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([0, 0, 1, 0])
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)

        // 0x01_00_00
        difficulty = new Difficulty(65536, 0)
        encodedDifficulty = difficulty.encode()
        correctEncodedDifficulty = new Uint8Array([0, 1, 0, 0])
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

    it("lessThan: should return true if the difficulty value is less than the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const bigHashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 11])
        const bigHash = new Hash(bigHashBytes)
        const compare = difficulty.lessThan(bigHash)
        expect(compare).toEqual(true)
    })

    it("lessThan: should return false if the difficulty is greater than the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const littleHashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 9])
        const littleHash = new Hash(littleHashBytes)
        const compare = difficulty.lessThan(littleHash)
        expect(compare).toEqual(false)
    })

    it("pack: should properly pack a Uint8Array to 4 bytes", () => {
        const hashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                          0, 0, 0, 0, 0, 0, 0, 0,
                                          0, 0, 0, 0, 0, 0, 0, 0,
                                          0, 0, 0, 0, 0, 0, 0, 9])
        const packedHashBytes = Difficulty.pack(hashBytes)
        const correctHashBytes = new Uint8Array([0, 0, 0, 9])
        expect(packedHashBytes).toEqual(correctHashBytes)
    })

    xit("lessThanEq: should return true if the difficulty is equal to the given hash", () => {
        difficulty = new Difficulty(10, 0)
        const equalHashBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 10])
        const equalHash = new Hash(equalHashBytes)

    })

    xit("multiply: should return the product of the difficulty value and the number", () => {
        expect(false).toBe(true)
    })

})
