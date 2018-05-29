import { EventEmitter } from "events"
import { AnySignedTx, IConsensus } from "../iconsensus"
import { DBTx } from "./dbtx"
export interface ItxDatabase extends EventEmitter {
    init(consensus: IConsensus, tipHeight?: number): Promise<void>
    getLastBlock(idx: number): Promise<Hash | undefined>
    putTxs(blockHash: Hash, timestamp: number, txs: AnySignedTx[]): Promise<void>
    getLastTxs(address: Address, result: DBTx[] = [], idx: number = 0, count?: number): Promise<DBTx[]>
    getNextTxs(address: Address, txHash: Hash, result: DBTx[] = [], idx: number = 1, count?: number): Promise<DBTx[]>
    getTx(key: Hash): Promise<{ tx: DBTx, confirmation: number } | undefined>
}
