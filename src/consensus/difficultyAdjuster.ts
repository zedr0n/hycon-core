import { BaseBlockHeader } from "../common/genesisHeader"
import { Hash } from "../util/hash"
import { Difficulty } from "./../consensus/difficulty"

export class DifficultyAdjuster {
    private alpha: number
    private timeEMA: number
    private workEMA: Difficulty
    private targetTime: number
    private maxDifficulty = new Hash(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                                    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                                    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
                                                    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))

    constructor(alpha: number, targetTimeDelta: number, defaultWorkDelta: Difficulty) {
        this.alpha = alpha
        this.timeEMA = targetTimeDelta
        this.workEMA = defaultWorkDelta
        this.targetTime = targetTimeDelta
    }

    public calcNewDifficulty(): Difficulty {
        const timeRatio = this.targetTime / this.timeEMA
        const newDifficulty = this.workEMA.multiply(timeRatio)
        if (newDifficulty.greaterThan(this.maxDifficulty)) {
            return new Difficulty(0xFF_FF_FF, 0x1d)
        }

        return newDifficulty
    }

    public verifyDifficulty(prevTimeEMA: number, timeDelta: number, prevWorkEMA: Difficulty, workDelta: Difficulty, givenDifficulty: Difficulty) {
        const timeEMA: number = this.calcTimeEMA(timeDelta)
        const workEMA: Difficulty = this.calcWorkEMA(workDelta)
        const computedDifficulty = this.calcNewDifficulty()
        return (computedDifficulty.encode() === givenDifficulty.encode())
    }

    public getTimeEMA(): number {
        return this.timeEMA
    }

    public getWorkEMA(): Difficulty {
        return this.workEMA
    }

    public calcTimeEMA(newValue: number) {
        const newEMA = this.alpha * newValue + (1 - this.alpha) * this.timeEMA
        this.timeEMA = newEMA
        return newEMA
    }

    public calcWorkEMA(newValue: Difficulty) {
        const oldTerm = this.workEMA.multiply(1 - this.alpha)
        let newEMA = newValue.multiply(this.alpha)
        newEMA = newEMA.add(oldTerm)
        this.workEMA = newEMA
        return newEMA
    }

    public updateEMAs(header: BaseBlockHeader, timeStamp: number) {
        if (typeof(header.timeStamp) === "number") {
            const newTime = timeStamp - header.timeStamp
            this.calcTimeEMA(newTime)
            this.calcWorkEMA(Difficulty.decode(header.difficulty))
        } else {
            throw new Error("header timestamp is not a number")
        }
    }

    public resetTimeEMA(timeEMA: number) {
        this.timeEMA = timeEMA
    }

    public resetWorkEMA(workEMA: Difficulty) {
        this.workEMA = workEMA
    }
}
