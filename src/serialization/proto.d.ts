import * as $protobuf from "protobufjs";

/** Properties of a Node. */
export interface INode {

    /** Node newTx */
    newTx?: INewTx;

    /** Node newBlock */
    newBlock?: INewBlock;

    /** Node getHeaders */
    getHeaders?: IGetHeaders;

    /** Node getHeadersReturn */
    getHeadersReturn?: IGetHeadersReturn;

    /** Node getBlocks */
    getBlocks?: IGetBlocks;

    /** Node getBlocksReturn */
    getBlocksReturn?: IGetBlocksReturn;

    /** Node getBlocksByRange */
    getBlocksByRange?: IGetBlocksByRange;

    /** Node getBlocksByRangeReturn */
    getBlocksByRangeReturn?: IGetBlocksByRangeReturn;

    /** Node getHeadersByRange */
    getHeadersByRange?: IGetHeadersByRange;

    /** Node getHeadersByRangeReturn */
    getHeadersByRangeReturn?: IGetHeadersByRangeReturn;

    /** Node ping */
    ping?: IPing;

    /** Node pingResponse */
    pingResponse?: IPingReturn;
}

/** Represents a Node. */
export class Node implements INode {

    /**
     * Constructs a new Node.
     * @param [properties] Properties to set
     */
    constructor(properties?: INode);

    /** Node newTx. */
    public newTx?: INewTx;

    /** Node newBlock. */
    public newBlock?: INewBlock;

    /** Node getHeaders. */
    public getHeaders?: IGetHeaders;

    /** Node getHeadersReturn. */
    public getHeadersReturn?: IGetHeadersReturn;

    /** Node getBlocks. */
    public getBlocks?: IGetBlocks;

    /** Node getBlocksReturn. */
    public getBlocksReturn?: IGetBlocksReturn;

    /** Node getBlocksByRange. */
    public getBlocksByRange?: IGetBlocksByRange;

    /** Node getBlocksByRangeReturn. */
    public getBlocksByRangeReturn?: IGetBlocksByRangeReturn;

    /** Node getHeadersByRange. */
    public getHeadersByRange?: IGetHeadersByRange;

    /** Node getHeadersByRangeReturn. */
    public getHeadersByRangeReturn?: IGetHeadersByRangeReturn;

    /** Node ping. */
    public ping?: IPing;

    /** Node pingResponse. */
    public pingResponse?: IPingReturn;

    /** Node request. */
    public request?: ("newTx"|"newBlock"|"getHeaders"|"getHeadersReturn"|"getBlocks"|"getBlocksReturn"|"getBlocksByRange"|"getBlocksByRangeReturn"|"getHeadersByRange"|"getHeadersByRangeReturn"|"ping"|"pingResponse");

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

/** Properties of a Ping. */
export interface IPing {

    /** Ping nonce */
    nonce?: number|Long;
}

/** Represents a Ping. */
export class Ping implements IPing {

    /**
     * Constructs a new Ping.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPing);

    /** Ping nonce. */
    public nonce: (number|Long);

    /**
     * Creates a new Ping instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Ping instance
     */
    public static create(properties?: IPing): Ping;

    /**
     * Encodes the specified Ping message. Does not implicitly {@link Ping.verify|verify} messages.
     * @param message Ping message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPing, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Ping message, length delimited. Does not implicitly {@link Ping.verify|verify} messages.
     * @param message Ping message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPing, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Ping message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Ping;

    /**
     * Decodes a Ping message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Ping;

    /**
     * Verifies a Ping message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Ping message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Ping
     */
    public static fromObject(object: { [k: string]: any }): Ping;

    /**
     * Creates a plain object from a Ping message. Also converts values to other types if specified.
     * @param message Ping
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Ping, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Ping to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PingReturn. */
export interface IPingReturn {

    /** PingReturn nonce */
    nonce?: number|Long;
}

/** Represents a PingReturn. */
export class PingReturn implements IPingReturn {

    /**
     * Constructs a new PingReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPingReturn);

    /** PingReturn nonce. */
    public nonce: (number|Long);

    /**
     * Creates a new PingReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PingReturn instance
     */
    public static create(properties?: IPingReturn): PingReturn;

    /**
     * Encodes the specified PingReturn message. Does not implicitly {@link PingReturn.verify|verify} messages.
     * @param message PingReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPingReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PingReturn message, length delimited. Does not implicitly {@link PingReturn.verify|verify} messages.
     * @param message PingReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPingReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PingReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PingReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PingReturn;

    /**
     * Decodes a PingReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PingReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PingReturn;

    /**
     * Verifies a PingReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PingReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PingReturn
     */
    public static fromObject(object: { [k: string]: any }): PingReturn;

    /**
     * Creates a plain object from a PingReturn message. Also converts values to other types if specified.
     * @param message PingReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PingReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PingReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a NewTx. */
export interface INewTx {

    /** NewTx txs */
    txs?: ITx[];
}

/** Represents a NewTx. */
export class NewTx implements INewTx {

    /**
     * Constructs a new NewTx.
     * @param [properties] Properties to set
     */
    constructor(properties?: INewTx);

    /** NewTx txs. */
    public txs: ITx[];

    /**
     * Creates a new NewTx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewTx instance
     */
    public static create(properties?: INewTx): NewTx;

