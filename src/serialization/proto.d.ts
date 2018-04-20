import * as $protobuf from "protobufjs";

/** Properties of a Node. */
export interface INode {
}

/** Represents a Node. */
export class Node implements INode {

    /**
     * Constructs a new Node.
     * @param [properties] Properties to set
     */
    constructor(properties?: INode);

    /**
     * Creates a new Node instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Node instance
     */
    public static create(properties?: INode): Node;

    /**
     * Encodes the specified Node message. Does not implicitly {@link Node.verify|verify} messages.
     * @param message Node message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Node message, length delimited. Does not implicitly {@link Node.verify|verify} messages.
     * @param message Node message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Node message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Node
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Node;

    /**
     * Decodes a Node message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Node
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Node;

    /**
     * Verifies a Node message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Node message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Node
     */
    public static fromObject(object: { [k: string]: any }): Node;

    /**
     * Creates a plain object from a Node message. Also converts values to other types if specified.
     * @param message Node
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Node, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Node to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Block. */
export interface IBlock {

    /** Block header */
    header?: IBlockHeader;

    /** Block miner */
    miner?: Uint8Array;

    /** Block txs */
    txs?: ITx[];
}

/** Represents a Block. */
export class Block implements IBlock {

    /**
     * Constructs a new Block.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBlock);

    /** Block header. */
    public header?: IBlockHeader;

    /** Block miner. */
    public miner: Uint8Array;

    /** Block txs. */
    public txs: ITx[];

    /**
     * Creates a new Block instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Block instance
     */
    public static create(properties?: IBlock): Block;

    /**
     * Encodes the specified Block message. Does not implicitly {@link Block.verify|verify} messages.
     * @param message Block message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Block message, length delimited. Does not implicitly {@link Block.verify|verify} messages.
     * @param message Block message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Block message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Block
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Block;

    /**
     * Decodes a Block message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Block
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Block;

    /**
     * Verifies a Block message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Block message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Block
     */
    public static fromObject(object: { [k: string]: any }): Block;

    /**
     * Creates a plain object from a Block message. Also converts values to other types if specified.
     * @param message Block
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Block, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Block to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a BlockDB. */
export interface IBlockDB {

    /** BlockDB height */
    height?: number;

    /** BlockDB fileNumber */
    fileNumber?: number;

    /** BlockDB offset */
    offset?: number;

    /** BlockDB header */
    header?: IBlockHeader;

    /** BlockDB length */
    length?: number;
}

/** Represents a BlockDB. */
export class BlockDB implements IBlockDB {

    /**
     * Constructs a new BlockDB.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBlockDB);

    /** BlockDB height. */
    public height: number;

    /** BlockDB fileNumber. */
    public fileNumber: number;

    /** BlockDB offset. */
    public offset: number;

    /** BlockDB header. */
    public header?: IBlockHeader;

    /** BlockDB length. */
    public length: number;

    /**
     * Creates a new BlockDB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlockDB instance
     */
    public static create(properties?: IBlockDB): BlockDB;

    /**
     * Encodes the specified BlockDB message. Does not implicitly {@link BlockDB.verify|verify} messages.
     * @param message BlockDB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBlockDB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlockDB message, length delimited. Does not implicitly {@link BlockDB.verify|verify} messages.
     * @param message BlockDB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBlockDB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BlockDB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlockDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BlockDB;

    /**
     * Decodes a BlockDB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlockDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BlockDB;

    /**
     * Verifies a BlockDB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BlockDB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlockDB
     */
    public static fromObject(object: { [k: string]: any }): BlockDB;

    /**
     * Creates a plain object from a BlockDB message. Also converts values to other types if specified.
     * @param message BlockDB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BlockDB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BlockDB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Txs. */
export interface ITxs {

    /** Txs txs */
    txs?: ITx[];
}

/** Represents a Txs. */
export class Txs implements ITxs {

    /**
     * Constructs a new Txs.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITxs);

    /** Txs txs. */
    public txs: ITx[];

    /**
     * Creates a new Txs instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Txs instance
     */
    public static create(properties?: ITxs): Txs;

    /**
     * Encodes the specified Txs message. Does not implicitly {@link Txs.verify|verify} messages.
     * @param message Txs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Txs message, length delimited. Does not implicitly {@link Txs.verify|verify} messages.
     * @param message Txs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Txs message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Txs;

    /**
     * Decodes a Txs message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Txs;

    /**
     * Verifies a Txs message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Txs message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Txs
     */
    public static fromObject(object: { [k: string]: any }): Txs;

    /**
     * Creates a plain object from a Txs message. Also converts values to other types if specified.
     * @param message Txs
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Txs, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Txs to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Tx. */
export interface ITx {

    /** Tx from */
    from?: Uint8Array;

    /** Tx to */
    to?: Uint8Array;

    /** Tx amount */
    amount?: number|Long;

    /** Tx fee */
    fee?: number|Long;

    /** Tx nonce */
    nonce?: number;

    /** Tx signature */
    signature?: Uint8Array;

    /** Tx recovery */
    recovery?: number;
}

/** Represents a Tx. */
export class Tx implements ITx {

    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITx);

    /** Tx from. */
    public from: Uint8Array;

    /** Tx to. */
    public to: Uint8Array;

    /** Tx amount. */
    public amount: (number|Long);

    /** Tx fee. */
    public fee: (number|Long);

    /** Tx nonce. */
    public nonce: number;

