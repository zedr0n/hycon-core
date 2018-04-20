import * as proto from "../serialization/proto"

import { Address } from "../common/address"
import { Hash } from "../util/hash"
import { NodeRef } from "./nodeRef"

// tslint:disable:member-access
export class StateNode implements proto.IStateNode {
    public static decode(data: Uint8Array): StateNode {
        const stateNode = proto.StateNode.decode(data)
        return new StateNode(stateNode)
    }
    public nodeRefs !: NodeRef []
    constructor(stateNode?: proto.IStateNode) {
        if (stateNode !== undefined) {
            this.set(stateNode)
        } else {
            this.nodeRefs = []
        }
    }

    public set(stateNode: proto.IStateNode) {
        if (stateNode.nodeRefs === undefined) { throw new Error("nodeRefs is missing") }
        this.nodeRefs = []
        for (const refs of stateNode.nodeRefs) {
            const noderef = new NodeRef(refs)
            this.nodeRefs.push(noderef)
        }
    }

    public encode(): Uint8Array {
        return proto.StateNode.encode(this).finish()
    }
}
