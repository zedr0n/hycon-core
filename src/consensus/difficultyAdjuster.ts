import { AnyBlockHeader } from "../common/blockHeader"
import { BaseBlockHeader } from "../common/genesisHeader"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"
import { DBBlock } from "./database/dbblock"

export class DifficultyAdjuster {
    public static adjustDifficulty(previousDBBlock: DBBlock, timeStamp: number, hash?: Hash) {
        const previousTimeEMA = previousDBBlock.timeEMA

        const timeDelta = timeStamp - previousDBBlock.header.timeStamp
        const workDelta = Difficulty.decode(previousDBBlock.header.difficulty)
        const timeEMA = DifficultyAdjuster.calcTimeEMA(timeDelta, previousTimeEMA)
        const workEMA = DifficultyAdjuster.calcWorkEMA(workDelta, previousDBBlock.workEMA)

        const difficulty = DifficultyAdjuster.calcNewDifficulty(timeEMA, workEMA)
        return { difficulty, workDelta, timeEMA, workEMA }
    }

    public static calcNewDifficulty(timeEMA: number, workEMA: Difficulty, targetTime: number = DifficultyAdjuster.targetTime): Difficulty {
        let timeRatio = targetTime / timeEMA
        timeRatio = timeRatio > 3 ? 3 : timeRatio
        timeRatio = timeRatio < 0.25 ? 0.25 : timeRatio
        const newDifficulty = workEMA.multiply(timeRatio)
        return newDifficulty
    }

    public static calcTimeEMA(newValue: number, prevEMA: number, alpha: number = DifficultyAdjuster.alpha) {
        const newEMA = alpha * newValue + (1 - alpha) * prevEMA
        return newEMA
    }

    public static calcWorkEMA(newValue: Difficulty, prevEMA: Difficulty, alpha: number = DifficultyAdjuster.alpha) {
        const oldTerm = prevEMA.multiply(1 - alpha)
        let newEMA = newValue.multiply(alpha)
        newEMA = newEMA.add(oldTerm)
        return newEMA
    }

    public static verifyDifficulty(timeDelta: number, prevTimeEMA: number, workDelta: Difficulty, prevWorkEMA: Difficulty, givenDifficulty: Difficulty) {
        const timeEMA = DifficultyAdjuster.calcTimeEMA(timeDelta, prevTimeEMA)
        const workEMA = DifficultyAdjuster.calcWorkEMA(workDelta, prevWorkEMA)
        const computedDifficulty = DifficultyAdjuster.calcNewDifficulty(timeEMA, workEMA)

        return (computedDifficulty.encode() === givenDifficulty.encode())
    }

    public static getTargetTime(): number {
        return this.targetTime
    }
    private static maxDifficulty = new Hash(new Uint8Array([
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    ]))
    private static alpha: number = 0.3
    private static targetTime: number = 5000

}
