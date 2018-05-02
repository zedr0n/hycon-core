import { Server } from "../server"
import { IConsensus } from "./iconsensus"
export class AppConsensus implements IConsensus {
    public server: Server = undefined
    constructor(server: Server) {
        this.server = server
    }

    public async validateTx(tx: any): Promise<boolean> {
        return true
    }
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