    /**
     * Encodes the specified NewTx message. Does not implicitly {@link NewTx.verify|verify} messages.
     * @param message NewTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INewTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewTx message, length delimited. Does not implicitly {@link NewTx.verify|verify} messages.
     * @param message NewTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INewTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NewTx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NewTx;

    /**
     * Decodes a NewTx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NewTx;

    /**
     * Verifies a NewTx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NewTx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewTx
     */
    public static fromObject(object: { [k: string]: any }): NewTx;

    /**
     * Creates a plain object from a NewTx message. Also converts values to other types if specified.
     * @param message NewTx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NewTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NewTx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a NewBlock. */
export interface INewBlock {

    /** NewBlock blocks */
    blocks?: IBlock[];
}

/** Represents a NewBlock. */
export class NewBlock implements INewBlock {

    /**
     * Constructs a new NewBlock.
     * @param [properties] Properties to set
     */
    constructor(properties?: INewBlock);

    /** NewBlock blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new NewBlock instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewBlock instance
     */
    public static create(properties?: INewBlock): NewBlock;

    /**
     * Encodes the specified NewBlock message. Does not implicitly {@link NewBlock.verify|verify} messages.
     * @param message NewBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INewBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewBlock message, length delimited. Does not implicitly {@link NewBlock.verify|verify} messages.
     * @param message NewBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INewBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NewBlock message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NewBlock;

    /**
     * Decodes a NewBlock message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NewBlock;

    /**
     * Verifies a NewBlock message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NewBlock message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewBlock
     */
    public static fromObject(object: { [k: string]: any }): NewBlock;

    /**
     * Creates a plain object from a NewBlock message. Also converts values to other types if specified.
     * @param message NewBlock
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NewBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NewBlock to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeaders. */
export interface IGetHeaders {

    /** GetHeaders headerReqNum */
    headerReqNum?: number|Long;

    /** GetHeaders height */
    height?: number|Long;

    /** GetHeaders hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetHeaders. */
export class GetHeaders implements IGetHeaders {

    /**
     * Constructs a new GetHeaders.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeaders);

    /** GetHeaders headerReqNum. */
    public headerReqNum: (number|Long);

    /** GetHeaders height. */
    public height: (number|Long);

    /** GetHeaders hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetHeaders instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeaders instance
     */
    public static create(properties?: IGetHeaders): GetHeaders;

    /**
     * Encodes the specified GetHeaders message. Does not implicitly {@link GetHeaders.verify|verify} messages.
     * @param message GetHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeaders message, length delimited. Does not implicitly {@link GetHeaders.verify|verify} messages.
     * @param message GetHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeaders message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeaders;

    /**
     * Decodes a GetHeaders message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeaders;

    /**
     * Verifies a GetHeaders message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeaders message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeaders
     */
    public static fromObject(object: { [k: string]: any }): GetHeaders;

    /**
     * Creates a plain object from a GetHeaders message. Also converts values to other types if specified.
     * @param message GetHeaders
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeaders to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersReturn. */
export interface IGetHeadersReturn {

    /** GetHeadersReturn success */
    success?: boolean;

    /** GetHeadersReturn blocks */
    blocks?: IBlockHeaders;
}

/** Represents a GetHeadersReturn. */
export class GetHeadersReturn implements IGetHeadersReturn {

    /**
     * Constructs a new GetHeadersReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersReturn);

    /** GetHeadersReturn success. */
    public success: boolean;

    /** GetHeadersReturn blocks. */
    public blocks?: IBlockHeaders;

    /**
     * Creates a new GetHeadersReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersReturn instance
     */
    public static create(properties?: IGetHeadersReturn): GetHeadersReturn;

    /**
     * Encodes the specified GetHeadersReturn message. Does not implicitly {@link GetHeadersReturn.verify|verify} messages.
     * @param message GetHeadersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersReturn message, length delimited. Does not implicitly {@link GetHeadersReturn.verify|verify} messages.
     * @param message GetHeadersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersReturn;

    /**
     * Decodes a GetHeadersReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersReturn;

    /**
     * Verifies a GetHeadersReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersReturn
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersReturn;

    /**
     * Creates a plain object from a GetHeadersReturn message. Also converts values to other types if specified.
     * @param message GetHeadersReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocks. */
export interface IGetBlocks {

    /** GetBlocks hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetBlocks. */
export class GetBlocks implements IGetBlocks {

    /**
     * Constructs a new GetBlocks.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocks);

    /** GetBlocks hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetBlocks instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocks instance
     */
    public static create(properties?: IGetBlocks): GetBlocks;

    /**
     * Encodes the specified GetBlocks message. Does not implicitly {@link GetBlocks.verify|verify} messages.
     * @param message GetBlocks message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocks, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocks message, length delimited. Does not implicitly {@link GetBlocks.verify|verify} messages.
     * @param message GetBlocks message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocks, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocks message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocks
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocks;

    /**
     * Decodes a GetBlocks message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocks
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocks;

    /**
     * Verifies a GetBlocks message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocks message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocks
     */
    public static fromObject(object: { [k: string]: any }): GetBlocks;

    /**
     * Creates a plain object from a GetBlocks message. Also converts values to other types if specified.
     * @param message GetBlocks
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocks, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocks to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksReturn. */
export interface IGetBlocksReturn {

    /** GetBlocksReturn success */
    success?: boolean;

