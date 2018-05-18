import { AnyBlockHeader, BlockHeader } from "../../common/blockHeader"
import { setGenesisBlockHeader } from "../../common/genesisHeader"
import * as proto from "../../serialization/proto"
import { Difficulty } from "../difficulty"

export class DBBlock implements proto.IBlockDB {
    public static decode(data: Uint8Array): DBBlock {
        const blockDB = proto.BlockDB.decode(data)
        return new DBBlock(blockDB)
    }
    public height: number
    public header: AnyBlockHeader
    public fileNumber?: number
    public offset?: number
    public length?: number
    public timeEMA: number
    public workEMA: number

    constructor(dbBlock: proto.IBlockDB) {
        this.set(dbBlock)
    }

    public set(block: proto.IBlockDB): void {
        if (block.height === undefined) {
            throw new Error("DBBlock height is missing")
        }
        if (block.header === undefined) {
            throw new Error("DBBlock header is missing")
        }

        if (block.fileNumber !== undefined) {
            this.fileNumber = block.fileNumber
        }
        if (block.offset !== undefined) {
            this.offset = block.offset
        }
        if (block.length !== undefined) {
            this.length = block.length
        }
        if (block.timeEMA !== undefined) {
            this.timeEMA = block.timeEMA
        }
        if (block.workEMA !== undefined) {
            this.workEMA = block.workEMA
        }

        this.height = block.height
        if (this.header === undefined) {
            if (block.header.previousHash !== undefined && block.header.previousHash.length > 0) {
                this.header = new BlockHeader(block.header)
            } else {
                this.header = setGenesisBlockHeader(block.header)
            }
        } else {
            this.header.set(block.header)
        }
    }

    public encode(): Uint8Array {
        return proto.BlockDB.encode(this).finish()
    }
}
