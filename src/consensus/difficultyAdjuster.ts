import { BaseBlockHeader } from "../common/genesisHeader"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"

export class DifficultyAdjuster {
    public static calcNewDifficulty(timeEMA: number, workEMA: Difficulty): Difficulty {
        let timeRatio = DifficultyAdjuster.targetTime / timeEMA
        timeRatio = timeRatio > 3 ? 3 : timeRatio
        timeRatio = timeRatio < 0.25 ? 0.25 : timeRatio
        const newDifficulty = workEMA.multiply(timeRatio)
        if (newDifficulty.greaterThan(DifficultyAdjuster.maxDifficulty)) {
            return new Difficulty(0xFFFFFF, 0x1d)
        } else if (Difficulty.defaultDifficulty.greaterThan(newDifficulty)) {
            return Difficulty.defaultDifficulty
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

    public static getTargetTime(): number {
        return this.targetTime
    }
    private static maxDifficulty = new Hash(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))
    private static alpha: number = 0.3
    private static targetTime: number = 5000

}
