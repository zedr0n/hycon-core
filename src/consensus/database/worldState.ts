import levelup = require("levelup")
import { getLogger } from "log4js"
import rocksdb = require("rocksdb")
import { Address } from "../../common/address"
import { AsyncLock } from "../../common/asyncLock"
import { Block } from "../../common/block"
import { GenesisBlock } from "../../common/blockGenesis"
import { PublicKey } from "../../common/publicKey"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { Hash } from "../../util/hash"
import { Account } from "./account"
import { DBState } from "./dbState"
import { NodeRef } from "./nodeRef"
import { StateNode } from "./stateNode"

const logger = getLogger("WorldState")

// tslint:disable:max-line-length
function match(pre: Uint8Array, address: Address, offset: number): boolean {
    if (pre.length > address.length - offset) { return false }
    for (let i = 0; i < pre.length; i++) {
        if (pre[i] !== address[offset + i]) { return false }
    }
    return true
}

function matchLength(pre: Uint8Array, preOffset: number, address: Uint8Array, addressOffset: number, max: number = Number.MAX_SAFE_INTEGER): number {
    let matchedLength = 0
    const length = Math.min(pre.length - preOffset, address.length - addressOffset)
    for (let i = 0; i < length; i++) {
        if (pre[preOffset + i] !== address[addressOffset + i]) { break }
        matchedLength = (i + 1)
    }
    if (matchedLength < max) {
        return matchedLength
    }
    return max
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length)
    c.set(a)
    c.set(b, a.length)
    return c
}

interface IChange { address: Address, account: Account }
export interface IStateTransition { currentStateRoot: Hash, batch: DBState[], mapAccount: Map<string, DBState> }

export class WorldState {
    private accountDB: levelup.LevelUp
    private accountLock: AsyncLock

    constructor(path: string) {
        const rocks: any = rocksdb(path)
        this.accountDB = levelup(rocks)
        this.accountLock = new AsyncLock()
    }

    public first(genesis: GenesisBlock): IStateTransition {
        const batch: DBState[] = []
        const mapAccount: Map<string, DBState> = new Map<string, DBState>()
        const stateNode = new StateNode()
        genesis.txs.sort((a, b) => a.to[0] - b.to[0])

        for (const tx of genesis.txs) {
            if (!this.verifyTx(tx)) { continue }
            const toAccount = new Account({ balance: +tx.amount, nonce: 0 })
            const toHash = this.put(batch, mapAccount, toAccount)
            const nodeRef = new NodeRef({ address: tx.to, child: toHash })
            stateNode.nodeRefs.push(nodeRef)
        }
        const currentStateRoot = this.put(batch, mapAccount, stateNode)
        return { currentStateRoot, batch, mapAccount }
    }

