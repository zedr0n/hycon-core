import { getLogger } from "log4js"

let lastDifficulty: number = 10000
const timeArr: number[] = []
const dTime: number[] = []
let ema: number = 30000
const alpha: number = .9
const weight: number = 0.8
const adjacent: number = 10
const target: number = 30000
// tslint:disable-next-line:no-var-requires
const dataDiff: number[][] = []
const upperLimit = 4
const logger = getLogger("difficulty")

// tslint:disable:no-bitwise
export function processBlock(diff: number, timestamp: number = Date.now()): void {
    if (diff <= 0) { diff = lastDifficulty }
    updateDifficulty(diff)
    updateTimes(timestamp)
}

export function getTargetDifficulty(): number {
    if (ema < target) {
        return lastDifficulty + ((target - ema) * weight)
    } else if (ema === target) {
        return lastDifficulty
    } else {
        return lastDifficulty - ((ema - target) * weight)
    }
}

export function updateDifficulty(newDifficulty: number): void {
    lastDifficulty = newDifficulty
    const float = unforcedInt(newDifficulty)
    logger.debug(`Diff: ${float}`)
    // plotDiff(float)
}

export function updateTimes(timestamp: number): void {
    const timeDelta = timestamp - timeArr[timeArr.length - 1]
    timeArr.length === 0 ? dTime.push(target) : dTime.push(timeDelta)
    timeArr.push(timestamp)
    if (timeArr.length > 10) {
        timeArr.shift()
        dTime.shift()
    }
    ema = calcEMA(timeDelta, ema, alpha)
}

export function calcEMA(newTime: number, prevEma: number, a: number): number {
    return a * newTime + (1 - a) * prevEma
}

export function unforcedInt(intNum: number) {
    const int = intNum >> 24
    const decimal = 1.e-4 * (intNum & 0xFFFFFF)
    return int + decimal
}
