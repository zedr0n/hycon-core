type PingResponse = any // TODO: define type
type Tx = any // TODO: define type
type Block = any // TODO: define type
type Header = any // TODO: define type
type Hash = any // TODO: define type
import { Ping } from "../serialization/proto"

export interface IPeer {
    ping(): Promise<PingResponse>
    putTx(tx: Tx): Promise<boolean>
    getTxs(minFee?: number): Promise<Tx[]>
    putBlock(block: Block): Promise<boolean>
    getBlocksByHash(hash: Hash[]): Promise<Block>
    getHeadersByHash(hash: Hash[]): Promise<Header>
    getBlocksByRange(fromHeight: number, count: number): Promise<Block[]>
    getHeadersByRange(fromHeight: number, count: number): Promise<Header[]>

    // callbakcs
    setConnectedCallback(callback: () => void): void

}
