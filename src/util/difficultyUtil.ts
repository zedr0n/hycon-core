import { getLogger } from "log4js"

const lastDifficulty: number = 10000
const timeArr: number[] = []
const dTime: number[] = []
const ema: number = 30000
const weight: number = 0.8
const adjacent: number = 10
const target: number = 30000
// tslint:disable-next-line:no-var-requires
const dataDiff: number[][] = []
const upperLimit = 4
const logger = getLogger("difficulty")

// tslint:disable:no-bitwise

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

export function unforcedInt(intNum: number) {
    const int = intNum >> 24
    const decimal = 1.e-4 * (intNum & 0xFFFFFF)
    return int + decimal
}
