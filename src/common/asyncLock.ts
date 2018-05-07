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

    public async critical<T>(f: () => Promise<T>): Promise<T> {
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
