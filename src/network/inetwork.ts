import { IPeer } from "./ipeer"
export interface INetwork {
    broadcast(packet: Buffer, exempt?: IPeer): void
    start(): Promise<boolean>
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer[]
    connect(ip: string, port: number, local: boolean): Promise<IPeer>
}
