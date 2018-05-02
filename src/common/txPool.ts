type Tx = any // TODO: define type
type TopTxCallback = (txs: Tx[]) => void // TODO: define type
export interface ITxPool {
    putTxs(txs: Tx[]): Promise<number>
    delTxs(txs: Tx[]): Promise<number>
    onTopTxChanges(count: number, callback: TopTxCallback): void
}
