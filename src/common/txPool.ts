type Tx = any // TODO: define type
type TopTxCallback = (txs: Tx[]) => void // TODO: define type
export interface ITxPool {
    putTxs(txs: Tx[]): number
    delTxs(txs: Tx[]): number
    onTopTxChanges(count: number, callback: TopTxCallback): void
}
