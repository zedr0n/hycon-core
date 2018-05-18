import { getLogger } from "log4js"
import { Socket } from "net"
import { AsyncLock } from "../../common/asyncLock"

const logger = getLogger("SocketBuffer")
const defaultMaxPacketSize = 10 * 1024 * 1024
enum ParseState {
    HeaderPrefix,
    HeaderRoute,
    HeaderBodyLength,
    Body,
}

const headerPrefix = Buffer.from([0x47, 0x4c, 0x53, 0x01])
const headerRouteLength = 4
const headerPostfixLength = 4
const scrapBufferLength = Math.max(headerPrefix.length, headerRouteLength, headerPostfixLength)
const writeBufferLength = headerRouteLength + headerPostfixLength
export class SocketParser {
    private socket: Socket
    private parseState: ParseState
    private scrapBuffer: Buffer
    private writeBuffer: Buffer
    private bodyBuffer: Buffer
    private route: number
    private parseIndex: number
    private packetCallback: (route: number, buffer: Buffer) => void
    private sendLock: AsyncLock

    constructor(socket: Socket, onPacket: (route: number, buffer: Buffer) => void, bufferSize: number = 1024) {
        this.socket = socket
        this.packetCallback = onPacket
        // These buffers will be held for the duration of the connection, and does not need to be intialized
        this.scrapBuffer = Buffer.allocUnsafeSlow(scrapBufferLength)
        this.writeBuffer = Buffer.allocUnsafeSlow(writeBufferLength)
        this.sendLock = new AsyncLock(false, 30000)
        this.parseReset()
        this.socket.on("data", (data) => this.receive(data))
        this.socket.on("drain", () => {
            logger.warn(`Resuming socket ${this.socket.remoteAddress}:${this.socket.remotePort}`)
            this.socket.resume()
            this.sendLock.releaseLock()
        })
    }

    public async send(route: number, buffer: Buffer): Promise<void> {
        if (buffer.length > defaultMaxPacketSize) {
            throw new Error("Buffer too large")
        }
        this.writeBuffer.writeUInt32LE(route, 0)
        this.writeBuffer.writeUInt32LE(buffer.length, 4)

        // true: all queued to kernel buffer
        // false: user memory is used
        let kernel = true
        await this.sendLock.getLock()
        kernel = kernel && this.socket.write(headerPrefix)
        kernel = kernel && this.socket.write(this.writeBuffer)
        kernel = kernel && this.socket.write(buffer)
        if (kernel) {
            this.sendLock.releaseLock()
        } else {
            // for this case, user memory is used
            // it will be released in "drain" event
            logger.warn(`Pausing socket ${this.socket.bufferSize}`)
            this.socket.pause()
        }
    }

    public destroy(): void {
        this.sendLock.rejectAll()
        if (this.socket) {
            this.socket.unref()
            this.socket.destroy()
        }
    }

    public getInfo() {
        return `Local=${this.socket.localAddress}:${this.socket.localPort}  Remote=${this.socket.remoteAddress}:${this.socket.remotePort} CurrentQueue=${this.sendLock.queueLength()}`
    }
    private receive(src: Buffer): void {
        try {
            this.parse(src)
        } catch (e) {
            if (this.socket) {
                logger.fatal(`Disconnecting from ${this.socket.remoteAddress}:${this.socket.remotePort} due to internal parser error: ${e}`)
            }
            this.destroy()
        }
    }

    private parse(newData: Buffer) {
        let newDataIndex = 0
        while (newDataIndex < newData.length) {
            switch (this.parseState) {
                case ParseState.HeaderPrefix:
                    newDataIndex = this.parseHeaderPrefix(newData, newDataIndex)
                    break
                case ParseState.HeaderRoute:
                    newDataIndex = this.parseHeaderRoute(newData, newDataIndex)
                    break
                case ParseState.HeaderBodyLength:
                    newDataIndex = this.parseHeaderBodyLength(newData, newDataIndex)
                    break
                case ParseState.Body:
                    newDataIndex = this.parseBody(newData, newDataIndex)
                    break
                default:
                    logger.fatal(`Disconnecting due to invalid parseState '${this.parseState}'`)
                    this.destroy()
                    throw new Error("Invalid parseState")
            }
        }
    }

