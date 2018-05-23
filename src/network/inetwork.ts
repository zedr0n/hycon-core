import * as proto from "../serialization/proto"
import { IPeer } from "./ipeer"
export interface INetwork {
    broadcast(packet: Uint8Array, exempt?: IPeer): void
    start(): Promise<boolean>
    getRandomPeer(): IPeer
    getRandomPeers(count: number): IPeer[]
    connect(ip: string, port: number): Promise<IPeer>
    getConnections(): Promise<proto.IPeer[]>
}
