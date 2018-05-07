import * as $protobuf from "protobufjs";

/** Properties of a Network. */
export interface INetwork {

    /** Network status */
    status?: IStatus;

    /** Network statusReturn */
    statusReturn?: IStatusReturn;

    /** Network ping */
    ping?: IPing;

    /** Network pingReturn */
    pingReturn?: IPingReturn;

    /** Network putTx */
    putTx?: IPutTx;

    /** Network putTxReturn */
    putTxReturn?: IPutTxReturn;

    /** Network getTxs */
    getTxs?: IGetTxs;

    /** Network getTxsReturn */
    getTxsReturn?: IGetTxsReturn;

    /** Network putBlock */
    putBlock?: IPutBlock;

    /** Network putBlockReturn */
    putBlockReturn?: IPutBlockReturn;

    /** Network getBlocksByHash */
    getBlocksByHash?: IGetBlocksByHash;

    /** Network getBlocksByHashReturn */
    getBlocksByHashReturn?: IGetBlocksByHashReturn;

    /** Network getHeadersByHash */
    getHeadersByHash?: IGetHeadersByHash;

    /** Network getHeadersByHashReturn */
    getHeadersByHashReturn?: IGetHeadersByHashReturn;

    /** Network getBlocksByRange */
    getBlocksByRange?: IGetBlocksByRange;

    /** Network getBlocksByRangeReturn */
    getBlocksByRangeReturn?: IGetBlocksByRangeReturn;

    /** Network getHeadersByRange */
    getHeadersByRange?: IGetHeadersByRange;

    /** Network getHeadersByRangeReturn */
    getHeadersByRangeReturn?: IGetHeadersByRangeReturn;

    /** Network getPeers */
    getPeers?: IGetPeers;

    /** Network getPeersReturn */
    getPeersReturn?: IGetPeersReturn;
}

/** Represents a Network. */
export class Network implements INetwork {

    /**
     * Constructs a new Network.
     * @param [properties] Properties to set
     */
    constructor(properties?: INetwork);

    /** Network status. */
    public status?: IStatus;

    /** Network statusReturn. */
    public statusReturn?: IStatusReturn;

    /** Network ping. */
    public ping?: IPing;

    /** Network pingReturn. */
    public pingReturn?: IPingReturn;

    /** Network putTx. */
    public putTx?: IPutTx;

    /** Network putTxReturn. */
    public putTxReturn?: IPutTxReturn;

    /** Network getTxs. */
    public getTxs?: IGetTxs;

    /** Network getTxsReturn. */
    public getTxsReturn?: IGetTxsReturn;

    /** Network putBlock. */
    public putBlock?: IPutBlock;

    /** Network putBlockReturn. */
    public putBlockReturn?: IPutBlockReturn;

    /** Network getBlocksByHash. */
    public getBlocksByHash?: IGetBlocksByHash;

    /** Network getBlocksByHashReturn. */
    public getBlocksByHashReturn?: IGetBlocksByHashReturn;

    /** Network getHeadersByHash. */
    public getHeadersByHash?: IGetHeadersByHash;

    /** Network getHeadersByHashReturn. */
    public getHeadersByHashReturn?: IGetHeadersByHashReturn;

    /** Network getBlocksByRange. */
    public getBlocksByRange?: IGetBlocksByRange;

    /** Network getBlocksByRangeReturn. */
    public getBlocksByRangeReturn?: IGetBlocksByRangeReturn;

    /** Network getHeadersByRange. */
    public getHeadersByRange?: IGetHeadersByRange;

    /** Network getHeadersByRangeReturn. */
    public getHeadersByRangeReturn?: IGetHeadersByRangeReturn;

    /** Network getPeers. */
    public getPeers?: IGetPeers;

    /** Network getPeersReturn. */
    public getPeersReturn?: IGetPeersReturn;

