import { SignedTx } from "./txSigned"
type TopTxCallback = (txs: SignedTx[]) => void // TODO: define type
export interface ITxPool {
    putTxs(txs: SignedTx[]): Promise<number>
    updateTx(txs: SignedTx[], n: number): SignedTx[]
    onTopTxChanges(count: number, callback: TopTxCallback): void
}
