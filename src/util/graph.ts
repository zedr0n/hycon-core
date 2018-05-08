import { BlockHeader } from "../common/blockHeader"
import { GenesisBlockHeader } from "../common/genesisHeader"
import { Hash } from "./hash"

// tslint:disable-next-line:no-var-requires
const tryRequire = require("try-require")
const graphviz = tryRequire("graphviz")

export class Graph {
    public gmap: any
    public gviz: any
    public color: any
    public outFile: string

    constructor() {
        this.gviz = graphviz.digraph("hycon")
        this.gmap = {
            edges: new Map<string, number>(),
            nodes: new Map<string, boolean>(),
        }
        this.color = {
            genesis: "orange",
            incoming: "lightgrey",
            outgoing: "skyblue",
        }
        this.outFile = "kandanHYCON.png"
    }
    public initGraph(header: GenesisBlockHeader) {
        const blockHash = new Hash(header)
        const id = blockHash.toString().slice(0, 6)
        this.addNode(id, this.color.genesis)
        this.renderGraph()
    }

    public addToGraph(header: BlockHeader, color: string) {
        const blockHash = new Hash(header)
        const id = blockHash.toString().slice(0, 6)
        this.addNode(id, color)
        for (const prevHash of header.previousHash) {
            const pid = prevHash.toString().slice(0, 6)
            this.addEdge(id, pid)
        }
    }

    public removeFromGraph(header: BlockHeader) {
        const blockHash = new Hash(header)
        const id = blockHash.toString().slice(0, 6)
        this.removeNode(id)
        for (const prevHash of header.previousHash) {
            const pid = prevHash.toString().slice(0, 6)
            this.removeEdge(id, pid)
        }
    }

    public renderGraph() {
        this.gviz.output("png", this.outFile)
    }

    private addNode(id: string, color: string) {
        if (!this.gmap.nodes.get(id)) {
            this.gviz.addNode(id, { color, style: "filled" })
            this.gmap.nodes.set(id, true)
        }
    }

    private removeNode(id: string) {
        delete this.gviz.nodes.items[id]
        this.gviz.nodes.length--
    }

    private addEdge(id: string, pid: string) {
        const key = id + "_" + pid
        if (!this.gmap.edges.get(key)) {
            this.gviz.addEdge(id, pid)
            this.gmap.edges.set(key, this.gviz.edges.length - 1)
        }
    }

    private removeEdge(id: string, pid: string) {
        const key = id + "_" + pid
        const idx = this.gmap.edges.get(key)
        if (idx !== undefined) {
            this.gviz.edges.splice(idx, 1)
            this.gmap.edges.delete(key)
            const edgesSize = this.gviz.edges.length
            if (idx !== edgesSize) {
                const keys = Array.from(this.gmap.edges.keys())
                for (let i = idx; i < edgesSize; i++) {
                    const k = keys[i]
                    let v = this.gmap.edges.get(k)
                    this.gmap.edges.set(k, --v)
                }
            }
        }
    }

}