    /** Network request. */
    public request?: ("status"|"statusReturn"|"ping"|"pingReturn"|"putTx"|"putTxReturn"|"getTxs"|"getTxsReturn"|"putBlock"|"putBlockReturn"|"getBlocksByHash"|"getBlocksByHashReturn"|"getHeadersByHash"|"getHeadersByHashReturn"|"getBlocksByRange"|"getBlocksByRangeReturn"|"getHeadersByRange"|"getHeadersByRangeReturn"|"getPeers"|"getPeersReturn");

    /**
     * Creates a new Network instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Network instance
     */
    public static create(properties?: INetwork): Network;

    /**
     * Encodes the specified Network message. Does not implicitly {@link Network.verify|verify} messages.
     * @param message Network message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INetwork, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Network message, length delimited. Does not implicitly {@link Network.verify|verify} messages.
     * @param message Network message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INetwork, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Network message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Network
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Network;

    /**
     * Decodes a Network message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Network
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Network;

    /**
     * Verifies a Network message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Network message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Network
     */
    public static fromObject(object: { [k: string]: any }): Network;

    /**
     * Creates a plain object from a Network message. Also converts values to other types if specified.
     * @param message Network
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Network, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Network to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Status. */
export interface IStatus {

    /** Status version */
    version?: number|Long;

    /** Status networkid */
    networkid?: string;

    /** Status hash */
    hash?: Uint8Array;

    /** Status ip */
    ip?: string;

    /** Status port */
    port?: number;
}

/** Represents a Status. */
export class Status implements IStatus {

    /**
     * Constructs a new Status.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStatus);

    /** Status version. */
    public version: (number|Long);

    /** Status networkid. */
    public networkid: string;

    /** Status hash. */
    public hash: Uint8Array;

    /** Status ip. */
    public ip: string;

    /** Status port. */
    public port: number;

    /**
     * Creates a new Status instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Status instance
     */
    public static create(properties?: IStatus): Status;

    /**
     * Encodes the specified Status message. Does not implicitly {@link Status.verify|verify} messages.
     * @param message Status message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Status message, length delimited. Does not implicitly {@link Status.verify|verify} messages.
     * @param message Status message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStatus, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Status message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Status
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Status;

    /**
     * Decodes a Status message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Status
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Status;

    /**
     * Verifies a Status message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Status message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Status
     */
    public static fromObject(object: { [k: string]: any }): Status;

    /**
     * Creates a plain object from a Status message. Also converts values to other types if specified.
     * @param message Status
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Status, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Status to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a StatusReturn. */
export interface IStatusReturn {

    /** StatusReturn success */
    success?: boolean;

    /** StatusReturn status */
    status?: IStatus;
}

/** Represents a StatusReturn. */
export class StatusReturn implements IStatusReturn {

    /**
     * Constructs a new StatusReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStatusReturn);

    /** StatusReturn success. */
    public success: boolean;

    /** StatusReturn status. */
    public status?: IStatus;

    /**
     * Creates a new StatusReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StatusReturn instance
     */
    public static create(properties?: IStatusReturn): StatusReturn;

    /**
     * Encodes the specified StatusReturn message. Does not implicitly {@link StatusReturn.verify|verify} messages.
     * @param message StatusReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStatusReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StatusReturn message, length delimited. Does not implicitly {@link StatusReturn.verify|verify} messages.
     * @param message StatusReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStatusReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StatusReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StatusReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): StatusReturn;

    /**
     * Decodes a StatusReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StatusReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): StatusReturn;

    /**
     * Verifies a StatusReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a StatusReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns StatusReturn
     */
    public static fromObject(object: { [k: string]: any }): StatusReturn;

    /**
     * Creates a plain object from a StatusReturn message. Also converts values to other types if specified.
     * @param message StatusReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: StatusReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this StatusReturn to JSON.
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

/** Properties of a PutTx. */
export interface IPutTx {

    /** PutTx txs */
    txs?: ITx[];
}

/** Represents a PutTx. */
export class PutTx implements IPutTx {

