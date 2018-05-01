import { Address } from "../common/address"
import { AnyBlock, Block } from "../common/block"
import { AnyBlockHeader } from "../common/blockHeader"
import { SignedTx } from "../common/txSigned"
import { Hash } from "../util/hash"

type Difficulty = any // TODO: define type
type Account = any // TODO: define type

type NewBlockCallback = (block: Block) => void
type MinerCallback = (previousBlock: AnyBlock, target: Difficulty) => void
export interface IConsensus {
    putBlock(block: Block): Promise<boolean>
    addCallbackNewBlock(callback: NewBlockCallback, priority?: number): void
    removeCallbackNewBlock(callback: NewBlockCallback): void
    addCallbackMiner(callback: MinerCallback, priority?: number): void
    removeCallbackMiner(callback: MinerCallback): void
    getBlocksByHash(hash: Hash): Promise<AnyBlock>
    getHeaderByHash(hash: Hash): Promise<AnyBlockHeader>
    getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]>
    getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]>
    getAccount(address: Address): Promise<Account>
    getLastTxs(address: Address, count?: number): Promise<SignedTx[]>
}
