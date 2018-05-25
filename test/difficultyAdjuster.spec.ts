import { Difficulty } from "../src/consensus/difficulty"
import { DifficultyAdjuster } from "../src/consensus/difficultyAdjuster"

describe("DifficultyAdjuster", () => {

        it("calcTimeEMA: should calculate the latest EMAs from a time delta", () => {
                const prevTimeEMA = 30
                const newTime = 40

                const ema = DifficultyAdjuster.calcTimeEMA(newTime, prevTimeEMA, 0.1)

                expect(ema).toEqual(31)
        })

        it("calcWorkEMA: 1 should caculate the latest EMAs from a difficulty delta", () => {
                const prevWorkEMA = new Difficulty(0x000001, 0x10)
                const newWork = new Difficulty(0x000001, 0x14)
                const correctWorkEMA = new Difficulty(0x19999A, 0x11)

                const ema = DifficultyAdjuster.calcWorkEMA(newWork, prevWorkEMA, 0.1)

                expect(ema.encode()).toEqual(correctWorkEMA.encode())
        })

        it("calcWorkEMA: 2 should calculate the latest EMAs from a difficulty delta", () => {
                const prevWorkEMA = new Difficulty(0x0000FF, 0x15)

                const newWork = new Difficulty(0x0000FF, 0x15)
                const correctWorkEMA = new Difficulty(0x0000FF, 0x15)

                const ema = DifficultyAdjuster.calcWorkEMA(newWork, prevWorkEMA, 0.1)

                expect(ema.encode()).toEqual(correctWorkEMA.encode())
        })

        it("calcNewDifficulty: 1 should correctly calculate a new difficulty value", () => {
                const prevWorkEMA = new Difficulty(0x0000FF, 0x15)
                const prevTimeEMA = 15
                const correctDifficulty = new Difficulty(0x0001FE, 0x15)
                const newDifficulty = DifficultyAdjuster.calcNewDifficulty(prevTimeEMA, prevWorkEMA, 30)

                expect(newDifficulty.encode()).toEqual(correctDifficulty.encode())
        })

        it("calcNewDifficulty: 2 should correctly calculate a new difficulty value", () => {
                const prevWorkEMA = new Difficulty(0x0001FE, 0x15)

                const prevTimeEMA = 60
                const correctDifficulty = new Difficulty(0x0000FF, 0x15)
                const newDifficulty = DifficultyAdjuster.calcNewDifficulty(prevTimeEMA, prevWorkEMA, 30)

                expect(newDifficulty.encode()).toEqual(correctDifficulty.encode())
        })

        xit("calcNewDifficuly: 3 should correctly calculate a new difficulty value", () => {
                const timeRatio = 0.7485525341780098
                const difficulty = new Difficulty(0xb684ad, 8)

                const result = difficulty.multiply(timeRatio)

        })

        xit("getTarget: Should get the target", () => {
                const difficulty = new Difficulty(0x01, 0x0)
                const target = Difficulty.getTarget(0x1, 0x0)
        })
})