    /**
     * Constructs a new PutTx.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPutTx);

    /** PutTx txs. */
    public txs: ITx[];

    /**
     * Creates a new PutTx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PutTx instance
     */
    public static create(properties?: IPutTx): PutTx;

    /**
     * Encodes the specified PutTx message. Does not implicitly {@link PutTx.verify|verify} messages.
     * @param message PutTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPutTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PutTx message, length delimited. Does not implicitly {@link PutTx.verify|verify} messages.
     * @param message PutTx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPutTx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PutTx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PutTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PutTx;

    /**
     * Decodes a PutTx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PutTx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PutTx;

    /**
     * Verifies a PutTx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PutTx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PutTx
     */
    public static fromObject(object: { [k: string]: any }): PutTx;

    /**
     * Creates a plain object from a PutTx message. Also converts values to other types if specified.
     * @param message PutTx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PutTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PutTx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PutTxReturn. */
export interface IPutTxReturn {

    /** PutTxReturn success */
    success?: boolean;
}

/** Represents a PutTxReturn. */
export class PutTxReturn implements IPutTxReturn {

    /**
     * Constructs a new PutTxReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPutTxReturn);

    /** PutTxReturn success. */
    public success: boolean;

    /**
     * Creates a new PutTxReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PutTxReturn instance
     */
    public static create(properties?: IPutTxReturn): PutTxReturn;

    /**
     * Encodes the specified PutTxReturn message. Does not implicitly {@link PutTxReturn.verify|verify} messages.
     * @param message PutTxReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPutTxReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PutTxReturn message, length delimited. Does not implicitly {@link PutTxReturn.verify|verify} messages.
     * @param message PutTxReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPutTxReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PutTxReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PutTxReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PutTxReturn;

    /**
     * Decodes a PutTxReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PutTxReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PutTxReturn;

    /**
     * Verifies a PutTxReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PutTxReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PutTxReturn
     */
    public static fromObject(object: { [k: string]: any }): PutTxReturn;

    /**
     * Creates a plain object from a PutTxReturn message. Also converts values to other types if specified.
     * @param message PutTxReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PutTxReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PutTxReturn to JSON.
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

    /** GetTxsReturn txs */
    txs?: ITx[];
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

    /** GetTxsReturn txs. */
    public txs: ITx[];

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

/** Properties of a PutBlock. */
export interface IPutBlock {

    /** PutBlock blocks */
    blocks?: IBlock[];
}

/** Represents a PutBlock. */
export class PutBlock implements IPutBlock {

    /**
     * Constructs a new PutBlock.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPutBlock);

    /** PutBlock blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new PutBlock instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PutBlock instance
     */
    public static create(properties?: IPutBlock): PutBlock;

    /**
     * Encodes the specified PutBlock message. Does not implicitly {@link PutBlock.verify|verify} messages.
     * @param message PutBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPutBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PutBlock message, length delimited. Does not implicitly {@link PutBlock.verify|verify} messages.
     * @param message PutBlock message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPutBlock, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PutBlock message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PutBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PutBlock;

    /**
     * Decodes a PutBlock message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PutBlock
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PutBlock;

    /**
     * Verifies a PutBlock message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PutBlock message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PutBlock
     */
    public static fromObject(object: { [k: string]: any }): PutBlock;

    /**
     * Creates a plain object from a PutBlock message. Also converts values to other types if specified.
     * @param message PutBlock
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PutBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PutBlock to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PutBlockReturn. */
export interface IPutBlockReturn {

    /** PutBlockReturn success */
    success?: boolean;
}

/** Represents a PutBlockReturn. */
export class PutBlockReturn implements IPutBlockReturn {

    /**
     * Constructs a new PutBlockReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPutBlockReturn);

    /** PutBlockReturn success. */
    public success: boolean;

