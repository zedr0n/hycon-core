import { address } from "ip"
import { IResponseError } from "../api/client/rest"
import { Address } from "../common/address"
import { TxPool } from "../common/txPool"
import { Database } from "../consensus/database/database"
import { WorldState } from "../consensus/database/worldState"
import { IConsensus } from "../consensus/iconsensus"
import { Server } from "../server"
export class RestManager {
    public useRabbit = true
    public subscription: Map<number, any> | undefined

    public txQueue: TxPool

    public consensus: IConsensus
    private db: Database
    private accountDB: WorldState
    private server: Server
    constructor(server: Server) {
        this.server = server
        this.db = server.db
        this.accountDB = server.accountDB
    }

    // tslint:disable:object-literal-sort-keys
    public async createSubscription(sub: { address: string, url: string, from: boolean, to: boolean }): Promise<{ id: number } | IResponseError> {
        try {
            const addressOfWallet = new Address(sub.address)
            const account = await this.consensus.getAccount(addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            this.subscription = new Map()
            this.subscription.set(Server.subsid, [sub.address, sub.url, sub.from, sub.to])

            return Promise.resolve({
                id: Server.subsid++,
            })
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }

    public async deleteSubscription(walletAddr: string, id: number): Promise<number | IResponseError> {
        try {
            const addressOfWallet = new Address(walletAddr)
            const account = await this.consensus.getAccount(addressOfWallet)
            if (account === undefined) {
                return Promise.resolve({
                    status: 404,
                    timestamp: Date.now(),
                    error: "NOT_FOUND",
                    message: "the resource cannot be found / currently unavailable",
                })
            }

            this.subscription = new Map()
            this.subscription.delete(id)

            return Promise.resolve(204)
        } catch (e) {
            return Promise.resolve({
                status: 400,
                timestamp: Date.now(),
                error: "INVALID_PARAMETER",
                message: e.toString(),
            })
        }
    }
}
