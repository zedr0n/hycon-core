
import * as fs from "fs-extra"
import { getLogger } from "log4js"
import { Block } from "../../common/block"
import { zeroPad } from "../../util/commonUtil"
import { FileUtil } from "../../util/fileUtil"

const logger = getLogger("BlockFile")

export class BlockFile {
    public n: number
    private fd: number
    private filePosition: number
    private fileSize: number
    private prefix: string

    public async fileInit(path: string, n: number, filePosition: number = 0): Promise<void> {
        const prefix = path + "/blk"
        const fileName = prefix + zeroPad(n.toString(), 5) + ".dat"
        this.n = n
        if (! await fs.pathExists(path)) { fs.mkdir(path) }

        if (! await fs.pathExists(fileName)) {
            this.fd = await fs.open(fileName, "w+")
        } else { this.fd = await fs.open(fileName, "r+") }

        this.filePosition = filePosition
        this.fileSize = (await fs.stat(fileName)).size
    }

    public async get(offset: number, length: number): Promise<Uint8Array> {
        const data: Buffer = new Buffer(length)
        await fs.read(this.fd, data, 0, length, offset)
        return Promise.resolve(data)
    }

    public async put(data: Uint8Array): Promise<{ filePosition: number, blockOffset: number }> {
        if (this.fileSize < this.filePosition + data.length) {
            await this.expandFile()
        }
        const writePosition = this.filePosition
        this.filePosition += data.length
        await fs.write(this.fd, new Buffer(data), 0, data.length, writePosition)
        return Promise.resolve({ filePosition: writePosition, blockOffset: writePosition })
    }

    public async close(): Promise<void> {
        try {
            return await fs.close(this.fd)
        } catch (e) {
            logger.error(`Fail to close file : ${e}`)
            return Promise.reject(e)
        }
    }

    public async delBlock(offset: number, length: number): Promise<void> {
        const data = new Buffer(length)
        data.fill(0)
        await fs.write(this.fd, data, 0, length, offset)
    }
    public size(): number {
        return this.fileSize
    }

    private async expandFile(): Promise<void> {
        const zeroArray = new Uint8Array(16777216)
        await fs.appendFile(this.fd, zeroArray, { encoding: "buffer" })
        this.fileSize += zeroArray.length
    }
}