    /** GetBlocksReturn blocks */
    blocks?: IBlock[];
}

/** Represents a GetBlocksReturn. */
export class GetBlocksReturn implements IGetBlocksReturn {

    /**
     * Constructs a new GetBlocksReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksReturn);

    /** GetBlocksReturn success. */
    public success: boolean;

    /** GetBlocksReturn blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new GetBlocksReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksReturn instance
     */
    public static create(properties?: IGetBlocksReturn): GetBlocksReturn;

    /**
     * Encodes the specified GetBlocksReturn message. Does not implicitly {@link GetBlocksReturn.verify|verify} messages.
     * @param message GetBlocksReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksReturn message, length delimited. Does not implicitly {@link GetBlocksReturn.verify|verify} messages.
     * @param message GetBlocksReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksReturn;

    /**
     * Decodes a GetBlocksReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksReturn;

    /**
     * Verifies a GetBlocksReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksReturn
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksReturn;

    /**
     * Creates a plain object from a GetBlocksReturn message. Also converts values to other types if specified.
     * @param message GetBlocksReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetTxs. */
export interface IGetTxs {

    /** GetTxs minFee */
    minFee?: number|Long;
}

/** Represents a GetTxs. */
export class GetTxs implements IGetTxs {

    /**
     * Constructs a new GetTxs.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetTxs);

    /** GetTxs minFee. */
    public minFee: (number|Long);

    /**
     * Creates a new GetTxs instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetTxs instance
     */
    public static create(properties?: IGetTxs): GetTxs;

    /**
     * Encodes the specified GetTxs message. Does not implicitly {@link GetTxs.verify|verify} messages.
     * @param message GetTxs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetTxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetTxs message, length delimited. Does not implicitly {@link GetTxs.verify|verify} messages.
     * @param message GetTxs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetTxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetTxs message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetTxs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetTxs;

    /**
     * Decodes a GetTxs message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetTxs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetTxs;

    /**
     * Verifies a GetTxs message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetTxs message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetTxs
     */
    public static fromObject(object: { [k: string]: any }): GetTxs;

    /**
     * Creates a plain object from a GetTxs message. Also converts values to other types if specified.
     * @param message GetTxs
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetTxs, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetTxs to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetTxsReturn. */
export interface IGetTxsReturn {

    /** GetTxsReturn success */
    success?: boolean;

    /** GetTxsReturn blocks */
    blocks?: ITx[];
}

/** Represents a GetTxsReturn. */
export class GetTxsReturn implements IGetTxsReturn {

    /**
     * Constructs a new GetTxsReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetTxsReturn);

    /** GetTxsReturn success. */
    public success: boolean;

    /** GetTxsReturn blocks. */
    public blocks: ITx[];

    /**
     * Creates a new GetTxsReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetTxsReturn instance
     */
    public static create(properties?: IGetTxsReturn): GetTxsReturn;

    /**
     * Encodes the specified GetTxsReturn message. Does not implicitly {@link GetTxsReturn.verify|verify} messages.
     * @param message GetTxsReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetTxsReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetTxsReturn message, length delimited. Does not implicitly {@link GetTxsReturn.verify|verify} messages.
     * @param message GetTxsReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetTxsReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetTxsReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetTxsReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetTxsReturn;

    /**
     * Decodes a GetTxsReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetTxsReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetTxsReturn;

    /**
     * Verifies a GetTxsReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetTxsReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetTxsReturn
     */
    public static fromObject(object: { [k: string]: any }): GetTxsReturn;

    /**
     * Creates a plain object from a GetTxsReturn message. Also converts values to other types if specified.
     * @param message GetTxsReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetTxsReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetTxsReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksByRange. */
export interface IGetBlocksByRange {

    /** GetBlocksByRange fromHeight */
    fromHeight?: number|Long;

    /** GetBlocksByRange count */
    count?: number|Long;
}

/** Represents a GetBlocksByRange. */
export class GetBlocksByRange implements IGetBlocksByRange {

    /**
     * Constructs a new GetBlocksByRange.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByRange);

    /** GetBlocksByRange fromHeight. */
    public fromHeight: (number|Long);

    /** GetBlocksByRange count. */
    public count: (number|Long);

    /**
     * Creates a new GetBlocksByRange instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByRange instance
     */
    public static create(properties?: IGetBlocksByRange): GetBlocksByRange;

    /**
     * Encodes the specified GetBlocksByRange message. Does not implicitly {@link GetBlocksByRange.verify|verify} messages.
     * @param message GetBlocksByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByRange message, length delimited. Does not implicitly {@link GetBlocksByRange.verify|verify} messages.
     * @param message GetBlocksByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByRange message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByRange;

    /**
     * Decodes a GetBlocksByRange message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByRange;

    /**
     * Verifies a GetBlocksByRange message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByRange message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByRange
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByRange;

    /**
     * Creates a plain object from a GetBlocksByRange message. Also converts values to other types if specified.
     * @param message GetBlocksByRange
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByRange to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksByRangeReturn. */
export interface IGetBlocksByRangeReturn {

    /** GetBlocksByRangeReturn success */
    success?: boolean;

    /** GetBlocksByRangeReturn blocks */
    blocks?: IBlock[];
}

/** Represents a GetBlocksByRangeReturn. */
export class GetBlocksByRangeReturn implements IGetBlocksByRangeReturn {