    /** Tx signature. */
    public signature: Uint8Array;

    /** Tx recovery. */
    public recovery: number;

    /**
     * Creates a new Tx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tx instance
     */
    public static create(properties?: ITx): Tx;

    /**
     * Encodes the specified Tx message. Does not implicitly {@link Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Tx;

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Tx;

    /**
     * Verifies a Tx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tx
     */
    public static fromObject(object: { [k: string]: any }): Tx;

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @param message Tx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Tx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a TxDB. */
export interface ITxDB {

    /** TxDB hash */
    hash?: Uint8Array;

    /** TxDB blockHash */
    blockHash?: Uint8Array;

    /** TxDB blockHeight */
    blockHeight?: number;

    /** TxDB txNumber */
    txNumber?: number;
}

/** Represents a TxDB. */
export class TxDB implements ITxDB {

    /**
     * Constructs a new TxDB.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITxDB);

    /** TxDB hash. */
    public hash: Uint8Array;

    /** TxDB blockHash. */
    public blockHash: Uint8Array;

    /** TxDB blockHeight. */
    public blockHeight: number;

    /** TxDB txNumber. */
    public txNumber: number;

    /**
     * Creates a new TxDB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TxDB instance
     */
    public static create(properties?: ITxDB): TxDB;

    /**
     * Encodes the specified TxDB message. Does not implicitly {@link TxDB.verify|verify} messages.
     * @param message TxDB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITxDB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TxDB message, length delimited. Does not implicitly {@link TxDB.verify|verify} messages.
     * @param message TxDB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITxDB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TxDB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TxDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TxDB;

    /**
     * Decodes a TxDB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TxDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TxDB;

    /**
     * Verifies a TxDB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a TxDB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TxDB
     */
    public static fromObject(object: { [k: string]: any }): TxDB;

    /**
     * Creates a plain object from a TxDB message. Also converts values to other types if specified.
     * @param message TxDB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TxDB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TxDB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a BlockHeader. */
export interface IBlockHeader {

    /** BlockHeader previousHash */
    previousHash?: Uint8Array[];

    /** BlockHeader merkleRoot */
    merkleRoot?: Uint8Array;

    /** BlockHeader stateRoot */
    stateRoot?: Uint8Array;

    /** BlockHeader difficulty */
    difficulty?: number;

    /** BlockHeader timeStamp */
    timeStamp?: number|Long;

    /** BlockHeader nonce */
    nonce?: number|Long;
}

/** Represents a BlockHeader. */
export class BlockHeader implements IBlockHeader {

    /**
     * Constructs a new BlockHeader.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBlockHeader);

    /** BlockHeader previousHash. */
    public previousHash: Uint8Array[];

    /** BlockHeader merkleRoot. */
    public merkleRoot: Uint8Array;

    /** BlockHeader stateRoot. */
    public stateRoot: Uint8Array;

    /** BlockHeader difficulty. */
    public difficulty: number;

    /** BlockHeader timeStamp. */
    public timeStamp: (number|Long);

    /** BlockHeader nonce. */
    public nonce: (number|Long);

    /**
     * Creates a new BlockHeader instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlockHeader instance
     */
    public static create(properties?: IBlockHeader): BlockHeader;

    /**
     * Encodes the specified BlockHeader message. Does not implicitly {@link BlockHeader.verify|verify} messages.
     * @param message BlockHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlockHeader message, length delimited. Does not implicitly {@link BlockHeader.verify|verify} messages.
     * @param message BlockHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BlockHeader message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlockHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BlockHeader;

    /**
     * Decodes a BlockHeader message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlockHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BlockHeader;

    /**
     * Verifies a BlockHeader message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BlockHeader message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlockHeader
     */
    public static fromObject(object: { [k: string]: any }): BlockHeader;

    /**
     * Creates a plain object from a BlockHeader message. Also converts values to other types if specified.
     * @param message BlockHeader
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BlockHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BlockHeader to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a BlockHeaders. */
export interface IBlockHeaders {

    /** BlockHeaders blockHeaders */
    blockHeaders?: IBlockHeader[];

    /** BlockHeaders maxHeight */
    maxHeight?: number;
}

/** Represents a BlockHeaders. */
export class BlockHeaders implements IBlockHeaders {

    /**
     * Constructs a new BlockHeaders.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBlockHeaders);

    /** BlockHeaders blockHeaders. */
    public blockHeaders: IBlockHeader[];

    /** BlockHeaders maxHeight. */
    public maxHeight: number;

    /**
     * Creates a new BlockHeaders instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BlockHeaders instance
     */
    public static create(properties?: IBlockHeaders): BlockHeaders;

    /**
     * Encodes the specified BlockHeaders message. Does not implicitly {@link BlockHeaders.verify|verify} messages.
     * @param message BlockHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBlockHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BlockHeaders message, length delimited. Does not implicitly {@link BlockHeaders.verify|verify} messages.
     * @param message BlockHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBlockHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BlockHeaders message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BlockHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BlockHeaders;

    /**
     * Decodes a BlockHeaders message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BlockHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BlockHeaders;

    /**
     * Verifies a BlockHeaders message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BlockHeaders message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BlockHeaders
     */
    public static fromObject(object: { [k: string]: any }): BlockHeaders;

    /**
     * Creates a plain object from a BlockHeaders message. Also converts values to other types if specified.
     * @param message BlockHeaders
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BlockHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BlockHeaders to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
