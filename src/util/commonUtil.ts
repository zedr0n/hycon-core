import Long = require("long")
export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}

export function hycontoString(value: Long): string {
    const str = value.toString()
    const index = str.length - 9
    let hycon = str.slice(0, index)
    hycon = hycon.length === 0 ? "0" : hycon
    const subCon = str.slice(index)
    return hycon + "." + subCon
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
