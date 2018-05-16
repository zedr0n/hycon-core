import { BaseBlockHeader } from "../common/genesisHeader"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"

export class DifficultyAdjuster {
    public static calcNewDifficulty(timeEMA: number, workEMA: Difficulty): Difficulty {
        const timeRatio = DifficultyAdjuster.targetTime / timeEMA
        const newDifficulty = workEMA.multiply(timeRatio)
        if (newDifficulty.greaterThan(DifficultyAdjuster.maxDifficulty)) {
            return new Difficulty(0xFF_FF_FF, 0x1d)
        }
        return newDifficulty
    }

    public static calcTimeEMA(newValue: number, prevEMA: number) {
        const newEMA = DifficultyAdjuster.alpha * newValue + (1 - DifficultyAdjuster.alpha) * prevEMA
        return newEMA
    }

    public static calcWorkEMA(newValue: Difficulty, prevEMA: Difficulty) {
        const oldTerm = prevEMA.multiply(1 - DifficultyAdjuster.alpha)
        let newEMA = newValue.multiply(DifficultyAdjuster.alpha)
        newEMA = newEMA.add(oldTerm)
        return newEMA
    }

    public static verifyDifficulty(timeDelta: number, prevTimeEMA: number, workDelta: Difficulty, prevWorkEMA: Difficulty, givenDifficulty: Difficulty) {
        const timeEMA: number = DifficultyAdjuster.calcTimeEMA(timeDelta, prevTimeEMA)
        const workEMA: Difficulty = DifficultyAdjuster.calcWorkEMA(workDelta, prevWorkEMA)
        const computedDifficulty = DifficultyAdjuster.calcNewDifficulty(timeEMA, workEMA)
        return (computedDifficulty.encode() === givenDifficulty.encode())
    }
    private static maxDifficulty = new Hash(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))
    private static alpha: number = 0.1
    private static targetTime: number = 30

}
