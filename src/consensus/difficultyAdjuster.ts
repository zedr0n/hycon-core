import { Difficulty } from "./../consensus/difficulty"

export class DifficultyAdjuster {
    private timeEMA: number
    private workEMA: Difficulty
    private alpha: number
    private timeDeltas: number[]
    private workDeltas: Difficulty[]

    constructor(alpha: number, defaultTimeDelta: number, defaultWorkDelta: Difficulty) {
        this.timeEMA = defaultTimeDelta
        this.workEMA = defaultWorkDelta
        this.alpha = alpha
        this.timeDeltas = [defaultTimeDelta]
        this.workDeltas = [defaultWorkDelta]
    }

    public calcEMA(newValue: number|Difficulty, prevEma: number|Difficulty, a: number): number|Difficulty {
        if ((newValue instanceof Difficulty) && (prevEma instanceof Difficulty)) {
            return newValue.multiply(a).add(prevEma.multiply(1 - a))
        } else if ((typeof(newValue) === "number" && (typeof(prevEma) === "number"))) {
            return a * newValue + (1 - a) * prevEma
        } else {
            throw Error("newValue and prevEma arguments must be the same type")
        }

    }

    public getTimeEMA(): number {
        return this.timeEMA
    }

    public getWorkEMA(): Difficulty {
        return this.workEMA
    }
}
