import * as bigInt from "big-integer"
import Long = require("long")
export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}

export function printLong(value: Long): string {
    return ""
}

export function toLong(num: number): Long {
    const str = num.toString()
    const arr = str.split(".")
    let value = Long.fromString(arr[0]).multiply(Math.pow(10, 9))
    if (arr.length > 1) {
        arr[1] = arr[1].length > 9 ? arr[1].slice(0, 9) : arr[1]
        const length = 9 - arr[1].length
        const b = Long.fromString(arr[1]).multiply(Math.pow(10, length))
        value = value.add(b)
    }
    return value
}
