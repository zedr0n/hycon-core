import { BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import { Hash } from "./hash"

// tslint:disable-next-line:no-var-requires
const tryRequire = require("try-require")
const graphviz = tryRequire("graphviz")

const graph = {
    colorGenesis: "orange",
    colorIncoming: "lightgrey",
    colorOutgoing: "skyblue",
    gmap: {
        edges: new Map<string, number>(),
        nodes: new Map<string, boolean>(),
    },
    gviz: graphviz.digraph("HYCON"),
    outFile: "kandanHYCON.png",
}

export function initVisualDAG(header: GenesisBlockHeader) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    addNode(id, graph.colorGenesis)
    renderGraph()
}

export async function addToVisualDAG(header: BlockHeader, color: string) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    addNode(id, color)
    for (const prevHash of header.previousHash) {
        const pid = prevHash.toString().slice(0, 6)
        addEdge(id, pid)
    }
}

export async function removeFromVisualDAG(header: BlockHeader) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    removeNode(id)
    for (const prevHash of header.previousHash) {
        const pid = prevHash.toString().slice(0, 6)
        addEdge(id, pid)
    }
}

function addNode(id: string, color: string) {
    if (!graph.gmap.nodes.get(id)) {
        graph.gviz.addNode(id, { color, style: "filled" })
        graph.gmap.nodes.set(id, true)
    }
}

function removeNode(id: string) {
    delete graph.gviz.nodes.items[id]
    graph.gviz.nodes.length--
}

function addEdge(id: string, pid: string) {
    const key = id + "_" + pid
    if (!graph.gmap.edges.get(key)) {
        graph.gviz.addEdge(id, pid)
        graph.gmap.edges.set(key, graph.gviz.edges.length)
    }
}
function removeEdge(id: string, pid: string) {
    const key = id + "_" + pid
    const idx = graph.gmap.edges.get(key)
    if (idx !== undefined) {
        graph.gviz.edges.splice(idx, 1)
    }
}

export function renderGraph() {
    graph.gviz.output("png", graph.outFile)
}
