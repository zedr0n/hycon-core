import { INetwork } from "../network/inetwork"
import { IPeer } from "../network/ipeer"
import { BlockHeader } from "../serialization/proto"
import { Hash } from "../util/hash"
import { IConsensus } from "./iconsensus"

export enum BlockStatus {
    Rejected = -1,
    Nothing = 0,
    Header = 1,
    Block = 2,
    MainChain = 3,
}
const count = 10

export async function syncBlocks(network: INetwork, consensus: IConsensus): Promise<void> {
    const peer = network.getRandomPeer()
    const tip = consensus.getBlocksTip()
    const headers = await peer.getHeadersByRange(tip.height, count)
    const headerReq = []
    const blockReq = []
    for (const header of headers) {
        const hash = new Hash(header)
        const status = await consensus.getBlockStatus(hash)
        if (status === BlockStatus.Nothing) {
            headerReq.push(hash)
        } else if (status === BlockStatus.Header) {
            blockReq.push(hash)
        }
    }
    const headerRes = await peer.getHeadersByHashes(headerReq)
    for (const header of headerRes) {
        await consensus.putHeader(header)
    }
    const blockRes = await peer.getBlocksByHashes(blockReq)
    for (const block of blockRes) {
        await consensus.putBlock(block)
    }
}
