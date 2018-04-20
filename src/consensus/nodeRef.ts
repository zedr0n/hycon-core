import * as proto from "../serialization/proto"

import { Hash } from "../util/hash"

// tslint:disable:member-access
export class NodeRef implements proto.INodeRef {
    public static decode(data: Uint8Array): NodeRef {
        const nodeRef = proto.NodeRef.decode(data)
        return new NodeRef(nodeRef)
    }
    public address !: Uint8Array
    public child !: Hash

    constructor(nodeRef?: proto.INodeRef) {
        if (nodeRef !== undefined) {
            this.set(nodeRef)
        }
    }

    public set(nodeRef: proto.INodeRef) {
        if (nodeRef.address === undefined) { throw new Error("address is missing") }
        if (nodeRef.child === undefined) { throw new Error("child is missing") }
        this.address = nodeRef.address
        this.child = new Hash(nodeRef.child)
    }

    public encode(): Uint8Array {
        return proto.NodeRef.encode(this).finish()
    }
}
