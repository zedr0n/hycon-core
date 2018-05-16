import levelup = require("levelup")
import { getLogger } from "log4js"
import Long = require("long")
import rocksdb = require("rocksdb")
import { Address } from "../../common/address"
import { AsyncLock } from "../../common/asyncLock"
import { Block } from "../../common/block"
import { GenesisBlock } from "../../common/blockGenesis"
import { PublicKey } from "../../common/publicKey"
import { GenesisSignedTx } from "../../common/txGenesisSigned"
import { SignedTx } from "../../common/txSigned"
import { Server } from "../../server"
import { hycontoString } from "../../util/commonUtil"
import { Hash } from "../../util/hash"
import * as mnemonic from "../../wallet/mnemonic"
import { Wallet } from "../../wallet/wallet"
import { verifyTx } from "../singleChain"
import { Account } from "./account"
import { DBState } from "./dbState"
import { NodeRef } from "./nodeRef"
import { StateNode } from "./stateNode"
// tslint:disable-next-line:no-var-requires
const assert = require("assert")
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

    public async print(hash: Hash, n: number = 0, prefix: Uint8Array = new Uint8Array([])) {
        try {
            let indent = ""
            for (let i = 0; i < n; i++) {
                indent += "\t"
            }
            const object = await this.getDBState(hash)
            if (object.node !== undefined) {
                logger.info(`${indent}StateNode '${hash}' '${prefix}'  : count(${object.refCount})`)
                const i = 0
                for (const node of object.node.nodeRefs) {
                    await this.print(node.child, n + 1, concat(prefix, node.address))
                }
            } else if (object.account !== undefined) {
                logger.info(`${indent}(${prefix.length})${new Address(prefix).toString()} --> ${hycontoString(object.account.balance)} --> (${hash.toString()}) : count(${object.refCount})`)
            } else {
                logger.info(`${indent}Could not find '${hash.toString()}'`)
            }
        } catch (e) {
            return Promise.reject("Print Error : " + e)
        }
    }


    public async first(genesis: GenesisBlock): Promise<IStateTransition> {
        try {
            // TODO: Support more complex genesis blocks
            const batch: DBState[] = []
            const mapAccount: Map<string, DBState> = new Map<string, DBState>()
            const stateNode = new StateNode()
            genesis.txs.sort((a, b) => a.to[0] - b.to[0])

            for (const tx of genesis.txs) {
                if (!verifyTx(tx)) { continue }
                const toAccount = new Account({ balance: +tx.amount, nonce: 0 })
                const toAccountHash = this.put(batch, mapAccount, toAccount)
                const nodeRef = new NodeRef({ address: tx.to, child: toAccountHash })
                stateNode.nodeRefs.push(nodeRef)
            }
            const currentStateRoot = this.put(batch, mapAccount, stateNode)
            return { currentStateRoot, batch, mapAccount }
        } catch (e) {
            logger.error(`Fail to init : ${e}`)
        }
    }

    public async next(txs: SignedTx[], previousState: Hash, minerAddress?: Address): Promise<{ stateTransition: IStateTransition, validTxs: SignedTx[], invalidTxs: SignedTx[] }> {
        const batch: DBState[] = []
        const changes: IChange[] = []
        const mapAccount: Map<string, DBState> = new Map<string, DBState>()
        const mapIndex: Map<string, number> = new Map<string, number>()
        let fees: Long = Long.fromNumber(0, true)
        const validTxs: SignedTx[] = []
        const invalidTxs: SignedTx[] = []
        return await this.accountLock.critical<{ stateTransition: IStateTransition, validTxs: SignedTx[], invalidTxs: SignedTx[] }>(async () => {
            logger.info(`Next txs : ${txs.length}`)
            for (const tx of txs) {
                if (tx.from.equals(tx.to)) {
                    // TODO: Remove this if function and test
                    invalidTxs.push(tx)
                    logger.debug(`Tx ${new Hash(tx)} Removed: from address ${tx.from.toString()}) == to address (${tx.to.toString()}`)
                    continue
                }
                let fromAccount: Account | undefined
                const fromIndex = mapIndex.get(tx.from.toString())
                if (fromIndex === undefined) {
                    fromAccount = await this.getAccount(previousState, tx.from)
                } else {
                    fromAccount = changes[fromIndex].account
                }
                if (fromAccount === undefined) {
                    invalidTxs.push(tx)
                    logger.error(`Tx ${new Hash(tx)} Rejected: ${tx.from.toString()} has not been seen before, so it has insufficient balance.`)
                    continue
                }
                logger.info(`From balance : ${hycontoString(fromAccount.balance)}`)
                // TODO: Handle coin burn
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
                logger.info(`toAccount balance : ${hycontoString(toAccount.balance)}`)

                if (tx.nonce !== (fromAccount.nonce + 1)) {
                    invalidTxs.push(tx)
                    logger.info(`Tx ${new Hash(tx)} Rejected: TxNonce=${tx.nonce}  ${tx.from}Nonce=${fromAccount.nonce}`)
                    continue
                }

                const total = tx.amount.add(tx.fee)
                if (fromAccount.balance.lessThan(total)) {
                    invalidTxs.push(tx)
                    logger.info(`Tx ${new Hash(tx)} Rejected: The balance of the account is insufficient.`)
                    continue
                }

                validTxs.push(tx)

                fees = fees.add(tx.fee)
                fromAccount.balance = fromAccount.balance.sub(total)
                toAccount.balance = toAccount.balance.add(tx.amount)
                fromAccount.nonce++

                logger.info(`After tx : ${hycontoString(fromAccount.balance)} / ${hycontoString(toAccount.balance)} / ${hycontoString(tx.amount)} / ${hycontoString(tx.fee)}`)

                if (fromIndex === undefined) {
                    mapIndex.set(tx.from.toString(), changes.push({ address: tx.from, account: fromAccount }) - 1)
                } else {
                    changes[fromIndex].account = fromAccount
                }
                if (toIndex === undefined) {
                    mapIndex.set(tx.to.toString(), changes.push({ address: tx.to, account: toAccount }) - 1)
                } else {
                    changes[toIndex].account = toAccount
                }

            }

            if (minerAddress !== undefined) {
                let minerAccount: Account | undefined
                const minerIndex = mapIndex.get(minerAddress.toString())
                if (minerIndex === undefined) {
                    minerAccount = await this.getAccount(previousState, minerAddress)
                } else {
                    minerAccount = changes[minerIndex].account
                }
                if (minerAccount === undefined) { minerAccount = new Account({ balance: 0, nonce: 0 }) }

                minerAccount.balance = minerAccount.balance.add(fees)

                if (minerIndex === undefined) {
                    mapIndex.set(minerAddress.toString(), changes.push({ address: minerAddress, account: minerAccount }) - 1)
                } else {
                    changes[minerIndex].account = minerAccount
                }
            }
            const currentStateRoot = await this.putAccount(batch, mapAccount, changes, previousState)
            return { stateTransition: { currentStateRoot, batch, mapAccount }, validTxs, invalidTxs }
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
}
