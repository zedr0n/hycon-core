import { getLogger } from "log4js"
import { INetwork } from "../network/inetwork"
import { IPeer } from "../network/ipeer"
import { Hash } from "../util/hash"
import { IConsensus } from "./iconsensus"
const logger = getLogger("Sync")

export enum BlockStatus {
    Rejected = -1,
    Nothing = 0,
    Header = 1,
    Block = 2,
    MainChain = 3,
}

class EliminationRace<T> {
    private promises: Array<Promise<T>>
    constructor() {
        this.promises = []
    }

    public add(promise: Promise<T>) {
        this.promises.push(promise)
        promise.then((v) => this.remove(promise))
        promise.catch((e) => this.remove(promise))
    }

    private conditional<T>(promises: Promise<T>[], condition: (v: T) => boolean) {
        return Promise.all<T>(promises.map(p => {
            // If a request fails, count that as a resolution so it will keep
            // waiting for other possible successes. If a request succeeds,
            // treat it as a rejection so Promise.all immediately bails out.

            return p.then(
                v => {
                    if (condition(v))
                        return Promise.reject<T>(v)
                    else
                        return Promise.resolve<T>(undefined)
                },
                e => Promise.resolve(e)
            )
        })).then(
            // If '.all' resolved, we've just got an array of errors.
            e => Promise.resolve<T[]>([]),
            // If '.all' rejected, we've got the result we wanted.
            v => Promise.resolve<T[]>([v])
        ).catch();
    }

    public race(test: (t: T) => boolean = () => true) {
        return this.conditional<T>(this.promises, v => test(v))
    }

    private remove(promise: Promise<T>) {
        let i = 0
        while (i < this.promises.length) {
            if (promise === this.promises[i]) {
                this.promises.splice(i, 1)
            } else {
                i++
            }
        }
    }
}

export interface ITip {
    hash: Hash,
    height: number,
    totalwork: number
}

export interface ICandidatePeer {
    peer: IPeer
    tip: {
        hash: Hash;
        height: number;
        totalwork: number;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class Sync {
    private go: boolean
    private consensus: IConsensus
    private network: INetwork
    constructor(consensus: IConsensus, network: INetwork) {
        this.consensus = consensus
        this.network = network
        this.go = false
    }

    public start(delay: number = 1000) {
        this.go = true
        setImmediate(() => this.headerSync(delay))
        setImmediate(() => this.blockSync(delay))
    }

    public stop(delay: number = 1000) {
        this.go = false
    }
    private async headerSync(delay: number = 1000) {
        try {
            const promise = new EliminationRace<ICandidatePeer>()
            for (const peer of await this.network.getPeers()) {
                promise.add(peer.getBTip().then((tip) => ({ peer, tip })).catch((e) => logger.debug(e)))
            }
            const filter = (peer: ICandidatePeer) => peer !== undefined && peer.tip !== undefined && (peer.tip.totalwork > this.consensus.getHtip().totalWork || peer.tip.height > this.consensus.getHtip().height)
            const reply = await promise.race(filter)
            if (reply.length > 0) {
                const { peer, tip } = reply[0]
                logger.info(`Syncing headers from peer with tip ${tip.height}, ${tip.totalwork > this.consensus.getHtip().totalWork ? `${tip.totalwork} > ${this.consensus.getHtip().totalWork}` : `${tip.height} > ${this.consensus.getBtip().height}`}`)
                await peer.headerSync(tip)
            }
        } catch (e) {
            logger.debug(e)
        }
        if (this.go) {
            setTimeout(() => this.headerSync().catch((e) => logger.fatal(`??? ${e}`)), delay)
        }
    }
    private async blockSync(delay: number = 1000) {
        try {
            const promise = new EliminationRace<ICandidatePeer>()
            for (const peer of await this.network.getPeers()) {
                promise.add(peer.getBTip().then((tip) => ({ peer, tip })).catch((e) => logger.debug(e)))
            }
            const filter = (peer: ICandidatePeer) => peer !== undefined && peer.tip !== undefined && (peer.tip.totalwork > this.consensus.getBtip().totalWork || peer.tip.height > this.consensus.getBtip().height)
            const reply = await promise.race(filter)
            if (reply.length > 0) {
                const { peer, tip } = reply[0]
                logger.info(`Syncing blocks from peer with tip ${tip.height}, ${tip.totalwork > this.consensus.getBtip().totalWork ? `${tip.totalwork} > ${this.consensus.getBtip().totalWork}` : `${tip.height} > ${this.consensus.getBtip().height}`}`)
                //if (peer.getVersion() > 5) {
                //    await peer.txSync(tip)
                //} else {
                await peer.blockSync(tip)
                //}
            }
        } catch (e) {
            logger.error(e)
        }
        if (this.go) {
            setTimeout(() => this.blockSync().catch((e) => logger.fatal(`??? ${e}`)), delay)
        }
    }
}
