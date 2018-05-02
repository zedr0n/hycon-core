import { IPeer } from "./ipeer"
export interface INetwork {
    broadcast(packet: Buffer, exempt?: IPeer): void
    start(): Promise<boolean>
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer[]
    addClient(ip: string, port: number): Promise<IPeer>
}
