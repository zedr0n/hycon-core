type PingResponse = any // TODO: define type
type Tx = any // TODO: define type
type Block = any // TODO: define type
type Header = any // TODO: define type
type Hash = any // TODO: define type

export interface IPeer {
    ping(): Promise<PingResponse>
    putTx(tx: Tx): Promise<boolean>
    getTxs(minFee?: number): Promise<Tx[]>
    putBlock(block: Block): Promise<boolean>
    getBlocksByHash(hash: Hash): Promise<Block>
    getHeaderByHash(hash: Hash): Promise<Header>
    getBlocksRange(fromHeight: number, count: number): Promise<Block[]>
    getHeadersRange(fromHeight: number, count: number): Promise<Header[]>
}