    public async next(block: Block, previousState: Hash): Promise<IStateTransition> {
        const batch: DBState[] = []
        const changes: IChange[] = []
        const mapAccount: Map<string, DBState> = new Map<string, DBState>()
        const mapIndex: Map<string, number> = new Map<string, number>()
        let fees = 0
        return await this.accountLock.critical<IStateTransition>(async () => {
            for (const tx of block.txs) {
                if (tx.from.equals(tx.to)) {
                    return Promise.reject(`Invalid Transaction : from address == to address`)
                }
                let fromAccount: Account | undefined
                const fromIndex = mapIndex.get(tx.from.toString())
                if (fromIndex === undefined) {
                    fromAccount = await this.getAccount(previousState, tx.from)
                } else {
                    fromAccount = changes[fromIndex].account
                }
                if (fromAccount === undefined) {
                    logger.error(`Invalid fromAccount`)
                    continue
                }
                let toAccount: Account | undefined
                const toIndex = mapIndex.get(tx.to.toString())
                if (toIndex === undefined) {
                    toAccount = await this.getAccount(previousState, tx.to)
                } else {
                    toAccount = changes[toIndex].account
                }
                if (toAccount === undefined) {
                    toAccount = new Account({ balance: 0, nonce: 0 })
                }

                if (tx.nonce === (fromAccount.nonce + 1)) {
                    const amount = +tx.amount
                    const fee = +tx.fee
                    fees += fee
                    if (fromAccount.balance >= (amount + fee)) {
                        const fromState = new Account(fromAccount)
                        const toState = new Account(toAccount)
                        fromState.balance -= (amount + fee)
                        toState.balance += amount
                        fromState.nonce++
                        if (fromIndex === undefined) {
                            mapIndex.set(tx.from.toString(), changes.push({ address: tx.from, account: fromState }) - 1)
                        } else {
                            changes[fromIndex].account = fromState
                        }
                        if (toIndex === undefined) {
                            mapIndex.set(tx.to.toString(), changes.push({ address: tx.to, account: toState }) - 1)
                        } else {
                            changes[toIndex].account = toState
                        }
                    } else {
                        return Promise.reject(`The balance of the account is insufficient.`)
                    }
                } else if (tx.nonce > (fromAccount.nonce + 1)) {
                    return Promise.reject(`block.txs[i].tx.nonce >= (fromAccount.nonce + 2)`)
                } else {
                    return Promise.reject(`block.txs[i].tx.nonce <= fromAccount.nonce`)
                }
            }

            // Reward to miner
            let coinBaseAccount: Account | undefined
            const coinBaseIndex = mapIndex.get(block.miner.toString())
            if (coinBaseIndex === undefined) {
                coinBaseAccount = await this.getAccount(previousState, block.miner)
            } else {
                coinBaseAccount = changes[coinBaseIndex].account
            }
            if (coinBaseAccount === undefined) { coinBaseAccount = new Account({ balance: 0, nonce: 0 }) }
            const coinBaseState = new Account(coinBaseAccount)
            coinBaseState.balance += fees
            if (coinBaseIndex === undefined) {
                mapIndex.set(block.miner.toString(), changes.push({ address: block.miner, account: coinBaseState }) - 1)
            } else {
                changes[coinBaseIndex].account = coinBaseState
            }
            const currentStateRoot = await this.putAccount(batch, mapAccount, changes, previousState)
            return Promise.resolve({ currentStateRoot, batch, mapAccount })
        })
    }

    public async getAccount(stateRoot: Hash, address: Address): Promise<Account | undefined> {
        let state = await this.get(stateRoot)
        let isMatched = false
        let offset = 0
        while (state instanceof StateNode) {
            isMatched = false
            for (const refNode of state.nodeRefs) {
                if (match(refNode.address, address, offset)) {
                    offset += refNode.address.length
                    state = await this.get(refNode.child)
                    isMatched = true
                    break
                }
            }
            if (!isMatched) { break }
        }
        if (state === undefined || state instanceof StateNode) {
            return Promise.resolve(undefined)
        }
        return Promise.resolve(state)
    }

    public async putPending(pendings: DBState[], mapAccount: Map<string, DBState>): Promise<undefined> {
        const mapDBChildren: Map<string, DBState> = new Map<string, DBState>()
        const dbChildren: DBState[] = []

        return this.accountLock.critical(async () => {
            for (const pending of pendings) {
                if (pending.node !== undefined) {
                    for (const ref of pending.node.nodeRefs) {
                        const foundMap = mapDBChildren.get(ref.child.toString())
                        if (foundMap !== undefined) {
                            if (mapAccount.get(ref.child.toString()) === undefined) {
                                foundMap.refCount++
                            }
                            continue
                        }
                        const dbChild = await this.getDBState(ref.child).catch((e) => undefined)
                        if (dbChild) {
                            if (mapAccount.get(ref.child.toString()) === undefined) {
                                dbChild.refCount++
                            }
                            dbChildren.push(dbChild)
                            mapDBChildren.set(dbChild.hash().toString(), dbChild)
                        }
                    }
                }
            }
            for (const dbChild of dbChildren) {
                const hash = dbChild.hash().toString()
                const acctInMap = mapAccount.get(hash)
                if (acctInMap !== undefined) {
                    acctInMap.refCount += dbChild.refCount
                } else {
                    pendings.push(dbChild)
                    mapAccount.set(hash, dbChild)
                }
            }

            const batchArray: levelup.Batch[] = []
            for (const pending of pendings) {
                batchArray.push({ type: "put", key: pending.hash().toBuffer(), value: pending.encode() })
            }
            return await this.accountDB.batch(batchArray)
        })
    }

