import { getLogger } from "log4js"
import * as net from "net"
import { Socket } from "net"
import { setTimeout } from "timers"
import { BasicPeer, PeerMode, PeerState } from "./basicPeer"
import { IPeer } from "./peer"
import { AppNetwork } from "./appNetwork"
const delay = require("delay")
const logger = getLogger("TcpPeer")

export class AppPeer extends BasicPeer implements IPeer {
    public static MaxTryCount = 20
    public static PollingStep = 100  // milli seconds

    constructor(server: AppNetwork, socket: Socket, mode: PeerMode) {
        super(socket, mode)
        this.server = server

    }

    public close() {
        logger.info(`Replier Gracefullly Closed`)

        switch (this.peerMode) {
            case PeerMode.AcceptedSession:
                this.server.removePeer(this as AppPeer)
                break

            case PeerMode.ConnectedSession:
                setTimeout(() => {
                    this.reconnect()
                }, 2000)
                this.state = PeerState.Disconnected
                break
        }

    }

    public onConnected() {
        logger.debug(`OnConnected`)
        setInterval(() => {
            this.test()
        }, 1000)
    }

    public async test() {
        const result = await this.ping()
        logger.debug(`Ping Result=${result}`)

    }

    public async ping(): Promise<any> {
        super.sendPing()
        let i = AppPeer.MaxTryCount
        while (i-- > 0) {
            await delay(AppPeer.PollingStep)
            if (this.pingReturn) {
                const ret = this.pingReturn
                this.pingReturn = undefined
                return ret
            }
        }
        throw new Error(`Ping Error`)
    }
    public putTx(tx: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getTxs(minFee?: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public putBlock(block: any): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public getBlocksByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getHeaderByHash(hash: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    public getBlocksRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }
    public getHeadersRange(fromHeight: number, count: number): Promise<any[]> {
        throw new Error("Method not implemented.")
    }

}
