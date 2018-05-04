import { Address } from "../common/address"
import { AnyBlock, Block } from "../common/block"
import { GenesisBlock } from "../common/blockGenesis"
import { AnyBlockHeader, BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import { SignedTx } from "../common/txSigned"
import { Account } from "../consensus/database/account"
import { BlockStatus } from "../consensus/sync"
import { Hash } from "../util/hash"
type Difficulty = any // TODO: define type

export type NewBlockCallback = (block: AnyBlock) => void
export interface IConsensus {
    init(): Promise<void>
    putBlock(block: Block): Promise<boolean>
    putHeader(header: BlockHeader): Promise<boolean>
    addCallbackNewBlock(callback: NewBlockCallback, priority?: number): void
    removeCallbackNewBlock(callback: NewBlockCallback): void
    getBlockByHash(hash: Hash): Promise<AnyBlock>
    getHeaderByHash(hash: Hash): Promise<AnyBlockHeader>
    getBlocksRange(fromHeight: number, count?: number): Promise<AnyBlock[]>
    getHeadersRange(fromHeight: number, count?: number): Promise<AnyBlockHeader[]>
    getAccount(address: Address): Promise<Account>
    getLastTxs(address: Address, count?: number): Promise<SignedTx[]>
    getBlockStatus(hash: Hash): Promise<BlockStatus>
    getHeaderTip(): { hash: Hash, height: number }
    getBlocksTip(): { hash: Hash, height: number }
    testMakeBlock(txs: SignedTx[]): Promise<Block>
    isTxValid(tx: SignedTx): Promise<boolean>
}
