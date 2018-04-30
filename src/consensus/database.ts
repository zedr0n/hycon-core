import { IConsensus } from "./iconsensus"

export class Database implements IConsensus {
    public putBlock(block: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public addCallbackNewBlock(callback: (block: any) => void, priority?: number): void {
        throw new Error("Method not implemented.")
    }
    public removeCallbackNewBlock(callback: (block: any) => void): void {
        throw new Error("Method not implemented.")
    }
    public addCallbackMiner(callback: (previousBlock: any, target: any) => void, priority?: number): void {
        throw new Error("Method not implemented.")
    }
    public removeCallbackMiner(callback: (previousBlock: any, target: any) => void): void {
        throw new Error("Method not implemented.")
    }
    public getBlocksByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getHeaderByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getBlocksRange(fromHeight: number, count?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public getHeadersRange(fromHeight: number, count?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public getAccount(address: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getLastTxs(address: any, count?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
}
