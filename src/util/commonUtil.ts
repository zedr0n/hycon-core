import * as bigInt from "big-integer"
import Long = require("long")

function toBigInt(num: Long) {
    return bigInt(num.high.toString() + num.low.toString())
}

export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}

export function rightPad(input: string, length: number) {
    return (input + Array(length + 1 - input.length).join("0")).slice(-length)
}

export function longToString(value: Long) {
    return value.high + "." + value.low
}

export function toLong(num: number): Long {
    const arr = num.toString().split(".")
    let low = rightPad("", 9)
    if (arr.length > 1) {
        arr[1] = arr[1].length > 9 ? arr[1].toString().slice(0, 9) : arr[1]
        low = rightPad(arr[1].toString(), 9)
    }
    return new Long(Number(low), Number(arr[0]), true)
}

export function add(a: Long, b: Long) {
    const value = toBigInt(a).add(toBigInt(b))
    return new Long(Number(value.mod(10 ** 9)), Number(value.divide(10 ** 9)), true)
}

export function sub(a: Long, b: Long) {
    const value = toBigInt(a).subtract(toBigInt(b))
    return new Long(Number(value.mod(10 ** 9)), Number(value.divide(10 ** 9)), true)
}

export function comp(a: Long, b: Long) {
    return toBigInt(a).compare(toBigInt(b))
}
