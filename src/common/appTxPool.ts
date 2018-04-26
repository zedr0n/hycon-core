import { Server } from "../server"
import { ITxPool } from "./txPool"
export class AppTxPool implements ITxPool {
    private server: Server
    constructor(server: Server) {
        this.server = server
    }
    public putTxs(txs: any[]): number {
        throw new Error("Method not implemented.")
    }
    public delTxs(txs: any[]): number {
        throw new Error("Method not implemented.")
    }
    public onTopTxChanges(count: number, callback: (txs: any[]) => void): void {
        throw new Error("Method not implemented.")
    }
}
