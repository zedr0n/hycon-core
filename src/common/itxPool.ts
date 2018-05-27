import { Address } from "./address"
import { SignedTx } from "./txSigned"
type TopTxCallback = (txs: SignedTx[]) => void
export interface ITxPool {
    putTxs(txs: SignedTx[]): number
    getTxs(): SignedTx[]
    updateTxs(old: SignedTx[], maxReturn?: number): SignedTx[]
    onTopTxChanges(count: number, callback: TopTxCallback): void
    getPending(index: number, count: number): { txs: SignedTx[], length: number, totalAmount: Long, totalFee: Long }
    isExsited(address: Address): boolean
    getTxsOfAddress(address: Address): SignedTx[]
}
