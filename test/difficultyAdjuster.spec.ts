import { Difficulty } from "../src/consensus/difficulty"
import { DifficultyAdjuster } from "../src/consensus/difficultyAdjuster"

describe("calcEMA", () => {

    it("calcEMA: should calculate the latest EMAs from a list of time deltas", () => {
        const defaultEma = 30
        const newTime = 40
        const alpha = .1
        const diffDelta = new Difficulty(0x00_00_01, 0x10)

        const da = new DifficultyAdjuster(alpha, defaultEma, diffDelta)

        const ema = da.calcEMA(newTime, defaultEma, alpha)

        expect(ema).toEqual(31)
    })
})
