import { BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import { Hash } from "./hash"

// tslint:disable-next-line:no-var-requires
const tryRequire = require("try-require")
const graphviz = tryRequire("graphviz")

const graph = {
    gmap: {
        edges: new Map<string, number>(),
        nodes: new Map<string, boolean>(),
    },
    gviz: graphviz.digraph("HYCON"),
    outFile: "kandanHYCON.png",
}

export const gcolor = {
    Genesis: "orange",
    Incoming: "lightgrey",
    Outgoing: "skyblue",
}

export function initGraph(header: GenesisBlockHeader) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    addNode(id, gcolor.Genesis)
    renderGraph()
}

export async function addToGraph(header: BlockHeader, color: string) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    addNode(id, color)
    for (const prevHash of header.previousHash) {
        const pid = prevHash.toString().slice(0, 6)
        addEdge(id, pid)
    }
}

export async function removeFromGraph(header: BlockHeader) {
    const blockHash = new Hash(header)
    const id = blockHash.toString().slice(0, 6)
    removeNode(id)
    for (const prevHash of header.previousHash) {
        const pid = prevHash.toString().slice(0, 6)
        removeEdge(id, pid)
    }
}

export function renderGraph() {
    graph.gviz.output("png", graph.outFile)
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
        graph.gmap.edges.set(key, graph.gviz.edges.length - 1)
    }
}

function removeEdge(id: string, pid: string) {
    const key = id + "_" + pid
    const idx = graph.gmap.edges.get(key)
    if (idx !== undefined) {
        const edgesSize = graph.gviz.edges.length
        if (idx !== edgesSize) {
            const keys = Array.from(graph.gmap.edges.keys())
            for (let i = idx + 1; i < edgesSize; i++) {
                const k = keys[i]
                let v = graph.gmap.edges.get(k)
                graph.gmap.edges.set(k, --v)
            }

        }
        graph.gviz.edges.splice(idx, 1)
    }
}
