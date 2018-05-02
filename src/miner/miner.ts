type Tx = any // TODO: define type
type Block = any // TODO: define type
type BlockMinedCallback = (block: Block) => void
type StateTransition = any
export interface IMiner {
    newCandidateBlock(candidateBlock: Block, stateTransition: StateTransition): void
    start(): void
    stop(): void
    addCallbackNewBlock(callback: BlockMinedCallback, priority?: number): void
    removeCallbackNewBlock(callback: BlockMinedCallback): void
}
