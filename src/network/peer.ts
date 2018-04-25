
import { Block, BlockHeader, Tx } from "../serialization/proto"

import { Ping, PingReturn } from "../serialization/proto"

export interface IPeer {
    ping(): Promise<PingReturn>
    putTx(tx: Tx): Promise<boolean>
    getTxs(minFee?: number): Promise<Tx[]>
    putBlock(block: Block): Promise<boolean>
    getBlocksByHash(hash: any[]): Promise<Block>
    getHeadersByHash(hash: any[]): Promise<BlockHeader[]>
    getBlocksByRange(fromHeight: number, count: number): Promise<Block[]>
    getHeadersByRange(fromHeight: number, count: number): Promise<BlockHeader[]>

    // callbakcs
    setConnectedCallback(callback: () => void): void

}
