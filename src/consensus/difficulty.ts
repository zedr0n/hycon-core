import { Hash } from "../util/hash"

export class Difficulty {

    public static decode(num: number): Difficulty {
        return new Difficulty(0, 0)
    }
    private e: number
    private m: number

    constructor(e: number, m: number) {
        this.e = e
        this.m = m
    }

    public encode(): number {
        return 0
    }

    public lessThan(hash: Hash): boolean {
        return false
    }

    public multiply(num: number) {
        return 0
    }
}
