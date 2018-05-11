import { } from "es6-promise/auto"
// tslint:disable:ban-types
export interface IResponseError {
    status: number,
    timestamp: number,
    error: string
    message: string
}

export interface IUser {
    idx: number
    uname: string
    pw: string
}

export interface ITxProp {
    hash: string
    amount: number
    fee?: number
    from?: string
    to?: string
    signature?: string
}
export interface IBlock {
    hash: string
    height: number
    txs: ITxProp[]
    timeStamp: number
    difficulty: number
    prevBlock?: string
    nonce?: number
    txSummary?: number,
}
export interface IWalletAddress {
    hash: string
    balance: number
    txs: ITxProp[]
}
export interface IPeer {
    name: string
    location: string
    isMiner: boolean
    ip: string
    port: number
    nodes: number
    lastBlock: string
    pendingTransaction: number
    nodeLatency: number
    peersNumber: number
    latitude: number
    longitude: number
}

export interface ILocationDetails {
    location: string
    lat: number
    lng: number
    count: number
}

export interface IHyconWallet {
    name?: string
    password?: string
    hint?: string
    mnemonic?: string
    address?: string
    balance?: number
    txs?: ITxProp[]
    language?: string
}
export interface IRest {
    loadingListener(callback: (loading: boolean) => void): void
    hyconWalletListener(callback: (isHyconWallet: boolean) => void): void
    setLoading(loading: boolean): void
    setIsHyconWallet(isHyconWallet: boolean): void
    createNewWallet(meta: IHyconWallet): Promise<IHyconWallet | IResponseError>
    getWalletBalance(address: string): Promise<{balance: number} | IResponseError>
    getWalletTransactions(address: string, nonce?: number): Promise<{ txs: ITxProp[]} | IResponseError>

    outgoingSignedTx(tx: { privateKey: string, from: string, to: string, amount: number, fee: number }, queueTx?: Function): Promise<{txHash: string} | IResponseError>
    outgoingTx(tx: { signature: string, from: string, to: string, amount: number, fee: number, nonce: number, recovery: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError>

    // tslint:disable:adjacent-overload-signatures
    getAddressInfo(address: string): Promise<IWalletAddress>
    loadingListener(callback: (loading: boolean) => void): void
    setLoading(loading: boolean): void
}
