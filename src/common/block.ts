import { getLogger } from "log4js"
import merkle = require("merkle-lib")
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"
import * as utils from "../util/miningUtil"
import { Address } from "./address"
import { GenesisBlock } from "./blockGenesis"
import { AnyBlockHeader, BlockHeader } from "./blockHeader"
import { GenesisSignedTx, SignedTx } from "./tx"

const logger = getLogger("Block")

export type AnyBlock = (Block | GenesisBlock)

export class Block implements proto.IBlock {
    public static decode(data: Uint8Array): Block {
        const block = proto.Block.decode(data)
        return new Block(block)
    }

    public header: BlockHeader
    public txs: SignedTx[]
    public miner: Address

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

        // TODO: Fix Not enough precision?
        if (Number(hexHeader) >= Number(hexDifficulty)) {
            return false
        }

        const txVerify = this.txs.every((tx) => tx.verify())
        if (!txVerify) {
            return false
        }

        const merkleRootVerify = this.calculateMerkleRoot().equals(this.header.merkleRoot)
        if (!merkleRootVerify) {
            return false
        }

        return true
    }

    public updateMerkleRoot(): void {
        this.header.merkleRoot = this.calculateMerkleRoot()
    }

    public encode(): Uint8Array {
        return proto.Block.encode(this).finish()
    }

    private calculateMerkleRoot(): Hash {
        const values: Uint8Array[] = []
        this.txs.forEach((tx) => {
            const hash = Hash.hash(proto.Tx.encode(tx).finish())
            values.push(hash)
        })
        const outArr = merkle(values, Hash.hash)
        return new Hash(outArr[outArr.length - 1])
    }
}
