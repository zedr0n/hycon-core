import { Block } from "../common/block"

type BlockMinedCallback = (block: Block) => void
export interface IMiner {
    newCandidateBlock(candidateBlock: Block): void
    start(): void
    stop(): void
    addCallbackNewBlock(callback: BlockMinedCallback, priority?: number): void
    removeCallbackNewBlock(callback: BlockMinedCallback): void
}