    /**
     * Creates a new PutBlockReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PutBlockReturn instance
     */
    public static create(properties?: IPutBlockReturn): PutBlockReturn;

    /**
     * Encodes the specified PutBlockReturn message. Does not implicitly {@link PutBlockReturn.verify|verify} messages.
     * @param message PutBlockReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPutBlockReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PutBlockReturn message, length delimited. Does not implicitly {@link PutBlockReturn.verify|verify} messages.
     * @param message PutBlockReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPutBlockReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PutBlockReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PutBlockReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PutBlockReturn;

    /**
     * Decodes a PutBlockReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PutBlockReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PutBlockReturn;

    /**
     * Verifies a PutBlockReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PutBlockReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PutBlockReturn
     */
    public static fromObject(object: { [k: string]: any }): PutBlockReturn;

    /**
     * Creates a plain object from a PutBlockReturn message. Also converts values to other types if specified.
     * @param message PutBlockReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PutBlockReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PutBlockReturn to JSON.
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

/** Properties of a GetBlocksByHash. */
export interface IGetBlocksByHash {

    /** GetBlocksByHash hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetBlocksByHash. */
export class GetBlocksByHash implements IGetBlocksByHash {

    /**
     * Constructs a new GetBlocksByHash.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByHash);

    /** GetBlocksByHash hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetBlocksByHash instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByHash instance
     */
    public static create(properties?: IGetBlocksByHash): GetBlocksByHash;

    /**
     * Encodes the specified GetBlocksByHash message. Does not implicitly {@link GetBlocksByHash.verify|verify} messages.
     * @param message GetBlocksByHash message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByHash, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByHash message, length delimited. Does not implicitly {@link GetBlocksByHash.verify|verify} messages.
     * @param message GetBlocksByHash message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByHash, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByHash message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByHash
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByHash;

    /**
     * Decodes a GetBlocksByHash message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByHash
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByHash;

    /**
     * Verifies a GetBlocksByHash message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByHash message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByHash
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByHash;

    /**
     * Creates a plain object from a GetBlocksByHash message. Also converts values to other types if specified.
     * @param message GetBlocksByHash
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByHash, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByHash to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetBlocksByHashReturn. */
export interface IGetBlocksByHashReturn {

    /** GetBlocksByHashReturn success */
    success?: boolean;

    /** GetBlocksByHashReturn blocks */
    blocks?: IBlock[];
}

/** Represents a GetBlocksByHashReturn. */
export class GetBlocksByHashReturn implements IGetBlocksByHashReturn {

    /**
     * Constructs a new GetBlocksByHashReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetBlocksByHashReturn);

    /** GetBlocksByHashReturn success. */
    public success: boolean;

    /** GetBlocksByHashReturn blocks. */
    public blocks: IBlock[];

    /**
     * Creates a new GetBlocksByHashReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetBlocksByHashReturn instance
     */
    public static create(properties?: IGetBlocksByHashReturn): GetBlocksByHashReturn;

    /**
     * Encodes the specified GetBlocksByHashReturn message. Does not implicitly {@link GetBlocksByHashReturn.verify|verify} messages.
     * @param message GetBlocksByHashReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetBlocksByHashReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetBlocksByHashReturn message, length delimited. Does not implicitly {@link GetBlocksByHashReturn.verify|verify} messages.
     * @param message GetBlocksByHashReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetBlocksByHashReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetBlocksByHashReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetBlocksByHashReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetBlocksByHashReturn;

    /**
     * Decodes a GetBlocksByHashReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetBlocksByHashReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetBlocksByHashReturn;

    /**
     * Verifies a GetBlocksByHashReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetBlocksByHashReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetBlocksByHashReturn
     */
    public static fromObject(object: { [k: string]: any }): GetBlocksByHashReturn;

