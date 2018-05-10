import { getLogger } from "log4js"
import merkle = require("merkle-lib")
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"
import { Address } from "./address"
import { GenesisBlock } from "./blockGenesis"
import { AnyBlockHeader, BlockHeader } from "./blockHeader"
import { SignedTx } from "./txSigned"

const logger = getLogger("Block")

export type AnyBlock = (Block | GenesisBlock)

export class Block implements proto.IBlock {
    public static decode(data: Uint8Array): AnyBlock {
        const block = proto.Block.decode(data)
        let genesis
        if (block && block.header) {
            if (block.header.difficulty === 0 && (block.header.previousHash.length === 0 || block.header.previousHash === undefined)) {
                genesis = new GenesisBlock(block)
                return genesis
            }
        }
        return new Block(block)
    }

    public header: BlockHeader
    public txs: SignedTx[]
    public miner: Address// TODO: move miner to header

    constructor(block: proto.IBlock) {
        this.set(block)
    }

    public set(block: proto.IBlock): void {
        if (block.txs === undefined) { throw (new Error("Block Txs are missing")) }
        if (block.header === undefined) { throw (new Error("Block Header is missing in Block")) }
        // if (block.miner === undefined) { throw (new Error("Miner is missing")) }

        this.txs = []
        for (const tx of block.txs) {
            this.txs.push(new SignedTx(tx))
        }

        if (this.header === undefined) {
            this.header = new BlockHeader(block.header)
        } else {
            this.header.set(block.header)
        }

        if (block.miner !== undefined) {
            this.miner = new Address(block.miner)
        }
    }

    public updateMerkleRoot(): void {
        this.header.merkleRoot = this.calculateMerkleRoot()
    }

    public encode(): Uint8Array {
        return proto.Block.encode(this).finish()
    }

    public calculateMerkleRoot(): Hash {
        const values: Uint8Array[] = []
        this.txs.forEach((tx) => {
            const hash = Hash.hash(proto.Tx.encode(tx).finish())
            values.push(hash)
        })
        const outArr = merkle(values, Hash.hash)
        return new Hash(outArr[outArr.length - 1])
    }
}
