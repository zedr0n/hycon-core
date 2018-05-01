
import { IPeer } from "./peer"
export interface INetwork {
    start(): boolean
    getRandomPeer(): IPeer
    broadcast(packet: Buffer): void
    getRandomPeers(count: number): IPeer[]
}