    /**
     * Creates a plain object from a GetBlocksByHashReturn message. Also converts values to other types if specified.
     * @param message GetBlocksByHashReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetBlocksByHashReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetBlocksByHashReturn to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByHash. */
export interface IGetHeadersByHash {

    /** GetHeadersByHash hashes */
    hashes?: Uint8Array[];
}

/** Represents a GetHeadersByHash. */
export class GetHeadersByHash implements IGetHeadersByHash {

    /**
     * Constructs a new GetHeadersByHash.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByHash);

    /** GetHeadersByHash hashes. */
    public hashes: Uint8Array[];

    /**
     * Creates a new GetHeadersByHash instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByHash instance
     */
    public static create(properties?: IGetHeadersByHash): GetHeadersByHash;

    /**
     * Encodes the specified GetHeadersByHash message. Does not implicitly {@link GetHeadersByHash.verify|verify} messages.
     * @param message GetHeadersByHash message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByHash, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByHash message, length delimited. Does not implicitly {@link GetHeadersByHash.verify|verify} messages.
     * @param message GetHeadersByHash message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByHash, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByHash message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByHash
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByHash;

    /**
     * Decodes a GetHeadersByHash message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByHash
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByHash;

    /**
     * Verifies a GetHeadersByHash message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByHash message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByHash
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByHash;

    /**
     * Creates a plain object from a GetHeadersByHash message. Also converts values to other types if specified.
     * @param message GetHeadersByHash
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByHash, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByHash to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetHeadersByHashReturn. */
export interface IGetHeadersByHashReturn {

    /** GetHeadersByHashReturn success */
    success?: boolean;

    /** GetHeadersByHashReturn headers */
    headers?: IBlockHeader[];
}

/** Represents a GetHeadersByHashReturn. */
export class GetHeadersByHashReturn implements IGetHeadersByHashReturn {

    /**
     * Constructs a new GetHeadersByHashReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetHeadersByHashReturn);

    /** GetHeadersByHashReturn success. */
    public success: boolean;

    /** GetHeadersByHashReturn headers. */
    public headers: IBlockHeader[];

    /**
     * Creates a new GetHeadersByHashReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetHeadersByHashReturn instance
     */
    public static create(properties?: IGetHeadersByHashReturn): GetHeadersByHashReturn;

    /**
     * Encodes the specified GetHeadersByHashReturn message. Does not implicitly {@link GetHeadersByHashReturn.verify|verify} messages.
     * @param message GetHeadersByHashReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetHeadersByHashReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetHeadersByHashReturn message, length delimited. Does not implicitly {@link GetHeadersByHashReturn.verify|verify} messages.
     * @param message GetHeadersByHashReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetHeadersByHashReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetHeadersByHashReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetHeadersByHashReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetHeadersByHashReturn;

    /**
     * Decodes a GetHeadersByHashReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetHeadersByHashReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetHeadersByHashReturn;

    /**
     * Verifies a GetHeadersByHashReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetHeadersByHashReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetHeadersByHashReturn
     */
    public static fromObject(object: { [k: string]: any }): GetHeadersByHashReturn;

    /**
     * Creates a plain object from a GetHeadersByHashReturn message. Also converts values to other types if specified.
     * @param message GetHeadersByHashReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetHeadersByHashReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetHeadersByHashReturn to JSON.
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

    /** GetHeadersByRangeReturn headers */
    headers?: IBlockHeader[];
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

    /** GetHeadersByRangeReturn headers. */
    public headers: IBlockHeader[];

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

/** Properties of a GetPeers. */
export interface IGetPeers {

    /** GetPeers count */
    count?: number;
}

/** Represents a GetPeers. */
export class GetPeers implements IGetPeers {

    /**
     * Constructs a new GetPeers.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetPeers);

    /** GetPeers count. */
    public count: number;

    /**
     * Creates a new GetPeers instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetPeers instance
     */
    public static create(properties?: IGetPeers): GetPeers;

