
import { Buffer } from "buffer"
import { getLogger } from "log4js"
const assert = require("assert")
const logger = getLogger("Packet")

export enum State {
    Head = 1,
    Body = 2,
}
export const HeaderSize = 64

export class Packet {

    // 4 bytes: magic key
    // 4 bytes: length
    // 36 bytes: guid
    // 20 bytes: reserved
    public head = new Buffer(HeaderSize)
    public body = new Buffer(0)

    constructor() {
        Buffer.from([0x47, 0x4c, 0x53, 0x00]).copy(this.head, 0, 0, 4)
    }

    public setGuid(src2: string) {
        const src = Buffer.from(src2)
        assert(36 === src.length)
        src.copy(this.head, 8, 0, 36)
    }

    public getGuid(): string {
        const ret = new Buffer(36)
        this.head.copy(ret, 0, 8, 8 + 36)
        return ret.toString()
    }

    public pushInt(v: number) {
        const tmp = new Buffer(4)
        tmp.writeInt32LE(v, 0)
        this.body = Buffer.concat([this.body, tmp])
    }

    public popInt() {
        const tmp = new Buffer(4)
        this.body.copy(tmp, 0, 0, 4)
        const ret = tmp.readInt32LE(0)
        this.body = this.body.slice(4, this.body.length)
        return ret
    }

    public pushBuffer(src: Buffer) {
        this.pushInt(src.length)
        this.body = Buffer.concat([this.body, src])
    }

    public popBuffer() {
        const length = this.popInt()
        const ret = new Buffer(length)
        this.body.copy(ret, 0, 0, length)
        this.body = this.body.slice(length, this.body.length)
        return ret
    }

    public pack() {
        const size = this.body.length
        const tmp = new Buffer(4)
        tmp.writeInt32LE(size, 0)
        tmp.copy(this.head, 4, 0, 4)
        assert(this.head.length === HeaderSize)
        return Buffer.concat([this.head, this.body])
    }

    public unpack() {
        assert(this.head.length === HeaderSize)
        let length = 0
        length = this.head.readInt32LE(4)
        this.body = new Buffer(length)
    }

    public test() {

    }
    public show() {
        logger.debug(`Head=${this.head.toString("hex")}`)
        logger.debug(`Body=${this.body.toString("hex")}`)
    }

}