    /**
     * Constructs a new GetBlocksByRangeReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByRangeReturn);

    /** GetBlocksByRangeReturn success. */
    public success: boolean;

    /** GetBlocksByRangeReturn blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new GetBlocksByRangeReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByRangeReturn instance
     */
    public static create(properties?: IGetBlocksByRangeReturn): GetBlocksByRangeReturn;

    /**
     * Encodes the specified GetBlocksByRangeReturn message. Does not implicitly {@link GetBlocksByRangeReturn.verify|verify} messages.
     * @param message GetBlocksByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByRangeReturn message, length delimited. Does not implicitly {@link GetBlocksByRangeReturn.verify|verify} messages.
     * @param message GetBlocksByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByRangeReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByRangeReturn;

    /**
     * Decodes a GetBlocksByRangeReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByRangeReturn;

    /**
     * Verifies a GetBlocksByRangeReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByRangeReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByRangeReturn
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByRangeReturn;

    /**
     * Creates a plain object from a GetBlocksByRangeReturn message. Also converts values to other types if specified.
     * @param message GetBlocksByRangeReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByRangeReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByRangeReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByRange. */
export interface IGetHeadersByRange {

    /** GetHeadersByRange fromHeight */
    fromHeight?: number|Long;

    /** GetHeadersByRange count */
    count?: number|Long;
}

/** Represents a GetHeadersByRange. */
export class GetHeadersByRange implements IGetHeadersByRange {

    /**
     * Constructs a new GetHeadersByRange.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByRange);

    /** GetHeadersByRange fromHeight. */
    public fromHeight: (number|Long);

    /** GetHeadersByRange count. */
    public count: (number|Long);

    /**
     * Creates a new GetHeadersByRange instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByRange instance
     */
    public static create(properties?: IGetHeadersByRange): GetHeadersByRange;

    /**
     * Encodes the specified GetHeadersByRange message. Does not implicitly {@link GetHeadersByRange.verify|verify} messages.
     * @param message GetHeadersByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByRange message, length delimited. Does not implicitly {@link GetHeadersByRange.verify|verify} messages.
     * @param message GetHeadersByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByRange message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByRange;

    /**
     * Decodes a GetHeadersByRange message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByRange;

    /**
     * Verifies a GetHeadersByRange message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByRange message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByRange
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByRange;

    /**
     * Creates a plain object from a GetHeadersByRange message. Also converts values to other types if specified.
     * @param message GetHeadersByRange
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByRange to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByRangeReturn. */
export interface IGetHeadersByRangeReturn {

    /** GetHeadersByRangeReturn success */
    success?: boolean;

    /** GetHeadersByRangeReturn blocks */
    blocks?: IBlockHeaders;
}

/** Represents a GetHeadersByRangeReturn. */
export class GetHeadersByRangeReturn implements IGetHeadersByRangeReturn {

    /**
     * Constructs a new GetHeadersByRangeReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByRangeReturn);

    /** GetHeadersByRangeReturn success. */
    public success: boolean;

    /** GetHeadersByRangeReturn blocks. */
    public blocks?: IBlockHeaders;

    /**
     * Creates a new GetHeadersByRangeReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByRangeReturn instance
     */
    public static create(properties?: IGetHeadersByRangeReturn): GetHeadersByRangeReturn;

    /**
     * Encodes the specified GetHeadersByRangeReturn message. Does not implicitly {@link GetHeadersByRangeReturn.verify|verify} messages.
     * @param message GetHeadersByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByRangeReturn message, length delimited. Does not implicitly {@link GetHeadersByRangeReturn.verify|verify} messages.
     * @param message GetHeadersByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByRangeReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByRangeReturn;

    /**
     * Decodes a GetHeadersByRangeReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByRangeReturn;

    /**
     * Verifies a GetHeadersByRangeReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByRangeReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByRangeReturn
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByRangeReturn;

    /**
     * Creates a plain object from a GetHeadersByRangeReturn message. Also converts values to other types if specified.
     * @param message GetHeadersByRangeReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByRangeReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByRangeReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Ping. */
export interface IPing {

    /** Ping nonce */
    nonce?: number|Long;
}

/** Represents a Ping. */
export class Ping implements IPing {

    /**
     * Constructs a new Ping.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPing);

    /** Ping nonce. */
    public nonce: (number|Long);

    /**
     * Creates a new Ping instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Ping instance
     */
    public static create(properties?: IPing): Ping;

    /**
     * Encodes the specified Ping message. Does not implicitly {@link Ping.verify|verify} messages.
     * @param message Ping message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPing, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Ping message, length delimited. Does not implicitly {@link Ping.verify|verify} messages.
     * @param message Ping message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPing, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Ping message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Ping;

    /**
     * Decodes a Ping message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Ping;

    /**
     * Verifies a Ping message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Ping message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Ping
     */
    public static fromObject(object: { [k: string]: any }): Ping;

    /**
     * Creates a plain object from a Ping message. Also converts values to other types if specified.
     * @param message Ping
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Ping, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Ping to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PingReturn. */
export interface IPingReturn {

