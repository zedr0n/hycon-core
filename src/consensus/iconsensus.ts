type Block = any // TODO: define type
type Header = any // TODO: define type
type Hash = any // TODO: define type
type Difficulty = any // TODO: define type
type Address = any  // TODO: define type
type Account = any // TODO: define type
type Tx = any // TODO: define type
type NewBlockCallback = (block: Block) => void
type MinerCallback = (previousBlock: Block, target: Difficulty) => void
export interface IConsensus {
    putBlock(block: Block): Promise<boolean>
    addCallbackNewBlock(callback: NewBlockCallback, priority?: number): void
    removeCallbackNewBlock(callback: NewBlockCallback): void
    addCallbackMiner(callback: MinerCallback, priority?: number): void
    removeCallbackMiner(callback: MinerCallback): void
    getBlocksByHash(hash: Hash): Promise<Block>
    getHeaderByHash(hash: Hash): Promise<Header>
    getBlocksRange(fromHeight: number, count?: number): Promise<Block[]>
    getHeadersRange(fromHeight: number, count?: number): Promise<Header[]>
    getAccount(address: Address): Promise<Account>
    getLastTxs(address: Address, count?: number): Promise<Tx[]>
}
