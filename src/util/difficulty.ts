import { getLogger } from "log4js"

let lastDifficulty: number = 10000
const timeArr: number[] = []
const dTime: number[] = []
let ema: number = 30000
const weight: number = 0.8
const adjacent: number = 10
const target: number = 30000
// tslint:disable-next-line:no-var-requires
const dataDiff: number[][] = []
const upperLimit = 4
const plot = require("gnu-plot")()
const logger = getLogger("difficulty")

// tslint:disable:no-bitwise
function updateDifficulty(newDifficulty: number): void {
    lastDifficulty = newDifficulty
    const float = unforcedInt(newDifficulty)
    logger.debug(`Diff: ${float}`)
    // plotDiff(float)
}

function updateTimes(timestamp: number): void {
    timeArr.length === 0 ? dTime.push(target) : dTime.push(timestamp - timeArr[timeArr.length - 1])
    timeArr.push(timestamp)
    if (timeArr.length > 10) {
        timeArr.shift()
        dTime.shift()
    }
    ema = calcEMA()
}

function calcEMA(): number {
    const multiplier = 1. / (10 + 1)
    const size = dTime.length
    const emas: number[] = []

    for (let i = 0; i < size; i++) {
        // Using Formula: EMA = (weight; 2/(N+1)) * (current - prevEMA) + prevEMA
        if (i === 0) { emas[0] = dTime[0] } else if (i > 0 && i < 10) {
            let sum = 0
            for (let j = 0; j <= i; j++) { sum += dTime[j] }
            emas[i] = sum / (i + 1)
        } else {
            emas[i] = (dTime[i] - emas[i - 1]) * multiplier + emas[i - 1]
        }
    }
    return emas[emas.length - 1]
}

function plotDiff(value: number) {
    plot.set({
        grid: "ture", xrange: "[0: ]", yrange: `[0:${upperLimit + 0.3}]`,
    })
    dataDiff.push([++dataDiff.length, value])
    plot.plot([{
        color: "red",
        data: dataDiff,
        style: "linespoints",
        title: "Difficulty",
    }])
}

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

export function difficulty(diff: number): string {
    let str = ""
    for (let i = 0; i < Math.floor(diff); i++) {
        str += "0"
    }
    str += subHex(10000 * (diff - Math.floor(diff)))
    while (str.length !== 64) {
        str += "0"
    }
    return str
}

function subHex(num: number): string {
    return Math.round((0xFFFF - (num * 1e-4) * (0xFFFF - 0x1000))).toString(16)
}

export function forcedInt(float: number) {
    const int = Math.floor(float)
    const decimal = Number(String((float - int).toPrecision(4)).replace(/0\./, ""))

    return decimal | ((int & 0xFF) << 24)
}

export function unforcedInt(intNum: number) {
    const int = intNum >> 24
    const decimal = 1.e-4 * (intNum & 0xFFFFFF)
    return int + decimal
}

export function hexToUint8Array(str: string): Uint8Array {
    const arr: number[] = []
    while (str.length >= 2) {
        arr.push(parseInt(str.substring(0, 2), 16))
        str = str.substring(2, str.length)
    }
    const result = new Uint8Array(arr)
    return result
}