    /**
     * Encodes the specified GetPeers message. Does not implicitly {@link GetPeers.verify|verify} messages.
     * @param message GetPeers message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetPeers, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetPeers message, length delimited. Does not implicitly {@link GetPeers.verify|verify} messages.
     * @param message GetPeers message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetPeers, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetPeers message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetPeers
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetPeers;

    /**
     * Decodes a GetPeers message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetPeers
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetPeers;

    /**
     * Verifies a GetPeers message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetPeers message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetPeers
     */
    public static fromObject(object: { [k: string]: any }): GetPeers;

    /**
     * Creates a plain object from a GetPeers message. Also converts values to other types if specified.
     * @param message GetPeers
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetPeers, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetPeers to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a GetPeersReturn. */
export interface IGetPeersReturn {

    /** GetPeersReturn success */
    success?: boolean;

    /** GetPeersReturn peers */
    peers?: IPeer[];
}

/** Represents a GetPeersReturn. */
export class GetPeersReturn implements IGetPeersReturn {

    /**
     * Constructs a new GetPeersReturn.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGetPeersReturn);

    /** GetPeersReturn success. */
    public success: boolean;

    /** GetPeersReturn peers. */
    public peers: IPeer[];

    /**
     * Creates a new GetPeersReturn instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GetPeersReturn instance
     */
    public static create(properties?: IGetPeersReturn): GetPeersReturn;

    /**
     * Encodes the specified GetPeersReturn message. Does not implicitly {@link GetPeersReturn.verify|verify} messages.
     * @param message GetPeersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGetPeersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GetPeersReturn message, length delimited. Does not implicitly {@link GetPeersReturn.verify|verify} messages.
     * @param message GetPeersReturn message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGetPeersReturn, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GetPeersReturn message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GetPeersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GetPeersReturn;

    /**
     * Decodes a GetPeersReturn message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GetPeersReturn
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GetPeersReturn;

    /**
     * Verifies a GetPeersReturn message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GetPeersReturn message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GetPeersReturn
     */
    public static fromObject(object: { [k: string]: any }): GetPeersReturn;

    /**
     * Creates a plain object from a GetPeersReturn message. Also converts values to other types if specified.
     * @param message GetPeersReturn
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GetPeersReturn, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GetPeersReturn to JSON.
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

    /** BlockDB header */
    header?: IBlockHeader;

    /** BlockDB fileNumber */
    fileNumber?: number;

    /** BlockDB offset */
    offset?: number;

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

    /** BlockDB header. */
    public header?: IBlockHeader;

    /** BlockDB fileNumber. */
    public fileNumber: number;

    /** BlockDB offset. */
    public offset: number;

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

/** Properties of a Peer. */
export interface IPeer {

    /** Peer host */
    host?: string;

    /** Peer port */
    port?: number;

    /** Peer lastSeen */
    lastSeen?: number|Long;
}

/** Represents a Peer. */
export class Peer implements IPeer {

    /**
     * Constructs a new Peer.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPeer);

    /** Peer host. */
    public host: string;

    /** Peer port. */
    public port: number;

    /** Peer lastSeen. */
    public lastSeen: (number|Long);

    /**
     * Creates a new Peer instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Peer instance
     */
    public static create(properties?: IPeer): Peer;

    /**
     * Encodes the specified Peer message. Does not implicitly {@link Peer.verify|verify} messages.
     * @param message Peer message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Peer message, length delimited. Does not implicitly {@link Peer.verify|verify} messages.
     * @param message Peer message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Peer message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Peer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Peer;

    /**
     * Decodes a Peer message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Peer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Peer;

    /**
     * Verifies a Peer message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Peer message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Peer
     */
    public static fromObject(object: { [k: string]: any }): Peer;

    /**
     * Creates a plain object from a Peer message. Also converts values to other types if specified.
     * @param message Peer
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Peer, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Peer to JSON.
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
