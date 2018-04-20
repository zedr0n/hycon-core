import { IPeer } from "./peer"
export class TcpPeer implements IPeer {
    public ping(): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public putTx(tx: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getTxs(minFee?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public putBlock(block: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getBlocksByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getHeaderByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getBlocksRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public getHeadersRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
}
