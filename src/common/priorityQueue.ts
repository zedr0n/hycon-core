export class PriorityQueue<T> {
    private queue: T[]
    private maxLength: number

    constructor(maxLength: number) {
        this.queue = []
        this.maxLength = maxLength
    }

    public insert(value: T, comparator: (a: T, b: T) => number) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.queue.length; i++) {
            const item = this.peek(i)
            const compare = comparator(value, item)
            if (compare < 0 || compare === 0) {
                // insert the value before the retrieved item
                const upperQueue = this.queue.slice(i)
                const lowerQueue = this.queue.slice(0, i)
                lowerQueue.push(item)
                this.queue = lowerQueue.concat(upperQueue)
                return i
            }
        }
    }

    public peek(index: number) {
        return this.queue[index]
    }
}
