// // const natUpnp = new NatUpnp(8150)
// import * as proto from "../serialization/proto"
// import { NatUpnp } from "./nat"
// import { PeerDb } from "./peerDb"
// import { RabbitNetwork } from "./rabbit/rabbitNetwork"
// // const peerDB = new PeerDb()
// const buffer1 = PeerDb.ipeer2key(proto.Peer.create({ host: "192.168.0.1", port: 8080, lastSeen: Date.now(), failCount: 0 }))

// // tslint:disable-next-line:no-console
// // console.log(buffer1.equals(buffer2))

// // tslint:disable-next-line:no-console
// try { throw new Error("cannot found at peers") } catch (e) { console.log(e) }

import * as netmask from "netmask"

const block = new netmask.Netmask("10.0.0.0/8")

// tslint:disable-next-line:no-console
console.log(block.base)

// tslint:disable-next-line:no-console
console.log(block.broadcast)

// tslint:disable-next-line:no-console
console.log(block.first)

// tslint:disable-next-line:no-console
console.log(block.last)

const block1 = new netmask.Netmask("172.16.0.0/12")

// tslint:disable-next-line:no-console
console.log(block1.base)

// tslint:disable-next-line:no-console
console.log(block1.broadcast)

// tslint:disable-next-line:no-console
console.log(block1.first)

// tslint:disable-next-line:no-console
console.log(block1.last)

const block2 = new netmask.Netmask("192.168.0.0/16")

// tslint:disable-next-line:no-console
console.log(block2.base)

// tslint:disable-next-line:no-console
console.log(block2.broadcast)

// tslint:disable-next-line:no-console
console.log(block2.first)

// tslint:disable-next-line:no-console
console.log(block2.last)

// tslint:disable-next-line:no-console
console.log(block2.contains("192.168.0.5"))

const block3 = new netmask.Netmask("127.0.0.0/8")

// tslint:disable-next-line:no-console
console.log(block3.base)

// tslint:disable-next-line:no-console
console.log(block3.broadcast)

// tslint:disable-next-line:no-console
console.log(block3.first)

// tslint:disable-next-line:no-console
console.log(block3.last)
