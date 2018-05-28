export class Tx {
    public txhash: string
    public blockhash: string
    public to: string
    public from: string
    public amount: string
    public fee: string
    public timestamp: number
    constructor(txhash: string, blockhash: string, to: string, from: string, amount: string, fee: string, timestamp: number) {
        this.txhash = txhash
        this.blockhash = blockhash
        this.to = to
        this.from = from
        this.amount = amount
        this.fee = fee
        this.timestamp = timestamp
    }
}
