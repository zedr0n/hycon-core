export function zeroPad(input: string, length: number) {
    return (Array(length + 1).join("0") + input).slice(-length)
}
