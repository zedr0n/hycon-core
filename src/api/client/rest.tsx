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
    amount: string
    estimated: string
    receiveTime?: number
    confirmation?: number
    blockHash?: string
    fee?: string
    from?: string
    to?: string
    signature?: string
}
export interface IBlock {
    hash: string
    height?: number
    txs: ITxProp[]
    timeStamp: number
    difficulty: number
    prevBlock?: string
    nonce?: string
    txSummary?: string
    resultHash?: string
    stateRoot?: string
    merkleRoot?: string
    miner?: string
}
export interface IWalletAddress {
    hash: string
    balance: string
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
    balance?: string
    txs?: ITxProp[]
    language?: string
}
export interface IRest {
    loadingListener(callback: (loading: boolean) => void): void
    hyconWalletListener(callback: (isHyconWallet: boolean) => void): void
    setLoading(loading: boolean): void
    setIsHyconWallet(isHyconWallet: boolean): void
    // Exchange Featured
    createNewWallet(meta: IHyconWallet): Promise<IHyconWallet | IResponseError>
    getWalletBalance(address: string): Promise<{ balance: string } | IResponseError>
    getWalletTransactions(address: string, nonce?: number): Promise<{ txs: ITxProp[] } | IResponseError>

    outgoingSignedTx(tx: { privateKey: string, from: string, to: string, amount: string, fee: string }, queueTx?: Function): Promise<{ txHash: string } | IResponseError>
    outgoingTx(tx: { signature: string, from: string, to: string, amount: string, fee: string, nonce: number, recovery: number }, queueTx?: Function): Promise<{ txHash: string } | IResponseError>

    // tslint:disable:adjacent-overload-signatures
    // BlockExplorer
    // [Depreciated] changeAccount(name: string, represent: number): Promise<boolean>
    deleteWallet(name: string): Promise<boolean>
    generateWallet(Hwallet: IHyconWallet): Promise<string>
    getAddressInfo(address: string): Promise<IWalletAddress>
    getAllAccounts(name: string): Promise<{ represent: number, accounts: Array<{ address: string, balance: string }> } | boolean>
    getBlock(hash: string): Promise<IBlock>
    getBlockList(index: number): Promise<{ blocks: IBlock[], length: number }>
    getLanguage(): Promise<string[]>
    getMnemonic(lang: string): Promise<string>
    // [ipeer.ts not implemented] getPeerDetails(hash: string): Promise<IPeer>
    // [ipeer.ts not implemented] getPeersList(hash: string): Promise<IPeer[]>
    getTx(hash: string): Promise<ITxProp | IResponseError>
    getWalletDetail(name: string): Promise<IHyconWallet>
    getWalletList(): Promise<IHyconWallet[]>
    recoverWallet(Hwallet: IHyconWallet): Promise<string | boolean>
    // [Depreciated: Use above] recoverWalletForce(Hwallet: IHyconWallet): Promise<string | boolean>
    sendTx(tx: { name: string, password: string, address: string, amount: number, minerFee: number }, queueTx?: Function): Promise<boolean>
    getPendingTxs(): Promise<{ txs: ITxProp[], length: number }>
}
