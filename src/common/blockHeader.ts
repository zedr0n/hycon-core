import blake2b = require("blake2b")
import * as Long from "long"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"

export type GenesisBlockHeader = BaseBlockHeader
export type AnyBlockHeader = (BlockHeader | GenesisBlockHeader)
export class BaseBlockHeader implements proto.IBlockHeader {
    public merkleRoot: Hash
    public timeStamp: number
    public difficulty: number
    public stateRoot: Hash

    // tslint:disable-next-line:no-empty
    constructor() { }

    public set(header: proto.IBlockHeader): void {
        if (header.merkleRoot === undefined) {
            throw new Error("Header missing merkle root")
        }
        if (header.stateRoot === undefined || header.stateRoot.byteLength === 0) {
            throw new Error("Header missing state root")
        }
        if (header.timeStamp === undefined || header.timeStamp.valueOf() < 151500330500) {
            throw new Error("Header missing timeStamp")
        }
        if (header.difficulty === undefined || header.difficulty == null) {
            throw new Error("Header missing difficulty")
        }

        if (this.merkleRoot) {
            this.merkleRoot.set(header.merkleRoot)
        } else {
            this.merkleRoot = new Hash(header.merkleRoot)
        }

        if (this.stateRoot) {
            this.stateRoot.set(header.stateRoot)
        } else {
            this.stateRoot = new Hash(header.stateRoot)
        }

        this.timeStamp = header.timeStamp instanceof Long ? header.timeStamp.toNumber() : header.timeStamp
        this.difficulty = header.difficulty
    }

    public encode(): Uint8Array {
        return proto.BlockHeader.encode(this).finish()
    }
}

export function GenesisBlockHeader(): GenesisBlockHeader {
    const genesis = new BaseBlockHeader()
    genesis.set({
        difficulty: 1,
        merkleRoot: new Hash(),
        stateRoot: new Hash(),
        timeStamp: 151500330500,
    })
    return genesis
}

export function setGenesisBlockHeader(header: proto.IBlockHeader): GenesisBlockHeader {
    const genesis = new BaseBlockHeader()
    genesis.set({
        difficulty: header.difficulty,
        merkleRoot: header.merkleRoot,
        stateRoot: header.stateRoot,
        timeStamp: header.timeStamp,
    })
    return genesis
}

// tslint:disable-next-line:max-classes-per-file
export class BlockHeader extends BaseBlockHeader {
    public previousHash: Hash[] = []
    public nonce: Long

    constructor(header: proto.IBlockHeader) {
        super()
        this.set(header)
    }

    public set(header: proto.IBlockHeader): void {
        super.set(header)
        if (header.previousHash === undefined) { throw new Error("Header missing previous hash") }
        if (header.nonce === undefined) { throw new Error("Header missing nonce") }
        if (header.difficulty === undefined || header.difficulty == null || header.difficulty <= 0) {
            throw new Error("Header missing difficulty")
        }

        for (const prev of header.previousHash) {
            this.previousHash.push(new Hash(prev))
        }

        this.nonce = header.nonce instanceof Long ? header.nonce : Long.fromNumber(header.nonce)
    }

    public preHash(): Uint8Array {
        const hashExcludeNonce: Uint8Array = blake2b(64).update(this.prehashEncode()).digest()
        return hashExcludeNonce
    }

    private prehashEncode(): Uint8Array {
        const header = Object.assign({}, this)
        delete header.nonce
        return proto.BlockHeader.encode(header).finish()
    }
}
