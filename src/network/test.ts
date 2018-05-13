// const natUpnp = new NatUpnp(8150)
import * as proto from "../serialization/proto"
import { NatUpnp } from "./nat"
import { PeerDb } from "./peerDb"
import { RabbitNetwork } from "./rabbit/rabbitNetwork"
// const peerDB = new PeerDb()
const buffer1 = PeerDb.ipeer2key(proto.Peer.create({ host: "192.168.0.1", port: 8080, lastSeen: Date.now(), failCount: 0 }))

// tslint:disable-next-line:no-console
// console.log(buffer1.equals(buffer2))

// tslint:disable-next-line:no-console
try { throw new Error("cannot found at peers") } catch (e) { console.log(e) }
