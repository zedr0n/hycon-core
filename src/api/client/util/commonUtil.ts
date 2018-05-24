import Long = require("long")
export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}

export function hycontoString(value: Long): string {
    const valString = value.toString()
    const integer = (valString.length >= 10) ? valString.slice(0, -9) : "0"
    const decimal = (valString.length >= 10) ? valString.slice(-9) : zeroPad(valString, 9)
    return integer + "." + decimal
}

export function hyconfromString(val: string): Long {
    const arr = val.toString().split(".")
    let hycon = Long.fromString(arr[0], true).multiply(Math.pow(10, 9))
    if (arr.length > 1) {
        arr[1] = arr[1].length > 9 ? arr[1].slice(0, 9) : arr[1]
        const subCon = Long.fromString(arr[1], true).multiply(Math.pow(10, 9 - arr[1].length))
        hycon = hycon.add(subCon)
    }
    return hycon.toUnsigned()
}
