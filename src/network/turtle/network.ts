
import { IPeer } from "./peer"
export interface INetwork {
    start(): boolean
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer[]
}