    /** PingReturn nonce */
    nonce?: number|Long;
}

/** Represents a PingReturn. */
export class PingReturn implements IPingReturn {

    /**
     * Constructs a new PingReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPingReturn);

    /** PingReturn nonce. */
    public nonce: (number|Long);

    /**
     * Creates a new PingReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PingReturn instance
     */
    public static create(properties?: IPingReturn): PingReturn;

    /**
     * Encodes the specified PingReturn message. Does not implicitly {@link PingReturn.verify|verify} messages.
     * @param message PingReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPingReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PingReturn message, length delimited. Does not implicitly {@link PingReturn.verify|verify} messages.
     * @param message PingReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPingReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PingReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PingReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PingReturn;

    /**
     * Decodes a PingReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PingReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PingReturn;

    /**
     * Verifies a PingReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PingReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PingReturn
     */
    public static fromObject(object: { [k: string]: any }): PingReturn;

    /**
     * Creates a plain object from a PingReturn message. Also converts values to other types if specified.
     * @param message PingReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PingReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PingReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a NewTx. */
export interface INewTx {

    /** NewTx txs */
    txs?: ITx[];
}

/** Represents a NewTx. */
export class NewTx implements INewTx {

    /**
     * Constructs a new NewTx.
     * @param [properties] Properties to set
     */
    constructor(properties?: INewTx);

    /** NewTx txs. */
    public txs: ITx[];

    /**
     * Creates a new NewTx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewTx instance
     */
    public static create(properties?: INewTx): NewTx;

    /**
     * Encodes the specified NewTx message. Does not implicitly {@link NewTx.verify|verify} messages.
     * @param message NewTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INewTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewTx message, length delimited. Does not implicitly {@link NewTx.verify|verify} messages.
     * @param message NewTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INewTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NewTx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NewTx;

    /**
     * Decodes a NewTx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NewTx;

    /**
     * Verifies a NewTx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NewTx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewTx
     */
    public static fromObject(object: { [k: string]: any }): NewTx;

    /**
     * Creates a plain object from a NewTx message. Also converts values to other types if specified.
     * @param message NewTx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NewTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NewTx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a NewBlock. */
export interface INewBlock {

    /** NewBlock blocks */
    blocks?: IBlock[];
}

/** Represents a NewBlock. */
export class NewBlock implements INewBlock {

    /**
     * Constructs a new NewBlock.
     * @param [properties] Properties to set
     */
    constructor(properties?: INewBlock);

    /** NewBlock blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new NewBlock instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NewBlock instance
     */
    public static create(properties?: INewBlock): NewBlock;

    /**
     * Encodes the specified NewBlock message. Does not implicitly {@link NewBlock.verify|verify} messages.
     * @param message NewBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INewBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NewBlock message, length delimited. Does not implicitly {@link NewBlock.verify|verify} messages.
     * @param message NewBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INewBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NewBlock message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NewBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NewBlock;

    /**
     * Decodes a NewBlock message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NewBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NewBlock;

    /**
     * Verifies a NewBlock message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NewBlock message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NewBlock
     */
    public static fromObject(object: { [k: string]: any }): NewBlock;

    /**
     * Creates a plain object from a NewBlock message. Also converts values to other types if specified.
     * @param message NewBlock
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NewBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NewBlock to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeaders. */
export interface IGetHeaders {

    /** GetHeaders headerReqNum */
    headerReqNum?: number|Long;

    /** GetHeaders height */
    height?: number|Long;

    /** GetHeaders hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetHeaders. */
export class GetHeaders implements IGetHeaders {

    /**
     * Constructs a new GetHeaders.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeaders);

    /** GetHeaders headerReqNum. */
    public headerReqNum: (number|Long);

    /** GetHeaders height. */
    public height: (number|Long);

    /** GetHeaders hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetHeaders instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeaders instance
     */
    public static create(properties?: IGetHeaders): GetHeaders;

    /**
     * Encodes the specified GetHeaders message. Does not implicitly {@link GetHeaders.verify|verify} messages.
     * @param message GetHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeaders message, length delimited. Does not implicitly {@link GetHeaders.verify|verify} messages.
     * @param message GetHeaders message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeaders message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeaders;

    /**
     * Decodes a GetHeaders message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeaders;

    /**
     * Verifies a GetHeaders message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeaders message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeaders
     */
    public static fromObject(object: { [k: string]: any }): GetHeaders;

    /**
     * Creates a plain object from a GetHeaders message. Also converts values to other types if specified.
     * @param message GetHeaders
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeaders to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersReturn. */
export interface IGetHeadersReturn {

    /** GetHeadersReturn success */
    success?: boolean;

    /** GetHeadersReturn blocks */
    blocks?: IBlockHeaders;
}

/** Represents a GetHeadersReturn. */
export class GetHeadersReturn implements IGetHeadersReturn {

    /**
     * Constructs a new GetHeadersReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersReturn);

    /** GetHeadersReturn success. */
    public success: boolean;

    /** GetHeadersReturn blocks. */
    public blocks?: IBlockHeaders;

    /**
     * Creates a new GetHeadersReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersReturn instance
     */
    public static create(properties?: IGetHeadersReturn): GetHeadersReturn;

