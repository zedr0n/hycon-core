
let lastDifficulty: number = 10000
let timeArr: number[] = []
let dTime: number[] = []
let ema: number = 30000
let weight: number = 0.3
const target: number = 30000
function updateDifficulty(newDifficulty: number): void {
    lastDifficulty = newDifficulty
    console.log("Difficulty: " + lastDifficulty)
}

function updateTimes(timestamp: number): void {
    timeArr.length == 0 ? dTime.push(target) : dTime.push(timestamp - timeArr[timeArr.length - 1])
    timeArr.push(timestamp)
    if (timeArr.length > 30) {
        timeArr.shift()
        dTime.shift()
    }
    ema = calcEMA()
    console.log(ema)
}

function calcEMA(): number {
    let multiplier = 1. / (30 + 1)
    let size = dTime.length
    let emas: number[] = []

    for (let i = 0; i < size; i++) {
        // Using Formula: EMA = (weight; 2/(N+1)) * (current - prevEMA) + prevEMA
        if (i == 0) emas[0] = dTime[0]
        else if (i > 0 && i < 30) {
            let sum = 0
            for (let j = 0; j <= i; j++) sum += dTime[j]
            emas[i] = sum / (i + 1)
        } else {
            emas[i] = (dTime[i] - emas[i - 1]) * multiplier + emas[i - 1]
        }
    }
    return emas[emas.length - 1]
}

export function processBlock(diff: number, timestamp: number): void {
    updateDifficulty(diff)
    updateTimes(timestamp)
}

export function getTargetDifficulty(): number {
    if (ema < target) return lastDifficulty + ((target - ema) * weight)
    else if (ema == target) return lastDifficulty
    else return lastDifficulty - ((ema - target) * weight)
}


