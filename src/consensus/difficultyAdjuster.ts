import { Difficulty } from "./../consensus/difficulty"

export class DifficultyAdjuster {
    private alpha: number
    private timeEMA: number
    private workEMA: Difficulty
    private targetTime: number

    constructor(alpha: number, targetTimeDelta: number, defaultWorkDelta: Difficulty) {
        this.alpha = alpha
        this.timeEMA = targetTimeDelta
        this.workEMA = defaultWorkDelta
        this.targetTime = targetTimeDelta
    }

    public calcNewDifficulty(timeEMA: number, workEMA: Difficulty, targetTime: number): Difficulty {
        const timeRatio = targetTime / timeEMA
        return workEMA.multiply(timeRatio)
    }

    public verifyDifficulty(prevTimeEMA: number, timeDelta: number, prevWorkEMA: Difficulty, workDelta: Difficulty, givenDifficulty: Difficulty) {
        const timeEMA: number = this.calcTimeEMA(timeDelta, prevTimeEMA, this.alpha)
        const workEMA: Difficulty = this.calcWorkEMA(workDelta, prevWorkEMA, this.alpha)
        const computedDifficulty = this.calcNewDifficulty(timeEMA, workEMA, this.targetTime)
        return (computedDifficulty.encode() === givenDifficulty.encode())
    }

    public getTimeEMA(): number {
        return this.timeEMA
    }

    public getWorkEMA(): Difficulty {
        return this.workEMA
    }

    public calcTimeEMA(newValue: number, prevEma: number, a: number) {
        const newEMA = a * newValue + (1 - a) * prevEma
        this.timeEMA = newEMA
        return newEMA
    }

    public calcWorkEMA(newValue: Difficulty, prevEma: Difficulty, a: number) {
        const oldTerm = prevEma.multiply(1 - a)
        let newEMA = newValue.multiply(a)
        newEMA = newEMA.add(oldTerm)
        this.workEMA = newEMA
        return newEMA
    }
}
