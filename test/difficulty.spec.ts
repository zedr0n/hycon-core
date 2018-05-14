import { Difficulty } from "../src/consensus/difficulty"
import { Hash } from "../src/util/hash"

describe("Difficulty", () => {
    let difficulty: Difficulty

    it("decode: should decode a 4 byte number into a Difficulty object", () => {
        const packedNumber = 0x01040302
        difficulty = Difficulty.decode(packedNumber)
        const repackedNumber = difficulty.encode()
        expect(repackedNumber).toEqual(0x01040302)
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(0x01, 0x00)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode the mantissa in the first position", () => {
        difficulty = new Difficulty(0x000001, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x00000001
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the second position", () => {
        difficulty = new Difficulty(0x000100, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x01000001
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the mantissa in the third position", () => {
        difficulty = new Difficulty(0x010000, 0x00)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x02000001
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x01)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x01000000
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x10)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x10000000
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

    it("getMinerParameters: offset should be 33 if expornt is 0x10 and a mantisa is 0x010203", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const params = difficulty.getMinerParameters()
        expect(params.offset).toEqual(33)
    })

    it("getMinerParameters: offset should be 2 if expornt is 0x00 and a mantisa is 0x00bbbb", () => {
        difficulty = new Difficulty(0x00bbbb, 0x00)
        const params = difficulty.getMinerParameters()
        expect(params.offset).toEqual(2)
    })

    it("getMinerParameters: target should be '111f' if a mantisa is 0x000111", () => {
        difficulty = new Difficulty( 0x000111, 0x00)
        const params = difficulty.getMinerParameters()
        expect(params.target).toEqual("111f")
    })

    it("getMinerParameters: target should be '1000' if a mantisa is 0x1000ff", () => {
        difficulty = new Difficulty( 0x1000ff, 0x00)
        const params = difficulty.getMinerParameters()
        expect(params.target).toEqual("1000")
    })

    it("getMinerParameters: target should be '0fff' if a mantisa is 0x000000", () => {
        difficulty = new Difficulty( 0x000000, 0x00)
        const params = difficulty.getMinerParameters()
        expect(params.target).toEqual("0fff")
    })

    it("getMinerParameters: target should be '123f' if a mantisa is 0x0123ff", () => {
        difficulty = new Difficulty( 0x0123ff, 0x00)
        const params = difficulty.getMinerParameters()
        expect(params.target).toEqual("123f")
    })

    it("multiply: should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x03
        const correctDifficulty = new Difficulty(0x030609, 0x10)

        const multipliedDifficulty = difficulty.multiply(scalar)

        expect(multipliedDifficulty.encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 1 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x10
        const correctDifficulty = new Difficulty(0x102030, 0x10)
        expect(difficulty.multiply(scalar).encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 2 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x0100
        const correctDifficulty = new Difficulty(0x010203, 0x11)
        expect(difficulty.multiply(scalar).encode()).toEqual(correctDifficulty.encode())
    })

    it("multiply: 3 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x1000
        const correctDifficulty = 0x11102030

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 4 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x010000
        const correctDifficulty = 0x12010203

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 5 should return the product of the difficulty value and the number", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const scalar = 0x100000
        const correctDifficulty = 0x12102030

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 6 should handle a non-integer multiplication", () => {
        difficulty = new Difficulty(0x010204, 0x10)
        const scalar = 1.5
        const correctDifficulty = 0x10018306

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 7 should handle a non-integer multiplication that shifts the exponent", () => {
        difficulty = new Difficulty(0x010204, 0x10)
        const scalar = 1 / 16
        const correctDifficulty = 0x0F102040

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })

    it("multiply: 8 should handle a non-integer multiplication that shifts the exponent", () => {
        difficulty = new Difficulty(0x000004, 0x10)
        const scalar = 256 + 1 / 16
        const correctDifficulty = 0x0F040040

        const product = difficulty.multiply(scalar)

        expect(product.encode()).toEqual(correctDifficulty)
    })
})
