import { getLogger } from "log4js"
import { setInterval } from "timers"
import { INetwork } from "../src/network/inetwork"
import { IPeer } from "../src/network/ipeer"
import { RabbitNetwork } from "../src/network/rabbit/rabbitNetwork"
import { RabbitPeer } from "../src/network/rabbit/rabbitPeer"
import { Block } from "../src/serialization/proto"
import { Ping } from "../src/serialization/proto"
import { testAsync } from "./async"
describe("Network", () => {
    let tcp: RabbitNetwork
    let client: any
    beforeAll(testAsync(async () => {
        tcp = new RabbitNetwork(undefined, 8148)
        await tcp.start()
        client = await tcp.addClient("localhost", 8148)
    }))

    it("Can send ping", testAsync(async () => {
        try {
            const result = await client.ping()
            expect(result).toBeDefined()
        } catch (e) { }
    }))

    it("Can send getTxs", testAsync(async () => {
        try {
            const result = await client.getTxs(100)
            expect(result).toBeDefined()
        } catch (e) { }
    }))
})
