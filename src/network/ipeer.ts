
import { Block } from "../common/block"
import { AnyBlockHeader } from "../common/blockHeader"
import { SignedTx } from "../common/txSigned"
import * as proto from "../serialization/proto"
import { Hash } from "../util/hash"
import { IStatus } from "../serialization/proto"

type PingResponse = any // TODO: define type

export interface IPeer {
    status(): Promise<IStatus>
    ping(): Promise<number>
    putTxs(txs: SignedTx[]): Promise<boolean>
    getTxs(minFee?: number): Promise<SignedTx[]>
    putBlocks(blocks: Block[]): Promise<boolean>
    getBlocksByHashes(hashes: Hash[]): Promise<Block[]>
    getHeadersByHashes(hashes: Hash[]): Promise<AnyBlockHeader[]>
    getBlocksByRange(fromHeight: number, count: number): Promise<Block[]>
    getHeadersByRange(fromHeight: number, count: number): Promise<AnyBlockHeader[]>
    getTip(): { hash: Hash, height: number }
}
