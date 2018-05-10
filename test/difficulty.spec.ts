import { Difficulty } from "../src/consensus/difficulty"

xdescribe("Difficulty", () => {
    let difficulty: Difficulty

    it("decode: should decode a 4 byte number into a Difficulty object", () => {
        expect(false).toBe(true)
    })

    it("constructor: should create a difficulty object without generating a runtime error", () => {
        difficulty = new Difficulty(1, 2)
        expect(difficulty).toBeDefined()
    })

    it("encode: should encode itself as a 4 byte number", () => {
        expect(false).toBe(true)
    })

    it("lessThan: should return true if the hash is larger than the difficulty value", () => {
        expect(false).toBe(true)
    })

    it("multiply: should return the product of the difficulty value and the number", () => {
        expect(false).toBe(true)
    })

})
