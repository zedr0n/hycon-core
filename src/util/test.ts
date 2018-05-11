import * as Difficulty from "./difficulty"

function checkBlock() {
    const interval: number = Math.floor(200 * Math.random())
    let direction: number
    Math.random() < 0.5 ? direction = -1 : direction = 1
    const waitTime: number = 1000 + (interval * direction)
    Difficulty.processBlock(Difficulty.getTargetDifficulty(), Date.now())
    setTimeout(() => {
        checkBlock()
    }, waitTime)
}

checkBlock()
