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
        const correctEncodedDifficulty = 0x20000000
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("encode: should encode the exponent in the proper position", () => {
        difficulty = new Difficulty(0x00, 0x10)
        const encodedDifficulty = difficulty.encode()
        const correctEncodedDifficulty = 0x20000000
        expect(encodedDifficulty).toEqual(correctEncodedDifficulty)
    })

    it("greaterThan: TEST should return true if the difficulty(0x2303ff, 0x01) and the last five-byte are 0x08, 0x0b, 0xd5, 0x1a, 0x00", () => {
        difficulty = new Difficulty(0x2303ff, 0x01)
        const bigHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x08, 0x0b, 0xd5, 0x1a, 0x00])
        const bigHash = new Hash(bigHashBytes)
        const compare = difficulty.acceptable(bigHash)
        expect(compare).toEqual(true)
    })

    it("greaterThan: 12 should return false if the difficulty(0x0a, 0x00) and the last two-byte are 0xff, 0x0a", () => {
        difficulty = new Difficulty(0x0a, 0x00)
        const bigHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x0a])
        const bigHash = new Hash(bigHashBytes)
        const compare = difficulty.acceptable(bigHash)
        expect(compare).toEqual(false)
    })

    it("greaterThan: should return false if difficulty(0x0a00, 0x00) and the last two-byte are 0xff, 0x0a", () => {
        difficulty = new Difficulty(0x0a00, 0x00)
        const equalHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x0a])
        const equalHash = new Hash(equalHashBytes)
        const compare = difficulty.acceptable(equalHash)
        expect(compare).toEqual(false)
    })

    it("greaterThan: should return true if difficulty(0x0a00, 0x00) and the last three-byte are 0xff, 0x09, 0x00", () => {
        difficulty = new Difficulty(0x0a00, 0x00)
        const equalHashBytes = new Uint8Array(
            [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x09, 0x00])
        const equalHash = new Hash(equalHashBytes)
        const compare = difficulty.acceptable(equalHash)
        expect(compare).toEqual(true)
    })

    it("greaterThan: should true if difficulty(0x0120, 0x02) and the last five-byte are 0xff, 0x01, 0x1f, 0x00, 0x00", () => {
        difficulty = new Difficulty(0x0120, 0x02)
        const equalHashBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0xff, 0xff, 0x1f, 0x01, 0x00, 0x00])
        const equalHash = new Hash(equalHashBytes)
        const compare = difficulty.acceptable(equalHash)
        expect(compare).toEqual(true)
    })

    xit("getMinerParameters: offset should be 32 if exponent is 0x10 and a mantisa is 0x010203", () => {
        difficulty = new Difficulty(0x010203, 0x10)
        const params = difficulty.getMinerTarget()
        // expect(params).toEqual(32)
    })

    xit("getMinerParameters: offset should be 0 if exponent is 0x00 and a mantisa is 0x00bbbb", () => {
        difficulty = new Difficulty(0x00bbbb, 0x00)
        const params = difficulty.getMinerTarget()
        // expect(params).toEqual(0)
    })

    xit("getMinerParameters: offset should be 2 if an exponent is a 0x00 and mantisa is 0x012300", () => {
        difficulty = new Difficulty(0x012300, 0x00)
        const params = difficulty.getMinerTarget()
        // expect(params.offset).toEqual(2)
    })

    xit("getMinerParameters: target should be '0111ff' if a mantisa is 0x000111", () => {
        difficulty = new Difficulty(0x000111, 0x00)
        const params = difficulty.getMinerTarget()
        // expect(params.target).toEqual("0111ff")
    })

    xit("getMinerParameters: target should be '1000ff' if a mantisa is 0x1000ff", () => {
        difficulty = new Difficulty(0x1000ff, 0x00)
        const params = difficulty.getMinerTarget()
        // expect(params.target).toEqual("1000ff")
    })

    // it("getMinerParameters: offset === 0 and target should be '000000' if a mantisa is 0x000000", () => {
    //     difficulty = new Difficulty( 0x000000, 0x00)
    //     const params = difficulty.getMinerParameters()
    //     expect(params.offset).toEqual(0)
    //     expect(params.target).toEqual("000000")
    // })

    xit("getMinerParameters: offset === 2 && target should be '0123ff' if a mantisa is 0x012300", () => {
        difficulty = new Difficulty(0x012300, 0x00)
        const params = difficulty.getMinerTarget()
        // expect(params.offset).toEqual(2)
        // expect(params.target).toEqual("0123ff")
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

    it("add: 1 should add two difficulty values together", () => {
        const difficulty1 = new Difficulty(0x000001, 0x00)
        const difficulty2 = new Difficulty(0x000001, 0x00)
        const correctSum = 0x00000002

        const sum = difficulty1.add(difficulty2)

        expect(sum.encode()).toEqual(correctSum)
    })

    it("add: 2 should add two difficulty values that shift the exponent", () => {
        const difficulty1 = new Difficulty(0xFFFFFF, 0x00)
        const difficulty2 = new Difficulty(0x000001, 0x00)
        const correctSum = 0x03000001

        const sum = difficulty1.add(difficulty2)

        expect(sum.encode()).toEqual(correctSum)
    })

    it("add: 3 should add two difficulty values with non-overlapping mantissas", () => {
        const difficulty1 = new Difficulty(0x000001, 0x10)
        const difficulty2 = new Difficulty(0x000001, 0x00)
        const correctSum = 0x10010001

        const sum = difficulty1.add(difficulty2)

        expect(sum.encode()).toEqual(correctSum)
    })

    it("add: 4 should remain the same value if the precision cannot capture the new value", () => {
        const difficulty1 = new Difficulty(0x000001, 0x24)
        const difficulty2 = new Difficulty(0x000001, 0x00)
        const correctSum = 0x24000001

        const sum = difficulty1.add(difficulty2)

        expect(sum.encode()).toEqual(correctSum)
    })
})