    /**
     * Encodes the specified GetHeadersReturn message. Does not implicitly {@link GetHeadersReturn.verify|verify} messages.
     * @param message GetHeadersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersReturn message, length delimited. Does not implicitly {@link GetHeadersReturn.verify|verify} messages.
     * @param message GetHeadersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersReturn;

    /**
     * Decodes a GetHeadersReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersReturn;

    /**
     * Verifies a GetHeadersReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersReturn
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersReturn;

    /**
     * Creates a plain object from a GetHeadersReturn message. Also converts values to other types if specified.
     * @param message GetHeadersReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocks. */
export interface IGetBlocks {

    /** GetBlocks hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetBlocks. */
export class GetBlocks implements IGetBlocks {

    /**
     * Constructs a new GetBlocks.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocks);

    /** GetBlocks hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetBlocks instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocks instance
     */
    public static create(properties?: IGetBlocks): GetBlocks;

    /**
     * Encodes the specified GetBlocks message. Does not implicitly {@link GetBlocks.verify|verify} messages.
     * @param message GetBlocks message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocks, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocks message, length delimited. Does not implicitly {@link GetBlocks.verify|verify} messages.
     * @param message GetBlocks message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocks, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocks message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocks
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocks;

    /**
     * Decodes a GetBlocks message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocks
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocks;

    /**
     * Verifies a GetBlocks message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocks message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocks
     */
    public static fromObject(object: { [k: string]: any }): GetBlocks;

    /**
     * Creates a plain object from a GetBlocks message. Also converts values to other types if specified.
     * @param message GetBlocks
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocks, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocks to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksReturn. */
export interface IGetBlocksReturn {

    /** GetBlocksReturn success */
    success?: boolean;

    /** GetBlocksReturn blocks */
    blocks?: IBlock[];
}

/** Represents a GetBlocksReturn. */
export class GetBlocksReturn implements IGetBlocksReturn {

    /**
     * Constructs a new GetBlocksReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksReturn);

    /** GetBlocksReturn success. */
    public success: boolean;

    /** GetBlocksReturn blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new GetBlocksReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksReturn instance
     */
    public static create(properties?: IGetBlocksReturn): GetBlocksReturn;

    /**
     * Encodes the specified GetBlocksReturn message. Does not implicitly {@link GetBlocksReturn.verify|verify} messages.
     * @param message GetBlocksReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksReturn message, length delimited. Does not implicitly {@link GetBlocksReturn.verify|verify} messages.
     * @param message GetBlocksReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksReturn;

    /**
     * Decodes a GetBlocksReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksReturn;

    /**
     * Verifies a GetBlocksReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksReturn
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksReturn;

    /**
     * Creates a plain object from a GetBlocksReturn message. Also converts values to other types if specified.
     * @param message GetBlocksReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetTxs. */
export interface IGetTxs {

    /** GetTxs minFee */
    minFee?: number|Long;
}

/** Represents a GetTxs. */
export class GetTxs implements IGetTxs {

    /**
     * Constructs a new GetTxs.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetTxs);

    /** GetTxs minFee. */
    public minFee: (number|Long);

    /**
     * Creates a new GetTxs instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetTxs instance
     */
    public static create(properties?: IGetTxs): GetTxs;

    /**
     * Encodes the specified GetTxs message. Does not implicitly {@link GetTxs.verify|verify} messages.
     * @param message GetTxs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetTxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetTxs message, length delimited. Does not implicitly {@link GetTxs.verify|verify} messages.
     * @param message GetTxs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetTxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetTxs message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetTxs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetTxs;

    /**
     * Decodes a GetTxs message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetTxs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetTxs;

    /**
     * Verifies a GetTxs message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetTxs message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetTxs
     */
    public static fromObject(object: { [k: string]: any }): GetTxs;

    /**
     * Creates a plain object from a GetTxs message. Also converts values to other types if specified.
     * @param message GetTxs
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetTxs, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetTxs to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetTxsReturn. */
export interface IGetTxsReturn {

    /** GetTxsReturn success */
    success?: boolean;

    /** GetTxsReturn blocks */
    blocks?: ITx[];
}

/** Represents a GetTxsReturn. */
export class GetTxsReturn implements IGetTxsReturn {

    /**
     * Constructs a new GetTxsReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetTxsReturn);

    /** GetTxsReturn success. */
    public success: boolean;

    /** GetTxsReturn blocks. */
    public blocks: ITx[];

    /**
     * Creates a new GetTxsReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetTxsReturn instance
     */
    public static create(properties?: IGetTxsReturn): GetTxsReturn;

    /**
     * Encodes the specified GetTxsReturn message. Does not implicitly {@link GetTxsReturn.verify|verify} messages.
     * @param message GetTxsReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetTxsReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetTxsReturn message, length delimited. Does not implicitly {@link GetTxsReturn.verify|verify} messages.
     * @param message GetTxsReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetTxsReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetTxsReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetTxsReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetTxsReturn;

    /**
     * Decodes a GetTxsReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetTxsReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetTxsReturn;

    /**
     * Verifies a GetTxsReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetTxsReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetTxsReturn
     */
    public static fromObject(object: { [k: string]: any }): GetTxsReturn;

    /**
     * Creates a plain object from a GetTxsReturn message. Also converts values to other types if specified.
     * @param message GetTxsReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetTxsReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetTxsReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksByRange. */
export interface IGetBlocksByRange {

