import { Server } from "../server"
import { IMiner } from "./miner"
export class AppMiner implements IMiner {
    public server: Server
    constructor(server: Server) {
        this.server = server

    }
    public newCandidateBlock(topBlock: any): void {
        throw new Error("Method not implemented.")
    }
    public start(): void {
        throw new Error("Method not implemented.")
    }
    public stop(): void {
        throw new Error("Method not implemented.")
    }
    public addCallbackNewBlock(callback: (block: any) => void, priority?: number): void {
        throw new Error("Method not implemented.")
    }
    public removeCallbackNewBlock(callback: (block: any) => void): void {
        throw new Error("Method not implemented.")
    }

}
