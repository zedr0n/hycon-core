import { IPeer } from "./ipeer"
export interface INetwork {
    isBootnode: boolean
    broadcast(packet: Buffer, exempt?: IPeer): void
    start(): Promise<boolean>
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer[]
    connect(ip: string, port: number): Promise<IPeer>
}
