import { resolve } from "dns"

type lockCallBack = () => void
export class AsyncLock {
    private locked: boolean
    private lockTransferQueue: lockCallBack[]
    constructor() {
        this.locked = false
        this.lockTransferQueue = []
    }
    public async getLock(): Promise<boolean> {
        try {
            if (this.locked) {
                await new Promise((resolved, _) => {
                    this.lockTransferQueue.push(resolved)
                })
            }
            this.locked = true
            return this.locked
        } catch (e) {
            return false
        }

    }
    public transferLock() {
        if (this.locked && this.lockTransferQueue.length > 0) {
            const transfer = this.lockTransferQueue.splice(0, 1)[0]
            transfer()
        } else {
            this.locked = false
        }
    }

    public releaseLock() {
        if (this.locked && this.lockTransferQueue.length > 0) {
            const transfer = this.lockTransferQueue.splice(0, 1)[0]
            setImmediate(transfer)
        } else {
            this.locked = false
        }
    }

    public async criticle<T>(f: () => Promise<T>): Promise<T> {
        await this.getLock()
        try {
            const result = await f()
            this.releaseLock()
            return result
        } catch (e) {
            this.releaseLock()
            throw e
        }
    }
}

async function lockTest() {
    const lock = new AsyncLock()
    let counter = 0
    const n = 50000
    const x = Date.now()
    const promises = []
    for (let i = 0; i < n; i++) {
        const promise = await lock.criticle<number>(async () => {
            counter = await new Promise<number>((resolved, reject) => {
                // reject("asd")
                resolved(counter + 1)
            })
            // tslint:disable-next-line:no-console
            console.log(counter)
            return counter
        })
        promises.push(promise)
    }
    try {
        await Promise.all(promises)
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(`Error: ${n}: ${e}`)
    }
    const y = Date.now()
    const time = y - x
    // tslint:disable-next-line:no-console
    console.log(time)
}

// lockTest()
