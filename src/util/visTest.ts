import { randomBytes } from "crypto"
import { BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import * as g from "./graph"
import { Hash } from "./hash"

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

const genesis = dummyHeader(new Hash("0xff"))
let prevHash = new Hash(genesis)

g.initGraph(genesis)

let header = dummyHeader(prevHash)
g.addToGraph(header, g.gcolor.Outgoing)
prevHash = new Hash(header)
const bifur = new Hash(header)

let delHeader: BlockHeader
for (let i = 0; i < 5; i++) {
    header = dummyHeader(prevHash)
    g.addToGraph(header, g.gcolor.Outgoing)
    prevHash = new Hash(header)

    if (i === 4) { delHeader = header }
}

prevHash = bifur
for (let i = 0; i < 3; i++) {
    header = dummyHeader(prevHash)
    g.addToGraph(header, g.gcolor.Incoming)
    prevHash = new Hash(header)
}

g.removeFromGraph(delHeader)
g.renderGraph()
