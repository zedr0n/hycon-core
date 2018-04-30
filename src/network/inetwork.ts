import { INode } from "../serialization/proto"
import { IPeer } from "./ipeer"
export interface INetwork {
    start(): Promise<boolean>
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer
    addClient(ip: string, port: number): Promise<IPeer>
}
