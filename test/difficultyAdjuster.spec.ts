import { Difficulty } from "../src/consensus/difficulty"
import { DifficultyAdjuster } from "../src/consensus/difficultyAdjuster"

describe("DifficultyAdjuster", () => {

    it("calcTimeEMA: should calculate the latest EMAs from a time delta", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const defaultWorkDelta = new Difficulty(0x00_00_01, 0x10)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, defaultWorkDelta)

        const newTime = 40

        const ema = adjuster.calcTimeEMA(newTime, targetTimeDelta, alpha)

        expect(ema).toEqual(31)
    })

    it("calcWorkEMA: 1 should caculate the latest EMAs from a difficulty delta", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const defaultWorkDelta = new Difficulty(0x00_00_01, 0x10)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, defaultWorkDelta)

        const newWork = new Difficulty(0x00_00_01, 0x14)
        const correctWorkEMA = new Difficulty(0x00_02_80, 0x13)

        const ema = adjuster.calcWorkEMA(newWork, defaultWorkDelta, alpha)

        expect(ema.encode()).toEqual(correctWorkEMA.encode())
    })

    it("calcWorkEMA: 2 should calculate the latest EMAs from a difficulty delta", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const prevWorkEMA = new Difficulty(0x00_00_FF, 0x15)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, prevWorkEMA)

        const newWork = new Difficulty(0x00_00_FF, 0x15)
        const correctWorkEMA = new Difficulty(0x00_00_FF, 0x15)

        const ema = adjuster.calcWorkEMA(newWork, prevWorkEMA, alpha)

        expect(ema.encode()).toEqual(correctWorkEMA.encode())
    })

    it("calcNewDifficulty: 1 should correctly calculate a new difficulty value", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const prevWorkEMA = new Difficulty(0x00_00_FF, 0x15)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, prevWorkEMA)

        const newTimeEMA = 15
        const correctDifficulty = new Difficulty(0x00_01_FE, 0x15)
        const newDifficulty = adjuster.calcNewDifficulty(newTimeEMA, prevWorkEMA, targetTimeDelta)

        expect(newDifficulty.encode()).toEqual(correctDifficulty.encode())
    })

    it("calcNewDifficulty: 2 should correctly calculate a new difficulty value", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const prevWorkEMA = new Difficulty(0x00_01_FE, 0x15)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, prevWorkEMA)

        const newTimeEMA = 60
        const correctDifficulty = new Difficulty(0x00_00_FF, 0x15)
        const newDifficulty = adjuster.calcNewDifficulty(newTimeEMA, prevWorkEMA, targetTimeDelta)

        expect(newDifficulty.encode()).toEqual(correctDifficulty.encode())
    })

    it("verifyDifficulty: 1 should return true when a valid difficulty is presented", () => {
        const alpha = .1
        const targetTimeDelta = 30
        const defaultWorkDelta = new Difficulty(0x00_00_FF, 0x15)
        const adjuster = new DifficultyAdjuster(alpha, targetTimeDelta, defaultWorkDelta)

        const prevTimeEMA = 30
        const timeDelta = 30
        const prevWorkEMA = new Difficulty(0x00_00_FF, 0x15)
        const workDelta = new Difficulty(0x00_00_FF, 0x15)
        const givenDifficulty = new Difficulty(0x00_00_FF, 0x15)
        const verifyResult = adjuster.verifyDifficulty(prevTimeEMA, timeDelta, prevWorkEMA, workDelta, givenDifficulty)

        expect(verifyResult).toEqual(true)
    })
})