    /** GetBlocksByRange fromHeight */
    fromHeight?: number|Long;

    /** GetBlocksByRange count */
    count?: number|Long;
}

/** Represents a GetBlocksByRange. */
export class GetBlocksByRange implements IGetBlocksByRange {

    /**
     * Constructs a new GetBlocksByRange.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByRange);

    /** GetBlocksByRange fromHeight. */
    public fromHeight: (number|Long);

    /** GetBlocksByRange count. */
    public count: (number|Long);

    /**
     * Creates a new GetBlocksByRange instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByRange instance
     */
    public static create(properties?: IGetBlocksByRange): GetBlocksByRange;

    /**
     * Encodes the specified GetBlocksByRange message. Does not implicitly {@link GetBlocksByRange.verify|verify} messages.
     * @param message GetBlocksByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByRange message, length delimited. Does not implicitly {@link GetBlocksByRange.verify|verify} messages.
     * @param message GetBlocksByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByRange message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByRange;

    /**
     * Decodes a GetBlocksByRange message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByRange;

    /**
     * Verifies a GetBlocksByRange message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByRange message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByRange
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByRange;

    /**
     * Creates a plain object from a GetBlocksByRange message. Also converts values to other types if specified.
     * @param message GetBlocksByRange
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByRange to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksByRangeReturn. */
export interface IGetBlocksByRangeReturn {

    /** GetBlocksByRangeReturn success */
    success?: boolean;

    /** GetBlocksByRangeReturn blocks */
    blocks?: IBlock[];
}

/** Represents a GetBlocksByRangeReturn. */
export class GetBlocksByRangeReturn implements IGetBlocksByRangeReturn {

    /**
     * Constructs a new GetBlocksByRangeReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByRangeReturn);

    /** GetBlocksByRangeReturn success. */
    public success: boolean;

    /** GetBlocksByRangeReturn blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new GetBlocksByRangeReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByRangeReturn instance
     */
    public static create(properties?: IGetBlocksByRangeReturn): GetBlocksByRangeReturn;

    /**
     * Encodes the specified GetBlocksByRangeReturn message. Does not implicitly {@link GetBlocksByRangeReturn.verify|verify} messages.
     * @param message GetBlocksByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByRangeReturn message, length delimited. Does not implicitly {@link GetBlocksByRangeReturn.verify|verify} messages.
     * @param message GetBlocksByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByRangeReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByRangeReturn;

    /**
     * Decodes a GetBlocksByRangeReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByRangeReturn;

    /**
     * Verifies a GetBlocksByRangeReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByRangeReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByRangeReturn
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByRangeReturn;

    /**
     * Creates a plain object from a GetBlocksByRangeReturn message. Also converts values to other types if specified.
     * @param message GetBlocksByRangeReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByRangeReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByRangeReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByRange. */
export interface IGetHeadersByRange {

    /** GetHeadersByRange fromHeight */
    fromHeight?: number|Long;

    /** GetHeadersByRange count */
    count?: number|Long;
}

/** Represents a GetHeadersByRange. */
export class GetHeadersByRange implements IGetHeadersByRange {

    /**
     * Constructs a new GetHeadersByRange.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByRange);

    /** GetHeadersByRange fromHeight. */
    public fromHeight: (number|Long);

    /** GetHeadersByRange count. */
    public count: (number|Long);

    /**
     * Creates a new GetHeadersByRange instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByRange instance
     */
    public static create(properties?: IGetHeadersByRange): GetHeadersByRange;

    /**
     * Encodes the specified GetHeadersByRange message. Does not implicitly {@link GetHeadersByRange.verify|verify} messages.
     * @param message GetHeadersByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByRange message, length delimited. Does not implicitly {@link GetHeadersByRange.verify|verify} messages.
     * @param message GetHeadersByRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByRange, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByRange message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByRange;

    /**
     * Decodes a GetHeadersByRange message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByRange;

    /**
     * Verifies a GetHeadersByRange message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByRange message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByRange
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByRange;

    /**
     * Creates a plain object from a GetHeadersByRange message. Also converts values to other types if specified.
     * @param message GetHeadersByRange
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByRange to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByRangeReturn. */
export interface IGetHeadersByRangeReturn {

    /** GetHeadersByRangeReturn success */
    success?: boolean;

    /** GetHeadersByRangeReturn blocks */
    blocks?: IBlockHeaders;
}

/** Represents a GetHeadersByRangeReturn. */
export class GetHeadersByRangeReturn implements IGetHeadersByRangeReturn {

    /**
     * Constructs a new GetHeadersByRangeReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByRangeReturn);

    /** GetHeadersByRangeReturn success. */
    public success: boolean;

    /** GetHeadersByRangeReturn blocks. */
    public blocks?: IBlockHeaders;

    /**
     * Creates a new GetHeadersByRangeReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByRangeReturn instance
     */
    public static create(properties?: IGetHeadersByRangeReturn): GetHeadersByRangeReturn;

