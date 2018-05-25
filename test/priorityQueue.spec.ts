import { PriorityQueue } from "../src/common/priorityQueue"

fdescribe("PriorityQueue", () => {
    it("insert: 1 should insert an item into an empty priority queue", () => {
        const queue = new PriorityQueue()
        const comparator = () => 0
        const value = 0
        queue.insert(value, comparator)

        expect(queue.peek(0)).toEqual(value)
    })

    it("insert: 2 should insert an item into a queue with existing elements to the end of the queue", () => {
        const queue = new PriorityQueue()
        const comparator = (a: number, b: number) => a - b
        const value = 3

        queue.insert(1, comparator)
        queue.insert(2, comparator)
        queue.insert(value, comparator)

        expect(queue.peek(2)).toEqual(value)
    })

    it("insert: 3 should insert an item into the middle of a priority queue", () => {
        const queue = new PriorityQueue()
        const comparator = (a: number, b: number) => a - b
        const value = 3

        queue.insert(0, comparator)
        queue.insert(1, comparator)
        queue.insert(2, comparator)
        queue.insert(4, comparator)
        queue.insert(5, comparator)
        queue.insert(value, comparator)

        expect(queue.peek(3)).toEqual(value)
    })

    it("insert: 4 should insert an item into the front of a priority queue", () => {
        const queue = new PriorityQueue()
        const comparator = (a: number, b: number) => a - b
        const value = 3

        queue.insert(4, comparator)
        queue.insert(5, comparator)
        queue.insert(6, comparator)
        queue.insert(7, comparator)
        queue.insert(value, comparator)

        expect(queue.peek(0)).toEqual(value)
    })

    it("insert: 5 should reject an item of the wrong type", () => {
        const queue = new PriorityQueue()
        const comparator = (a: number, b: number) => a - b
        const value = "3"

        queue.insert(1, comparator)

        expect(queue.insert.bind(value, comparator)).toThrowError()
    })
})
