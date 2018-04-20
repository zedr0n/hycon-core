import * as fs from "fs"
import * as proto from "../serialization/proto"
import * as utils from "../util/miningUtil"

import { getLogger } from "log4js"
import { Hash } from "../util/hash"
import { Address } from "./address"
import { AnyBlockHeader, BlockHeader, GenesisBlockHeader, setGenesisBlockHeader } from "./blockHeader"
import { GenesisSignedTx, SignedTx } from "./tx"

import conf = require("../settings")

// tslint:disable:member-access
// tslint:disable:no-var-requires
const merkle = require("merkle-lib")
const logger = getLogger("Block")

export type AnyBlock = (Block | GenesisBlock)
export class GenesisBlock implements proto.IBlock {
    public static decode(data: Uint8Array): GenesisBlock {
        const block = proto.Block.decode(data)
        return new GenesisBlock(block)
    }

    public header !: GenesisBlockHeader
    public txs !: GenesisSignedTx []

    constructor(block?: proto.IBlock) {
        if (block === undefined) {
            try {
                const file = fs.readFileSync(conf.dataGenesis)
                const decoded = proto.Block.decode(file)
                logger.debug(`Genesis Block=${JSON.stringify(decoded)}`)
                this.set(decoded)
            } catch (e) {
                logger.error("Genesis constructor fail : " + e)
            }
        } else {
            this.set(block)
        }
    }

    public set(block: proto.IBlock): void {
        if (block.txs === undefined) { throw (new Error("Block Txs are missing")) }
        if (block.header === undefined) { throw (new Error("Block Header is missing in GenesisBlock")) }

        this.txs = []
        for (const tx of block.txs) {
            this.txs.push(new GenesisSignedTx(tx))
        }
        if (this.header === undefined) {
            this.header = setGenesisBlockHeader(block.header)
        } else {
            this.header.set(block.header)
        }
    }

    public encode(): Uint8Array {
        return proto.Block.encode(this).finish()
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Block implements proto.IBlock {
    public static decodeAny(data: Uint8Array): (Block | GenesisBlock) {
        const block = proto.Block.decode(data)
        if (block && block.header) {
            // tslint:disable-next-line:max-line-length
            if (block.header.difficulty === 0 && (block.header.previousHash === undefined || block.header.previousHash.length === 0)) {
                return new GenesisBlock(block)
            }
        }
        return new Block(block)
    }
    public static decode(data: Uint8Array): Block {
        const block = proto.Block.decode(data)
        return new Block(block)
    }
    public header !: BlockHeader
    public txs !: SignedTx []
    public miner !: Address

    constructor(block: proto.IBlock) {
        this.set(block)
    }

    public set(block: proto.IBlock): void {
        if (block.txs === undefined) { throw (new Error("Block Txs are missing")) }
        if (block.header === undefined) { throw (new Error("Block Header is missing in Block")) }
        if (block.miner === undefined) { throw (new Error("Miner is missing")) }

        this.txs = []
        for (const tx of block.txs) {
            this.txs.push(new SignedTx(tx))
        }

        if (this.header === undefined) {
            this.header = new BlockHeader(block.header)
        } else {
            this.header.set(block.header)
        }

        this.miner = new Address(block.miner)
    }

    public verify(): boolean {
        const hexHeader = new Hash(this.header).toHex()
        const diff = utils.unforcedInt(this.header.difficulty)
        const hexDifficulty = utils.difficulty(diff)
        if (Number(hexHeader) >= Number(hexDifficulty)) {
            return false
        }

        const txVerify = this.txs.every((tx) => tx.verify())
        if (!txVerify) {
            return false
        }

        const merkleRoot = this.getMerkleRoot()
        if (!(this.header.merkleRoot.equals(merkleRoot))) {
            return false
        }
        return true
    }

    public updateMerkle(): void {
        this.header.merkleRoot = this.getMerkleRoot()
    }

    public getMerkleRoot(): Hash {
        const values: Uint8Array[] = []
        let outArr: Uint8Array[] = []
        this.txs.forEach((tx) => {
            const hash = Hash.hash(proto.Tx.encode(tx).finish())
            values.push(hash)
        })
        outArr = merkle(values, Hash.hash)
        return new Hash(outArr[outArr.length - 1])
    }

    public encode(): Uint8Array {
        return proto.Block.encode(this).finish()
    }
}