    /**
     * Encodes the specified GetHeadersByRangeReturn message. Does not implicitly {@link GetHeadersByRangeReturn.verify|verify} messages.
     * @param message GetHeadersByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByRangeReturn message, length delimited. Does not implicitly {@link GetHeadersByRangeReturn.verify|verify} messages.
     * @param message GetHeadersByRangeReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByRangeReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByRangeReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByRangeReturn;

    /**
     * Decodes a GetHeadersByRangeReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByRangeReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByRangeReturn;

    /**
     * Verifies a GetHeadersByRangeReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByRangeReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByRangeReturn
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByRangeReturn;

    /**
     * Creates a plain object from a GetHeadersByRangeReturn message. Also converts values to other types if specified.
     * @param message GetHeadersByRangeReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByRangeReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByRangeReturn to JSON.
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

/** Properties of a DBState. */
export interface IDBState {

    /** DBState account */
    account?: IAccount;

    /** DBState node */
    node?: IStateNode;

    /** DBState refCount */
    refCount?: number;
}

/** Represents a DBState. */
export class DBState implements IDBState {

    /**
     * Constructs a new DBState.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDBState);

    /** DBState account. */
    public account?: IAccount;

    /** DBState node. */
    public node?: IStateNode;

    /** DBState refCount. */
    public refCount: number;

    /** DBState state. */
    public state?: ("account"|"node"|"refCount");

    /**
     * Creates a new DBState instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DBState instance
     */
    public static create(properties?: IDBState): DBState;

    /**
     * Encodes the specified DBState message. Does not implicitly {@link DBState.verify|verify} messages.
     * @param message DBState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDBState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DBState message, length delimited. Does not implicitly {@link DBState.verify|verify} messages.
     * @param message DBState message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDBState, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a DBState message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DBState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DBState;

    /**
     * Decodes a DBState message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DBState
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DBState;

    /**
     * Verifies a DBState message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a DBState message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DBState
     */
    public static fromObject(object: { [k: string]: any }): DBState;

    /**
     * Creates a plain object from a DBState message. Also converts values to other types if specified.
     * @param message DBState
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: DBState, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this DBState to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of an Account. */
export interface IAccount {

    /** Account balance */
    balance?: number|Long;

    /** Account nonce */
    nonce?: number;
}

/** Represents an Account. */
export class Account implements IAccount {

    /**
     * Constructs a new Account.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAccount);

    /** Account balance. */
    public balance: (number|Long);

    /** Account nonce. */
    public nonce: number;

    /**
     * Creates a new Account instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Account instance
     */
    public static create(properties?: IAccount): Account;

    /**
     * Encodes the specified Account message. Does not implicitly {@link Account.verify|verify} messages.
     * @param message Account message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Account message, length delimited. Does not implicitly {@link Account.verify|verify} messages.
     * @param message Account message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Account message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Account
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Account;

    /**
     * Decodes an Account message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Account
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Account;

    /**
     * Verifies an Account message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Account message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Account
     */
    public static fromObject(object: { [k: string]: any }): Account;

    /**
     * Creates a plain object from an Account message. Also converts values to other types if specified.
     * @param message Account
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Account, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Account to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a StateNode. */
export interface IStateNode {

    /** StateNode nodeRefs */
    nodeRefs?: INodeRef[];
}

/** Represents a StateNode. */
export class StateNode implements IStateNode {

    /**
     * Constructs a new StateNode.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStateNode);

    /** StateNode nodeRefs. */
    public nodeRefs: INodeRef[];

    /**
     * Creates a new StateNode instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StateNode instance
     */
    public static create(properties?: IStateNode): StateNode;

    /**
     * Encodes the specified StateNode message. Does not implicitly {@link StateNode.verify|verify} messages.
     * @param message StateNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStateNode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StateNode message, length delimited. Does not implicitly {@link StateNode.verify|verify} messages.
     * @param message StateNode message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStateNode, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StateNode message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StateNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): StateNode;

    /**
     * Decodes a StateNode message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StateNode
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): StateNode;

    /**
     * Verifies a StateNode message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a StateNode message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns StateNode
     */
    public static fromObject(object: { [k: string]: any }): StateNode;

    /**
     * Creates a plain object from a StateNode message. Also converts values to other types if specified.
     * @param message StateNode
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: StateNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this StateNode to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a NodeRef. */
export interface INodeRef {

    /** NodeRef address */
    address?: Uint8Array;

    /** NodeRef child */
    child?: Uint8Array;
}

/** Represents a NodeRef. */
export class NodeRef implements INodeRef {

    /**
     * Constructs a new NodeRef.
     * @param [properties] Properties to set
     */
    constructor(properties?: INodeRef);

    /** NodeRef address. */
    public address: Uint8Array;

    /** NodeRef child. */
    public child: Uint8Array;

    /**
     * Creates a new NodeRef instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NodeRef instance
     */
    public static create(properties?: INodeRef): NodeRef;

    /**
     * Encodes the specified NodeRef message. Does not implicitly {@link NodeRef.verify|verify} messages.
     * @param message NodeRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INodeRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NodeRef message, length delimited. Does not implicitly {@link NodeRef.verify|verify} messages.
     * @param message NodeRef message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INodeRef, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NodeRef message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NodeRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NodeRef;

    /**
     * Decodes a NodeRef message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NodeRef
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NodeRef;

    /**
     * Verifies a NodeRef message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NodeRef message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NodeRef
     */
    public static fromObject(object: { [k: string]: any }): NodeRef;

    /**
     * Creates a plain object from a NodeRef message. Also converts values to other types if specified.
     * @param message NodeRef
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NodeRef, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NodeRef to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
