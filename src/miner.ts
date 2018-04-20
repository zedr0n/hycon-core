type Tx = any; // TODO: define type
type Block = any; // TODO: define type
type BlockMinedCallback = (block: Block) => void;
export interface IMiner {
    newTopTxs(topTxs: Tx[]): void;
    newTopBlock(topBlock: Block): void;
    start(): void;
    stop(): void;
    addCallbackNewBlock(callback: BlockMinedCallback, priority?: number): void;
    removeCallbackNewBlock(callback: BlockMinedCallback): void;
}
