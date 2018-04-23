import { Buffer } from 'buffer'
import { Packet, State, HeaderSize } from './packet'

export class SocketBuffer {
    public buffer = new Buffer(0)
    public state = State.Head

    public length = HeaderSize
    public packet!: Packet | null
    public packetCallback!: (packet: Packet) => void


    constructor() {
        this.prepare()
    }

    public prepare() {
        this.state = State.Head
        this.length = HeaderSize
        this.packet = null
    }

    public receive(src: Buffer) {
        this.buffer = Buffer.concat([this.buffer, src])

        this.parse()
    }

    public popBytes(toRead: number) {
        var readBuffer = new Buffer(toRead)
        this.buffer.copy(readBuffer, 0, 0, toRead)
        this.buffer = this.buffer.slice(toRead, this.buffer.length)
        return readBuffer
    }

    public parse() {
        let toRead = 0
        let done = false
        while (!done) {
            switch (this.state) {
                case State.Head:
                    toRead = this.length
                    if (this.buffer.length >= toRead) {
                        var readBuffer = this.popBytes(toRead)
                        this.packet = new Packet()
                        this.packet.head = readBuffer
                        this.packet.unpack()
                        this.state = State.Body
                        this.length = this.packet.body.length
                    }
                    else {
                        done = true
                    }
                    break
                case State.Body:
                    toRead = this.length
                    if (this.buffer.length >= toRead) {
                        let readBuffer = this.popBytes(toRead)
                        this.packet!.body = readBuffer
                        if (this.packetCallback) {
                            this.packetCallback(this.packet!)
                        }
                        this.prepare()
                    }
                    else {
                        done = true
                    }
                    break
            }
        }
    }

}
