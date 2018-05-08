import { randomBytes } from "crypto"
import { BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import { Graph } from "./graph"
import { Hash } from "./hash"

// tslint:disable-next-line:no-var-requires
const delay = require("delay")

function dummyHeader(hash: Hash) {
    return new BlockHeader({
        difficulty: 2,
        merkleRoot: new Hash(randomBytes(32)),
        nonce: 10,
        previousHash: [hash],
        stateRoot: new Hash(randomBytes(32)),
        timeStamp: Date.now(),
    })
}

const g = new Graph()
const nChain1 = 5
const nChain2 = 4
const genesis = dummyHeader(new Hash("0xff"))
const genesisHash = new Hash(genesis)

async function test() {
    g.initGraph(genesis)
    const second = dummyHeader(genesisHash)
    g.addToGraph(second, g.color.outgoing)

    const commonHash = new Hash(second)

    const chain1: BlockHeader[] = []
    let prevHash = commonHash
    for (let i = 0; i < nChain1; i++) {
        const header = dummyHeader(prevHash)
        chain1.push(header)
        prevHash = new Hash(header)

        g.addToGraph(header, g.color.outgoing)
        g.renderGraph()
        await delay(1000)
    }

    const chain2: BlockHeader[] = []
    prevHash = commonHash
    for (let i = 0; i < nChain2; i++) {
        const header = dummyHeader(prevHash)
        chain2.push(header)
        prevHash = new Hash(header)

        g.addToGraph(header, g.color.incoming)
        g.renderGraph()
        await delay(1000)
    }

    for (let i = nChain1 - 1; i >= 0; i--) {
        g.removeFromGraph(chain1[i])
        g.renderGraph()
        await delay(1000)
    }

    for (let i = nChain2 - 1; i >= 0; i--) {
        g.removeFromGraph(chain2[i])
        g.renderGraph()
        await delay(1000)
    }
}

test()
