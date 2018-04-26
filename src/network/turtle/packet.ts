import { Buffer } from 'buffer'
import { getLogger } from 'log4js'
const logger = getLogger('Packet')

export enum State {
    Head = 1,
    Body = 2
}
export const HeaderSize = 8

export class Packet {

    public head = new Buffer(8)
    public body = new Buffer(0)

    constructor() {
        Buffer.from([0x47, 0x4c, 0x53, 0x00]).copy(this.head, 0, 0, 4)
    }

    public pushInt(v: number) {
        let tmp = new Buffer(4)
        tmp.writeInt32LE(v, 0)
        this.body = Buffer.concat([this.body, tmp])
    }

    public popInt() {
        let tmp = new Buffer(4)
        this.body.copy(tmp, 0, 0, 4)
        let ret = tmp.readInt32LE(0)
        this.body = this.body.slice(4, this.body.length)
        return ret
    }

    public pushBuffer(src: Buffer) {
        this.pushInt(src.length)
        this.body = Buffer.concat([this.body, src])
    }

    public popBuffer() {
        let length = this.popInt()
        let ret = new Buffer(length)
        this.body.copy(ret, 0, 0, length)
        this.body = this.body.slice(length, this.body.length)
        return ret
    }

    public pack() {
        let size = this.body.length
        const tmp = new Buffer(4)
        tmp.writeInt32LE(size, 0)
        tmp.copy(this.head, 4, 0, 4)

        return Buffer.concat([this.head, this.body])
    }

    public unpack() {
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