    public async decreaseRefCount(hash: Hash, pending: DBState[], mapAccount: Map<string, DBState>): Promise<DBState[]> {
        let state = mapAccount.get(hash.toString())
        if (state === undefined) {
            state = await this.getDBState(hash)
            pending.push(state)
            mapAccount.set(hash.toString(), state)
        }
        state.refCount--

        if (state.node !== undefined && state.refCount <= 0) {
            for (const node of state.node.nodeRefs) {
                pending = await this.decreaseRefCount(node.child, pending, mapAccount)
            }
        }
        return Promise.resolve(pending)
    }

    public async pruneStateRoot(stateRoot: Hash): Promise<undefined> {
        let pending: DBState[] = []
        const mapAccount: Map<string, DBState> = new Map<string, DBState>()
        pending = await this.decreaseRefCount(stateRoot, pending, mapAccount)

        const batch: levelup.Batch[] = []
        for (const pend of pending) {
            if (pend.refCount <= 0) {
                batch.push({ type: "del", key: pend.hash().toBuffer() })
            } else {
                batch.push({ type: "put", key: pend.hash().toBuffer(), value: pend.encode() })
            }
        }
        return this.accountDB.batch(batch)
    }

    private async putAccount(batch: DBState[], mapAccount: Map<string, DBState>, changes: IChange[], objectHash?: Hash, offset: number = 0, prefix: Uint8Array = new Uint8Array(0), objectAddress?: Uint8Array): Promise<Hash> {
        try {
            let object: StateNode | Account | undefined
            if (objectHash === undefined) {
                if (changes.length === 1) {
                    return this.put(batch, mapAccount, changes[0].account)
                } else if (changes.length === 0) {
                    logger.error(`No changes to make no where in putAccount.`)
                    return Promise.reject("No changes to make no where")
                } else {
                    object = new StateNode()
                }
            } else {
                if (changes.length === 0) { return objectHash }

                const dbObject = await this.get(objectHash)
                if (dbObject === undefined) {
                    logger.error(`Object missing from database : ${objectHash}`)
                    return Promise.reject("Object missing from database." + objectHash)
                }

                object = dbObject
                if (object instanceof StateNode) {
                    if (objectAddress && (prefix.length !== objectAddress.length)) {
                        const newStateNode = new StateNode()
                        const restOfAddress = objectAddress.slice(prefix.length, objectAddress.length)
                        const nodeRef = new NodeRef({ address: restOfAddress, child: objectHash })
                        newStateNode.nodeRefs.push(nodeRef)
                        object = newStateNode
                    }
                }
            }

            if (object instanceof Account) {
                if (objectAddress === undefined) {
                    logger.error(`Object address is missing : ${objectHash}`)
                    return Promise.reject("Object address is missing : " + objectHash)
                }
                const objectAddr = new Address(objectAddress)
                if (changes.length === 1 && changes[0].address.equals(objectAddr)) {
                    return this.put(batch, mapAccount, changes[0].account)
                }
                let isDuple = false
                for (const change of changes) {
                    if (change.address.equals(objectAddr)) {
                        isDuple = true
                        break
                    }
                }
                if (!isDuple) {
                    changes.push({ address: objectAddr, account: object })
                }
                object = new StateNode()
            }

            changes.sort((a, b) => {
                const length = Math.min(a.address.length, b.address.length)
                for (let index = 0; index < length; index++) {
                    const diff = a.address[index] - b.address[index]
                    if (diff !== 0) {
                        return diff
                    }
                }
                return 0
            })

            const changeGroups: IChange[][] = []
            {
                let subChanges: IChange[] = []
                for (const change of changes) {
                    if ((subChanges.length === 0) || (subChanges[0].address[offset] === change.address[offset])) {
                        subChanges.push(change)
                    } else {
                        changeGroups.push(subChanges)
                        subChanges = [change]
                    }
                }
                changeGroups.push(subChanges)
            }

            let i = 0
            for (const subChanges of changeGroups) {

                let objectAddress2: Uint8Array | undefined
                let minMatchLength = matchLength(subChanges[0].address, offset, subChanges[subChanges.length - 1].address, offset)
                while ((i < object.nodeRefs.length) && object.nodeRefs[i].address[0] < subChanges[0].address[offset]) {
                    i++
                }
                if (i < object.nodeRefs.length) {
                    if (object.nodeRefs[i].address[0] === subChanges[0].address[offset]) {
                        minMatchLength = matchLength(object.nodeRefs[i].address, 0, subChanges[0].address, offset, minMatchLength)
                        objectAddress2 = concat(prefix, object.nodeRefs[i].address)
                    } else {
                        object.nodeRefs.splice(i, 0, new NodeRef())
                    }
                } else {
                    object.nodeRefs.push(new NodeRef())
                }
                object.nodeRefs[i].address = subChanges[0].address.slice(offset, offset + minMatchLength)
                const prefix2 = concat(prefix, object.nodeRefs[i].address)

                object.nodeRefs[i].child = await this.putAccount(batch, mapAccount, subChanges, object.nodeRefs[i].child, offset + minMatchLength, prefix2, objectAddress2)
            }
            return this.put(batch, mapAccount, object)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    private async get(hash: Hash): Promise<StateNode | Account> {
        try {
            const dbState = await this.getDBState(hash)
            if (dbState.account !== undefined) {
                return Promise.resolve(dbState.account)
            } else if (dbState.node !== undefined) {
                return Promise.resolve(dbState.node)
            } else {
                logger.error(`Invalid DBState data`)
                return Promise.reject(`Invalid DBState data`)
            }
        } catch (e) {
            if (e.notFound) { logger.error(`NotFound in accountDB : ${hash}`) }
            if (!e.notFound) { logger.error(`Fail to get data from accountDB in get : ${e}`) }
            return Promise.reject(e)
        }
    }

    private async getDBState(hash: Hash): Promise<DBState> {
        let decodeingDBState = false
        try {
            const data = await this.accountDB.get(hash.toBuffer())
            decodeingDBState = true
            const dbState = DBState.decode(data)
            return Promise.resolve(dbState)
        } catch (e) {
            if (e.notFound) {
                logger.warn(`DBState not found in getDBState`)
            } else if (decodeingDBState) {
                logger.error(`Fail to decode DBState in getDBState`)
            } else {
                logger.error(`Fail to getDBState : ${e}`)
            }
            return Promise.reject(e)
        }
    }

    private put(pending: DBState[], mapAccount: Map<string, DBState>, value: (Account | StateNode)): Hash {
        const hash = new Hash(value)
        const state = mapAccount.get(hash.toString())
        if (state === undefined) {
            const newState = new DBState(value, 1)
            pending.push(newState)
            mapAccount.set(hash.toString(), newState)
        } else {
            state.refCount++
        }
        return hash
    }

    private verifyTx(tx: GenesisSignedTx): boolean {
        try {
            const pubKey = new PublicKey(tx)
            if (!pubKey.verify(tx)) { return false }
            return true
        } catch (e) {
            return false
        }
    }
}