    private parseHeaderPrefix(newData: Buffer, newDataIndex: number): number {
        while (newDataIndex < newData.length && this.parseIndex < headerPrefix.length) {
            if (newData[newDataIndex] !== headerPrefix[this.parseIndex]) {
                this.protocolError()
            }
            this.parseIndex++
            newDataIndex++
        }

        if (this.parseIndex === headerPrefix.length) {
            this.parseState++
            this.parseIndex = 0
        }

        return newDataIndex
    }
    private parseUInt32LE(newData: Buffer, newDataIndex: number): { newDataIndex: number, uint32?: number } {
        const newBytesAvailable = newData.length - newDataIndex
        if (this.parseIndex === 0 && newBytesAvailable >= 4) {
            const uint32 = newData.readUInt32LE(newDataIndex)
            newDataIndex += 4
            return { newDataIndex, uint32 }
        } else {
            const sourceEnd = newDataIndex + Math.min(newBytesAvailable, 4)
            const bytesCopied = newData.copy(this.scrapBuffer, this.parseIndex, newDataIndex, sourceEnd)
            newDataIndex += bytesCopied
            this.parseIndex += bytesCopied
            if (this.parseIndex === 4) {
                const uint32 = this.scrapBuffer.readUInt32LE(0)
                return { newDataIndex, uint32 }
            } else {
                logger.info(`Got partial Uint32, copied ${bytesCopied} into scrapBuffer ${this.parseIndex}/${this.scrapBuffer.length}`)
            }
        }
        return { newDataIndex }
    }

    private parseHeaderRoute(newData: Buffer, newDataIndex: number): number {
        const result = this.parseUInt32LE(newData, newDataIndex)
        if (result.uint32 !== undefined) {
            this.route = result.uint32
            this.parseIndex = 0
            this.parseState++
        }
        return result.newDataIndex
    }

    private parseHeaderBodyLength(newData: Buffer, newDataIndex: number): number {
        const result = this.parseUInt32LE(newData, newDataIndex)
        if (result.uint32 !== undefined) {
            if (result.uint32 > defaultMaxPacketSize) {
                logger.debug(`Disconnecting client ${this.socket.remoteAddress}:${this.socket.remotePort}, packet too large`)
                this.destroy()
                return
            }
            // Body buffer does not need to be initialized and will be short lived
            this.bodyBuffer = Buffer.allocUnsafe(result.uint32)
            this.parseIndex = 0
            this.parseState++
        }
        return result.newDataIndex
    }

    private parseBody(newData: Buffer, newDataIndex: number): number {
        const bytesCopied = newData.copy(this.bodyBuffer, this.parseIndex, newDataIndex)
        newDataIndex += bytesCopied
        this.parseIndex += bytesCopied
        if (this.parseIndex === this.bodyBuffer.length) {
            if (this.packetCallback) {
                this.packetCallback(this.route, this.bodyBuffer)
            } else {
                logger.debug("Dropping packet, as there is no packet callback to consume")
            }
            this.parseReset()
        } else {
            logger.info(`Copied ${bytesCopied} bytes into bodybuffer ${this.parseIndex}/${this.bodyBuffer.length}`)
        }
        return newDataIndex
    }

    private parseReset() {
        this.parseIndex = 0
        this.parseState = ParseState.HeaderPrefix
        this.bodyBuffer = undefined
    }

    private protocolError() {
        logger.info(`Disconnecting from ${this.socket.remoteAddress}:${this.socket.remotePort} due to invalid message format`)
        this.destroy()
    }
}
