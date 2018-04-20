// Utility File for Providing the Utility Functions.
// tslint:disable:no-bitwise
// tslint:disable-next-line:no-var-requires
const assert = require("assert")
export function compare(a: (Buffer | Uint8Array), b: (Buffer | Uint8Array)) {
    assert(a.length === b.length)
    for (let i = 0; i < a.length; i++) {
        if (a[i] < b[i]) {
            return -1
        }
        if (a[i] > b[i]) {
            return 1
        }
    }
    return 0
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
