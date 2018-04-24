import { INetwork } from "../network/inetwork"
import { IPeer } from "../network/ipeer"
import { BlockHeader } from "../serialization/proto"
import { Hash } from "../util/hash"
import { IConsensus } from "./iconsensus"

export enum BlockStatus {
    Nothing,
    Header,
    Block,
}

export async function checkNewBlock(network: INetwork, consensus: IConsensus): Promise<void> {
    const peer = network.getRandomPeer()
    const hashes = await getDiffHashes(peer, consensus)

    // for (const hash of hashes) {
    //     const status = await consensus.getBlockStatus(hash)
    //     if (status === BlockStatus.Nothing) {
    //         const header = await peer.getHeadersByHash(hash)
    //         await consensus.putHeader(header)
    //     } else if (status === BlockStatus.Header) {
    //         const block = await peer.getBlocksByHash(hash)
    //         await consensus.putBlock(block)
    //     }
    // }
}

async function getDiffHashes(peer: IPeer, consensus: IConsensus): Promise<Hash[]> {
    const hashes: Hash[] = []
    // const peerTip = await peer.getBlocksTip()
    // const consTip = await consensus.getBlocksTip()
    // let diffHeight = peerTip.height - consTip.height
    // let hash = peerTip.hash
    // while (diffHeight > 0) {
    //     hashes.push(hash)
    //     const header = await peer.getHeadersByHash(hash)
    //     if (header instanceof BlockHeader) { hash = new Hash(header.previousHash) }
    //     diffHeight--
    // }
    return Promise.resolve(hashes)
}
