/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.Node = (function() {

    /**
     * Properties of a Node.
     * @exports INode
     * @interface INode
     */

    /**
     * Constructs a new Node.
     * @exports Node
     * @classdesc Represents a Node.
     * @implements INode
     * @constructor
     * @param {INode=} [properties] Properties to set
     */
    function Node(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new Node instance using the specified properties.
     * @function create
     * @memberof Node
     * @static
     * @param {INode=} [properties] Properties to set
     * @returns {Node} Node instance
     */
    Node.create = function create(properties) {
        return new Node(properties);
    };

    /**
     * Encodes the specified Node message. Does not implicitly {@link Node.verify|verify} messages.
     * @function encode
     * @memberof Node
     * @static
     * @param {INode} message Node message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Node.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified Node message, length delimited. Does not implicitly {@link Node.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Node
     * @static
     * @param {INode} message Node message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Node.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Node message from the specified reader or buffer.
     * @function decode
     * @memberof Node
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Node} Node
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Node.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Node();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Node message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Node
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Node} Node
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Node.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Node message.
     * @function verify
     * @memberof Node
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Node.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a Node message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Node
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Node} Node
     */
    Node.fromObject = function fromObject(object) {
        if (object instanceof $root.Node)
            return object;
        return new $root.Node();
    };

    /**
     * Creates a plain object from a Node message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Node
     * @static
     * @param {Node} message Node
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Node.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this Node to JSON.
     * @function toJSON
     * @memberof Node
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Node.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Node;
})();

$root.Block = (function() {

    /**
     * Properties of a Block.
     * @exports IBlock
     * @interface IBlock
     * @property {IBlockHeader|null} [header] Block header
     * @property {Uint8Array|null} [miner] Block miner
     * @property {Array.<ITx>|null} [txs] Block txs
     */

    /**
     * Constructs a new Block.
     * @exports Block
     * @classdesc Represents a Block.
     * @implements IBlock
     * @constructor
     * @param {IBlock=} [properties] Properties to set
     */
    function Block(properties) {
        this.txs = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Block header.
     * @member {IBlockHeader|null|undefined} header
     * @memberof Block
     * @instance
     */
    Block.prototype.header = null;

    /**
     * Block miner.
     * @member {Uint8Array} miner
     * @memberof Block
     * @instance
     */
    Block.prototype.miner = $util.newBuffer([]);

    /**
     * Block txs.
     * @member {Array.<ITx>} txs
     * @memberof Block
     * @instance
     */
    Block.prototype.txs = $util.emptyArray;

    /**
     * Creates a new Block instance using the specified properties.
     * @function create
     * @memberof Block
     * @static
     * @param {IBlock=} [properties] Properties to set
     * @returns {Block} Block instance
     */
    Block.create = function create(properties) {
        return new Block(properties);
    };

    /**
     * Encodes the specified Block message. Does not implicitly {@link Block.verify|verify} messages.
     * @function encode
     * @memberof Block
     * @static
     * @param {IBlock} message Block message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Block.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.header != null && message.hasOwnProperty("header"))
            $root.BlockHeader.encode(message.header, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.miner != null && message.hasOwnProperty("miner"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.miner);
        if (message.txs != null && message.txs.length)
            for (var i = 0; i < message.txs.length; ++i)
                $root.Tx.encode(message.txs[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Block message, length delimited. Does not implicitly {@link Block.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Block
     * @static
     * @param {IBlock} message Block message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Block.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Block message from the specified reader or buffer.
     * @function decode
     * @memberof Block
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Block} Block
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Block.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Block();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.header = $root.BlockHeader.decode(reader, reader.uint32());
                break;
            case 2:
                message.miner = reader.bytes();
                break;
            case 3:
                if (!(message.txs && message.txs.length))
                    message.txs = [];
                message.txs.push($root.Tx.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Block message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Block
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Block} Block
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Block.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Block message.
     * @function verify
     * @memberof Block
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Block.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.header != null && message.hasOwnProperty("header")) {
            var error = $root.BlockHeader.verify(message.header);
            if (error)
                return "header." + error;
        }
        if (message.miner != null && message.hasOwnProperty("miner"))
            if (!(message.miner && typeof message.miner.length === "number" || $util.isString(message.miner)))
                return "miner: buffer expected";
        if (message.txs != null && message.hasOwnProperty("txs")) {
            if (!Array.isArray(message.txs))
                return "txs: array expected";
            for (var i = 0; i < message.txs.length; ++i) {
                var error = $root.Tx.verify(message.txs[i]);
                if (error)
                    return "txs." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Block message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Block
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Block} Block
     */
    Block.fromObject = function fromObject(object) {
        if (object instanceof $root.Block)
            return object;
        var message = new $root.Block();
        if (object.header != null) {
            if (typeof object.header !== "object")
                throw TypeError(".Block.header: object expected");
            message.header = $root.BlockHeader.fromObject(object.header);
        }
        if (object.miner != null)
            if (typeof object.miner === "string")
                $util.base64.decode(object.miner, message.miner = $util.newBuffer($util.base64.length(object.miner)), 0);
            else if (object.miner.length)
                message.miner = object.miner;
        if (object.txs) {
            if (!Array.isArray(object.txs))
                throw TypeError(".Block.txs: array expected");
            message.txs = [];
            for (var i = 0; i < object.txs.length; ++i) {
                if (typeof object.txs[i] !== "object")
                    throw TypeError(".Block.txs: object expected");
                message.txs[i] = $root.Tx.fromObject(object.txs[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Block message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Block
     * @static
     * @param {Block} message Block
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Block.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.txs = [];
        if (options.defaults) {
            object.header = null;
            object.miner = options.bytes === String ? "" : [];
        }
        if (message.header != null && message.hasOwnProperty("header"))
            object.header = $root.BlockHeader.toObject(message.header, options);
        if (message.miner != null && message.hasOwnProperty("miner"))
            object.miner = options.bytes === String ? $util.base64.encode(message.miner, 0, message.miner.length) : options.bytes === Array ? Array.prototype.slice.call(message.miner) : message.miner;
        if (message.txs && message.txs.length) {
            object.txs = [];
            for (var j = 0; j < message.txs.length; ++j)
                object.txs[j] = $root.Tx.toObject(message.txs[j], options);
        }
        return object;
    };

    /**
     * Converts this Block to JSON.
     * @function toJSON
     * @memberof Block
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Block.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Block;
})();

$root.BlockDB = (function() {

    /**
     * Properties of a BlockDB.
     * @exports IBlockDB
     * @interface IBlockDB
     * @property {number|null} [height] BlockDB height
     * @property {number|null} [fileNumber] BlockDB fileNumber
     * @property {number|null} [offset] BlockDB offset
     * @property {IBlockHeader|null} [header] BlockDB header
     * @property {number|null} [length] BlockDB length
     */

    /**
     * Constructs a new BlockDB.
     * @exports BlockDB
     * @classdesc Represents a BlockDB.
     * @implements IBlockDB
     * @constructor
     * @param {IBlockDB=} [properties] Properties to set
     */
    function BlockDB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BlockDB height.
     * @member {number} height
     * @memberof BlockDB
     * @instance
     */
    BlockDB.prototype.height = 0;

    /**
     * BlockDB fileNumber.
     * @member {number} fileNumber
     * @memberof BlockDB
     * @instance
     */
    BlockDB.prototype.fileNumber = 0;

    /**
     * BlockDB offset.
     * @member {number} offset
     * @memberof BlockDB
     * @instance
     */
    BlockDB.prototype.offset = 0;

    /**
     * BlockDB header.
     * @member {IBlockHeader|null|undefined} header
     * @memberof BlockDB
     * @instance
     */
    BlockDB.prototype.header = null;

    /**
     * BlockDB length.
     * @member {number} length
     * @memberof BlockDB
     * @instance
     */
    BlockDB.prototype.length = 0;

    /**
     * Creates a new BlockDB instance using the specified properties.
     * @function create
     * @memberof BlockDB
     * @static
     * @param {IBlockDB=} [properties] Properties to set
     * @returns {BlockDB} BlockDB instance
     */
    BlockDB.create = function create(properties) {
        return new BlockDB(properties);
    };

    /**
     * Encodes the specified BlockDB message. Does not implicitly {@link BlockDB.verify|verify} messages.
     * @function encode
     * @memberof BlockDB
     * @static
     * @param {IBlockDB} message BlockDB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockDB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.height != null && message.hasOwnProperty("height"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.height);
        if (message.fileNumber != null && message.hasOwnProperty("fileNumber"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.fileNumber);
        if (message.offset != null && message.hasOwnProperty("offset"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.offset);
        if (message.header != null && message.hasOwnProperty("header"))
            $root.BlockHeader.encode(message.header, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.length != null && message.hasOwnProperty("length"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.length);
        return writer;
    };

    /**
     * Encodes the specified BlockDB message, length delimited. Does not implicitly {@link BlockDB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BlockDB
     * @static
     * @param {IBlockDB} message BlockDB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockDB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlockDB message from the specified reader or buffer.
     * @function decode
     * @memberof BlockDB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BlockDB} BlockDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockDB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BlockDB();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.height = reader.int32();
                break;
            case 2:
                message.fileNumber = reader.int32();
                break;
            case 3:
                message.offset = reader.int32();
                break;
            case 4:
                message.header = $root.BlockHeader.decode(reader, reader.uint32());
                break;
            case 5:
                message.length = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BlockDB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BlockDB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BlockDB} BlockDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockDB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlockDB message.
     * @function verify
     * @memberof BlockDB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlockDB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.height != null && message.hasOwnProperty("height"))
            if (!$util.isInteger(message.height))
                return "height: integer expected";
        if (message.fileNumber != null && message.hasOwnProperty("fileNumber"))
            if (!$util.isInteger(message.fileNumber))
                return "fileNumber: integer expected";
        if (message.offset != null && message.hasOwnProperty("offset"))
            if (!$util.isInteger(message.offset))
                return "offset: integer expected";
        if (message.header != null && message.hasOwnProperty("header")) {
            var error = $root.BlockHeader.verify(message.header);
            if (error)
                return "header." + error;
        }
        if (message.length != null && message.hasOwnProperty("length"))
            if (!$util.isInteger(message.length))
                return "length: integer expected";
        return null;
    };

    /**
     * Creates a BlockDB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BlockDB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BlockDB} BlockDB
     */
    BlockDB.fromObject = function fromObject(object) {
        if (object instanceof $root.BlockDB)
            return object;
        var message = new $root.BlockDB();
        if (object.height != null)
            message.height = object.height | 0;
        if (object.fileNumber != null)
            message.fileNumber = object.fileNumber | 0;
        if (object.offset != null)
            message.offset = object.offset | 0;
        if (object.header != null) {
            if (typeof object.header !== "object")
                throw TypeError(".BlockDB.header: object expected");
            message.header = $root.BlockHeader.fromObject(object.header);
        }
        if (object.length != null)
            message.length = object.length | 0;
        return message;
    };

    /**
     * Creates a plain object from a BlockDB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BlockDB
     * @static
     * @param {BlockDB} message BlockDB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlockDB.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.height = 0;
            object.fileNumber = 0;
            object.offset = 0;
            object.header = null;
            object.length = 0;
        }
        if (message.height != null && message.hasOwnProperty("height"))
            object.height = message.height;
        if (message.fileNumber != null && message.hasOwnProperty("fileNumber"))
            object.fileNumber = message.fileNumber;
        if (message.offset != null && message.hasOwnProperty("offset"))
            object.offset = message.offset;
        if (message.header != null && message.hasOwnProperty("header"))
            object.header = $root.BlockHeader.toObject(message.header, options);
        if (message.length != null && message.hasOwnProperty("length"))
            object.length = message.length;
        return object;
    };

    /**
     * Converts this BlockDB to JSON.
     * @function toJSON
     * @memberof BlockDB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlockDB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return BlockDB;
})();

$root.Txs = (function() {

    /**
     * Properties of a Txs.
     * @exports ITxs
     * @interface ITxs
     * @property {Array.<ITx>|null} [txs] Txs txs
     */

    /**
     * Constructs a new Txs.
     * @exports Txs
     * @classdesc Represents a Txs.
     * @implements ITxs
     * @constructor
     * @param {ITxs=} [properties] Properties to set
     */
    function Txs(properties) {
        this.txs = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Txs txs.
     * @member {Array.<ITx>} txs
     * @memberof Txs
     * @instance
     */
    Txs.prototype.txs = $util.emptyArray;

    /**
     * Creates a new Txs instance using the specified properties.
     * @function create
     * @memberof Txs
     * @static
     * @param {ITxs=} [properties] Properties to set
     * @returns {Txs} Txs instance
     */
    Txs.create = function create(properties) {
        return new Txs(properties);
    };

    /**
     * Encodes the specified Txs message. Does not implicitly {@link Txs.verify|verify} messages.
     * @function encode
     * @memberof Txs
     * @static
     * @param {ITxs} message Txs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Txs.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.txs != null && message.txs.length)
            for (var i = 0; i < message.txs.length; ++i)
                $root.Tx.encode(message.txs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Txs message, length delimited. Does not implicitly {@link Txs.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Txs
     * @static
     * @param {ITxs} message Txs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Txs.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Txs message from the specified reader or buffer.
     * @function decode
     * @memberof Txs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Txs} Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Txs.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Txs();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.txs && message.txs.length))
                    message.txs = [];
                message.txs.push($root.Tx.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Txs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Txs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Txs} Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Txs.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Txs message.
     * @function verify
     * @memberof Txs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Txs.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.txs != null && message.hasOwnProperty("txs")) {
            if (!Array.isArray(message.txs))
                return "txs: array expected";
            for (var i = 0; i < message.txs.length; ++i) {
                var error = $root.Tx.verify(message.txs[i]);
                if (error)
                    return "txs." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Txs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Txs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Txs} Txs
     */
    Txs.fromObject = function fromObject(object) {
        if (object instanceof $root.Txs)
            return object;
        var message = new $root.Txs();
        if (object.txs) {
            if (!Array.isArray(object.txs))
                throw TypeError(".Txs.txs: array expected");
            message.txs = [];
            for (var i = 0; i < object.txs.length; ++i) {
                if (typeof object.txs[i] !== "object")
                    throw TypeError(".Txs.txs: object expected");
                message.txs[i] = $root.Tx.fromObject(object.txs[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Txs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Txs
     * @static
     * @param {Txs} message Txs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Txs.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.txs = [];
        if (message.txs && message.txs.length) {
            object.txs = [];
            for (var j = 0; j < message.txs.length; ++j)
                object.txs[j] = $root.Tx.toObject(message.txs[j], options);
        }
        return object;
    };

    /**
     * Converts this Txs to JSON.
     * @function toJSON
     * @memberof Txs
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Txs.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Txs;
})();

$root.Tx = (function() {

    /**
     * Properties of a Tx.
     * @exports ITx
     * @interface ITx
     * @property {Uint8Array|null} [from] Tx from
     * @property {Uint8Array|null} [to] Tx to
     * @property {number|Long|null} [amount] Tx amount
     * @property {number|Long|null} [fee] Tx fee
     * @property {number|null} [nonce] Tx nonce
     * @property {Uint8Array|null} [signature] Tx signature
     * @property {number|null} [recovery] Tx recovery
     */

    /**
     * Constructs a new Tx.
     * @exports Tx
     * @classdesc Represents a Tx.
     * @implements ITx
     * @constructor
     * @param {ITx=} [properties] Properties to set
     */
    function Tx(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Tx from.
     * @member {Uint8Array} from
     * @memberof Tx
     * @instance
     */
    Tx.prototype.from = $util.newBuffer([]);

    /**
     * Tx to.
     * @member {Uint8Array} to
     * @memberof Tx
     * @instance
     */
    Tx.prototype.to = $util.newBuffer([]);

    /**
     * Tx amount.
     * @member {number|Long} amount
     * @memberof Tx
     * @instance
     */
    Tx.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Tx fee.
     * @member {number|Long} fee
     * @memberof Tx
     * @instance
     */
    Tx.prototype.fee = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Tx nonce.
     * @member {number} nonce
     * @memberof Tx
     * @instance
     */
    Tx.prototype.nonce = 0;

    /**
     * Tx signature.
     * @member {Uint8Array} signature
     * @memberof Tx
     * @instance
     */
    Tx.prototype.signature = $util.newBuffer([]);

    /**
     * Tx recovery.
     * @member {number} recovery
     * @memberof Tx
     * @instance
     */
    Tx.prototype.recovery = 0;

    /**
     * Creates a new Tx instance using the specified properties.
     * @function create
     * @memberof Tx
     * @static
     * @param {ITx=} [properties] Properties to set
     * @returns {Tx} Tx instance
     */
    Tx.create = function create(properties) {
        return new Tx(properties);
    };

    /**
     * Encodes the specified Tx message. Does not implicitly {@link Tx.verify|verify} messages.
     * @function encode
     * @memberof Tx
     * @static
     * @param {ITx} message Tx message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tx.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.from != null && message.hasOwnProperty("from"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.from);
        if (message.to != null && message.hasOwnProperty("to"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.to);
        if (message.amount != null && message.hasOwnProperty("amount"))
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.amount);
        if (message.fee != null && message.hasOwnProperty("fee"))
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.fee);
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.nonce);
        if (message.signature != null && message.hasOwnProperty("signature"))
            writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.signature);
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.recovery);
        return writer;
    };

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link Tx.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Tx
     * @static
     * @param {ITx} message Tx message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tx.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @function decode
     * @memberof Tx
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Tx} Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tx.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Tx();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.from = reader.bytes();
                break;
            case 2:
                message.to = reader.bytes();
                break;
            case 3:
                message.amount = reader.int64();
                break;
            case 4:
                message.fee = reader.int64();
                break;
            case 5:
                message.nonce = reader.int32();
                break;
            case 6:
                message.signature = reader.bytes();
                break;
            case 7:
                message.recovery = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Tx
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Tx} Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tx.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Tx message.
     * @function verify
     * @memberof Tx
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Tx.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.from != null && message.hasOwnProperty("from"))
            if (!(message.from && typeof message.from.length === "number" || $util.isString(message.from)))
                return "from: buffer expected";
        if (message.to != null && message.hasOwnProperty("to"))
            if (!(message.to && typeof message.to.length === "number" || $util.isString(message.to)))
                return "to: buffer expected";
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                return "amount: integer|Long expected";
        if (message.fee != null && message.hasOwnProperty("fee"))
            if (!$util.isInteger(message.fee) && !(message.fee && $util.isInteger(message.fee.low) && $util.isInteger(message.fee.high)))
                return "fee: integer|Long expected";
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            if (!$util.isInteger(message.nonce))
                return "nonce: integer expected";
        if (message.signature != null && message.hasOwnProperty("signature"))
            if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                return "signature: buffer expected";
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            if (!$util.isInteger(message.recovery))
                return "recovery: integer expected";
        return null;
    };

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Tx
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Tx} Tx
     */
    Tx.fromObject = function fromObject(object) {
        if (object instanceof $root.Tx)
            return object;
        var message = new $root.Tx();
        if (object.from != null)
            if (typeof object.from === "string")
                $util.base64.decode(object.from, message.from = $util.newBuffer($util.base64.length(object.from)), 0);
            else if (object.from.length)
                message.from = object.from;
        if (object.to != null)
            if (typeof object.to === "string")
                $util.base64.decode(object.to, message.to = $util.newBuffer($util.base64.length(object.to)), 0);
            else if (object.to.length)
                message.to = object.to;
        if (object.amount != null)
            if ($util.Long)
                (message.amount = $util.Long.fromValue(object.amount)).unsigned = false;
            else if (typeof object.amount === "string")
                message.amount = parseInt(object.amount, 10);
            else if (typeof object.amount === "number")
                message.amount = object.amount;
            else if (typeof object.amount === "object")
                message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber();
        if (object.fee != null)
            if ($util.Long)
                (message.fee = $util.Long.fromValue(object.fee)).unsigned = false;
            else if (typeof object.fee === "string")
                message.fee = parseInt(object.fee, 10);
            else if (typeof object.fee === "number")
                message.fee = object.fee;
            else if (typeof object.fee === "object")
                message.fee = new $util.LongBits(object.fee.low >>> 0, object.fee.high >>> 0).toNumber();
        if (object.nonce != null)
            message.nonce = object.nonce | 0;
        if (object.signature != null)
            if (typeof object.signature === "string")
                $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
            else if (object.signature.length)
                message.signature = object.signature;
        if (object.recovery != null)
            message.recovery = object.recovery | 0;
        return message;
    };

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Tx
     * @static
     * @param {Tx} message Tx
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Tx.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.from = options.bytes === String ? "" : [];
            object.to = options.bytes === String ? "" : [];
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.amount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.fee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.fee = options.longs === String ? "0" : 0;
            object.nonce = 0;
            object.signature = options.bytes === String ? "" : [];
            object.recovery = 0;
        }
        if (message.from != null && message.hasOwnProperty("from"))
            object.from = options.bytes === String ? $util.base64.encode(message.from, 0, message.from.length) : options.bytes === Array ? Array.prototype.slice.call(message.from) : message.from;
        if (message.to != null && message.hasOwnProperty("to"))
            object.to = options.bytes === String ? $util.base64.encode(message.to, 0, message.to.length) : options.bytes === Array ? Array.prototype.slice.call(message.to) : message.to;
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (typeof message.amount === "number")
                object.amount = options.longs === String ? String(message.amount) : message.amount;
            else
                object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber() : message.amount;
        if (message.fee != null && message.hasOwnProperty("fee"))
            if (typeof message.fee === "number")
                object.fee = options.longs === String ? String(message.fee) : message.fee;
            else
                object.fee = options.longs === String ? $util.Long.prototype.toString.call(message.fee) : options.longs === Number ? new $util.LongBits(message.fee.low >>> 0, message.fee.high >>> 0).toNumber() : message.fee;
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            object.nonce = message.nonce;
        if (message.signature != null && message.hasOwnProperty("signature"))
            object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            object.recovery = message.recovery;
        return object;
    };

    /**
     * Converts this Tx to JSON.
     * @function toJSON
     * @memberof Tx
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Tx.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Tx;
})();

$root.TxDB = (function() {

    /**
     * Properties of a TxDB.
     * @exports ITxDB
     * @interface ITxDB
     * @property {Uint8Array|null} [hash] TxDB hash
     * @property {Uint8Array|null} [blockHash] TxDB blockHash
     * @property {number|null} [blockHeight] TxDB blockHeight
     * @property {number|null} [txNumber] TxDB txNumber
     */

    /**
     * Constructs a new TxDB.
     * @exports TxDB
     * @classdesc Represents a TxDB.
     * @implements ITxDB
     * @constructor
     * @param {ITxDB=} [properties] Properties to set
     */
    function TxDB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TxDB hash.
     * @member {Uint8Array} hash
     * @memberof TxDB
     * @instance
     */
    TxDB.prototype.hash = $util.newBuffer([]);

    /**
     * TxDB blockHash.
     * @member {Uint8Array} blockHash
     * @memberof TxDB
     * @instance
     */
    TxDB.prototype.blockHash = $util.newBuffer([]);

    /**
     * TxDB blockHeight.
     * @member {number} blockHeight
     * @memberof TxDB
     * @instance
     */
    TxDB.prototype.blockHeight = 0;

    /**
     * TxDB txNumber.
     * @member {number} txNumber
     * @memberof TxDB
     * @instance
     */
    TxDB.prototype.txNumber = 0;

    /**
     * Creates a new TxDB instance using the specified properties.
     * @function create
     * @memberof TxDB
     * @static
     * @param {ITxDB=} [properties] Properties to set
     * @returns {TxDB} TxDB instance
     */
    TxDB.create = function create(properties) {
        return new TxDB(properties);
    };

    /**
     * Encodes the specified TxDB message. Does not implicitly {@link TxDB.verify|verify} messages.
     * @function encode
     * @memberof TxDB
     * @static
     * @param {ITxDB} message TxDB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TxDB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.hash != null && message.hasOwnProperty("hash"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.hash);
        if (message.blockHash != null && message.hasOwnProperty("blockHash"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.blockHash);
        if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.blockHeight);
        if (message.txNumber != null && message.hasOwnProperty("txNumber"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.txNumber);
        return writer;
    };

    /**
     * Encodes the specified TxDB message, length delimited. Does not implicitly {@link TxDB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TxDB
     * @static
     * @param {ITxDB} message TxDB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TxDB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TxDB message from the specified reader or buffer.
     * @function decode
     * @memberof TxDB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TxDB} TxDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TxDB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.TxDB();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.hash = reader.bytes();
                break;
            case 2:
                message.blockHash = reader.bytes();
                break;
            case 3:
                message.blockHeight = reader.int32();
                break;
            case 4:
                message.txNumber = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a TxDB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TxDB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TxDB} TxDB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TxDB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TxDB message.
     * @function verify
     * @memberof TxDB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TxDB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.hash != null && message.hasOwnProperty("hash"))
            if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                return "hash: buffer expected";
        if (message.blockHash != null && message.hasOwnProperty("blockHash"))
            if (!(message.blockHash && typeof message.blockHash.length === "number" || $util.isString(message.blockHash)))
                return "blockHash: buffer expected";
        if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
            if (!$util.isInteger(message.blockHeight))
                return "blockHeight: integer expected";
        if (message.txNumber != null && message.hasOwnProperty("txNumber"))
            if (!$util.isInteger(message.txNumber))
                return "txNumber: integer expected";
        return null;
    };

    /**
     * Creates a TxDB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TxDB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {TxDB} TxDB
     */
    TxDB.fromObject = function fromObject(object) {
        if (object instanceof $root.TxDB)
            return object;
        var message = new $root.TxDB();
        if (object.hash != null)
            if (typeof object.hash === "string")
                $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
            else if (object.hash.length)
                message.hash = object.hash;
        if (object.blockHash != null)
            if (typeof object.blockHash === "string")
                $util.base64.decode(object.blockHash, message.blockHash = $util.newBuffer($util.base64.length(object.blockHash)), 0);
            else if (object.blockHash.length)
                message.blockHash = object.blockHash;
        if (object.blockHeight != null)
            message.blockHeight = object.blockHeight | 0;
        if (object.txNumber != null)
            message.txNumber = object.txNumber | 0;
        return message;
    };

    /**
     * Creates a plain object from a TxDB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TxDB
     * @static
     * @param {TxDB} message TxDB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TxDB.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.hash = options.bytes === String ? "" : [];
            object.blockHash = options.bytes === String ? "" : [];
            object.blockHeight = 0;
            object.txNumber = 0;
        }
        if (message.hash != null && message.hasOwnProperty("hash"))
            object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
        if (message.blockHash != null && message.hasOwnProperty("blockHash"))
            object.blockHash = options.bytes === String ? $util.base64.encode(message.blockHash, 0, message.blockHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.blockHash) : message.blockHash;
        if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
            object.blockHeight = message.blockHeight;
        if (message.txNumber != null && message.hasOwnProperty("txNumber"))
            object.txNumber = message.txNumber;
        return object;
    };

    /**
     * Converts this TxDB to JSON.
     * @function toJSON
     * @memberof TxDB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TxDB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return TxDB;
})();

$root.BlockHeader = (function() {

    /**
     * Properties of a BlockHeader.
     * @exports IBlockHeader
     * @interface IBlockHeader
     * @property {Array.<Uint8Array>|null} [previousHash] BlockHeader previousHash
     * @property {Uint8Array|null} [merkleRoot] BlockHeader merkleRoot
     * @property {Uint8Array|null} [stateRoot] BlockHeader stateRoot
     * @property {number|null} [difficulty] BlockHeader difficulty
     * @property {number|Long|null} [timeStamp] BlockHeader timeStamp
     * @property {number|Long|null} [nonce] BlockHeader nonce
     */

    /**
     * Constructs a new BlockHeader.
     * @exports BlockHeader
     * @classdesc Represents a BlockHeader.
     * @implements IBlockHeader
     * @constructor
     * @param {IBlockHeader=} [properties] Properties to set
     */
    function BlockHeader(properties) {
        this.previousHash = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BlockHeader previousHash.
     * @member {Array.<Uint8Array>} previousHash
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.previousHash = $util.emptyArray;

    /**
     * BlockHeader merkleRoot.
     * @member {Uint8Array} merkleRoot
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.merkleRoot = $util.newBuffer([]);

    /**
     * BlockHeader stateRoot.
     * @member {Uint8Array} stateRoot
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.stateRoot = $util.newBuffer([]);

    /**
     * BlockHeader difficulty.
     * @member {number} difficulty
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.difficulty = 0;

    /**
     * BlockHeader timeStamp.
     * @member {number|Long} timeStamp
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.timeStamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * BlockHeader nonce.
     * @member {number|Long} nonce
     * @memberof BlockHeader
     * @instance
     */
    BlockHeader.prototype.nonce = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Creates a new BlockHeader instance using the specified properties.
     * @function create
     * @memberof BlockHeader
     * @static
     * @param {IBlockHeader=} [properties] Properties to set
     * @returns {BlockHeader} BlockHeader instance
     */
    BlockHeader.create = function create(properties) {
        return new BlockHeader(properties);
    };

    /**
     * Encodes the specified BlockHeader message. Does not implicitly {@link BlockHeader.verify|verify} messages.
     * @function encode
     * @memberof BlockHeader
     * @static
     * @param {IBlockHeader} message BlockHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockHeader.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.previousHash != null && message.previousHash.length)
            for (var i = 0; i < message.previousHash.length; ++i)
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.previousHash[i]);
        if (message.merkleRoot != null && message.hasOwnProperty("merkleRoot"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.merkleRoot);
        if (message.stateRoot != null && message.hasOwnProperty("stateRoot"))
            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.stateRoot);
        if (message.difficulty != null && message.hasOwnProperty("difficulty"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.difficulty);
        if (message.timeStamp != null && message.hasOwnProperty("timeStamp"))
            writer.uint32(/* id 5, wireType 0 =*/40).int64(message.timeStamp);
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            writer.uint32(/* id 6, wireType 0 =*/48).int64(message.nonce);
        return writer;
    };

    /**
     * Encodes the specified BlockHeader message, length delimited. Does not implicitly {@link BlockHeader.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BlockHeader
     * @static
     * @param {IBlockHeader} message BlockHeader message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockHeader.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlockHeader message from the specified reader or buffer.
     * @function decode
     * @memberof BlockHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BlockHeader} BlockHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockHeader.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BlockHeader();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.previousHash && message.previousHash.length))
                    message.previousHash = [];
                message.previousHash.push(reader.bytes());
                break;
            case 2:
                message.merkleRoot = reader.bytes();
                break;
            case 3:
                message.stateRoot = reader.bytes();
                break;
            case 4:
                message.difficulty = reader.int32();
                break;
            case 5:
                message.timeStamp = reader.int64();
                break;
            case 6:
                message.nonce = reader.int64();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BlockHeader message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BlockHeader
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BlockHeader} BlockHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockHeader.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlockHeader message.
     * @function verify
     * @memberof BlockHeader
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlockHeader.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.previousHash != null && message.hasOwnProperty("previousHash")) {
            if (!Array.isArray(message.previousHash))
                return "previousHash: array expected";
            for (var i = 0; i < message.previousHash.length; ++i)
                if (!(message.previousHash[i] && typeof message.previousHash[i].length === "number" || $util.isString(message.previousHash[i])))
                    return "previousHash: buffer[] expected";
        }
        if (message.merkleRoot != null && message.hasOwnProperty("merkleRoot"))
            if (!(message.merkleRoot && typeof message.merkleRoot.length === "number" || $util.isString(message.merkleRoot)))
                return "merkleRoot: buffer expected";
        if (message.stateRoot != null && message.hasOwnProperty("stateRoot"))
            if (!(message.stateRoot && typeof message.stateRoot.length === "number" || $util.isString(message.stateRoot)))
                return "stateRoot: buffer expected";
        if (message.difficulty != null && message.hasOwnProperty("difficulty"))
            if (!$util.isInteger(message.difficulty))
                return "difficulty: integer expected";
        if (message.timeStamp != null && message.hasOwnProperty("timeStamp"))
            if (!$util.isInteger(message.timeStamp) && !(message.timeStamp && $util.isInteger(message.timeStamp.low) && $util.isInteger(message.timeStamp.high)))
                return "timeStamp: integer|Long expected";
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            if (!$util.isInteger(message.nonce) && !(message.nonce && $util.isInteger(message.nonce.low) && $util.isInteger(message.nonce.high)))
                return "nonce: integer|Long expected";
        return null;
    };

    /**
     * Creates a BlockHeader message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BlockHeader
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BlockHeader} BlockHeader
     */
    BlockHeader.fromObject = function fromObject(object) {
        if (object instanceof $root.BlockHeader)
            return object;
        var message = new $root.BlockHeader();
        if (object.previousHash) {
            if (!Array.isArray(object.previousHash))
                throw TypeError(".BlockHeader.previousHash: array expected");
            message.previousHash = [];
            for (var i = 0; i < object.previousHash.length; ++i)
                if (typeof object.previousHash[i] === "string")
                    $util.base64.decode(object.previousHash[i], message.previousHash[i] = $util.newBuffer($util.base64.length(object.previousHash[i])), 0);
                else if (object.previousHash[i].length)
                    message.previousHash[i] = object.previousHash[i];
        }
        if (object.merkleRoot != null)
            if (typeof object.merkleRoot === "string")
                $util.base64.decode(object.merkleRoot, message.merkleRoot = $util.newBuffer($util.base64.length(object.merkleRoot)), 0);
            else if (object.merkleRoot.length)
                message.merkleRoot = object.merkleRoot;
        if (object.stateRoot != null)
            if (typeof object.stateRoot === "string")
                $util.base64.decode(object.stateRoot, message.stateRoot = $util.newBuffer($util.base64.length(object.stateRoot)), 0);
            else if (object.stateRoot.length)
                message.stateRoot = object.stateRoot;
        if (object.difficulty != null)
            message.difficulty = object.difficulty | 0;
        if (object.timeStamp != null)
            if ($util.Long)
                (message.timeStamp = $util.Long.fromValue(object.timeStamp)).unsigned = false;
            else if (typeof object.timeStamp === "string")
                message.timeStamp = parseInt(object.timeStamp, 10);
            else if (typeof object.timeStamp === "number")
                message.timeStamp = object.timeStamp;
            else if (typeof object.timeStamp === "object")
                message.timeStamp = new $util.LongBits(object.timeStamp.low >>> 0, object.timeStamp.high >>> 0).toNumber();
        if (object.nonce != null)
            if ($util.Long)
                (message.nonce = $util.Long.fromValue(object.nonce)).unsigned = false;
            else if (typeof object.nonce === "string")
                message.nonce = parseInt(object.nonce, 10);
            else if (typeof object.nonce === "number")
                message.nonce = object.nonce;
            else if (typeof object.nonce === "object")
                message.nonce = new $util.LongBits(object.nonce.low >>> 0, object.nonce.high >>> 0).toNumber();
        return message;
    };

    /**
     * Creates a plain object from a BlockHeader message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BlockHeader
     * @static
     * @param {BlockHeader} message BlockHeader
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlockHeader.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.previousHash = [];
        if (options.defaults) {
            object.merkleRoot = options.bytes === String ? "" : [];
            object.stateRoot = options.bytes === String ? "" : [];
            object.difficulty = 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.timeStamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.timeStamp = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.nonce = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.nonce = options.longs === String ? "0" : 0;
        }
        if (message.previousHash && message.previousHash.length) {
            object.previousHash = [];
            for (var j = 0; j < message.previousHash.length; ++j)
                object.previousHash[j] = options.bytes === String ? $util.base64.encode(message.previousHash[j], 0, message.previousHash[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.previousHash[j]) : message.previousHash[j];
        }
        if (message.merkleRoot != null && message.hasOwnProperty("merkleRoot"))
            object.merkleRoot = options.bytes === String ? $util.base64.encode(message.merkleRoot, 0, message.merkleRoot.length) : options.bytes === Array ? Array.prototype.slice.call(message.merkleRoot) : message.merkleRoot;
        if (message.stateRoot != null && message.hasOwnProperty("stateRoot"))
            object.stateRoot = options.bytes === String ? $util.base64.encode(message.stateRoot, 0, message.stateRoot.length) : options.bytes === Array ? Array.prototype.slice.call(message.stateRoot) : message.stateRoot;
        if (message.difficulty != null && message.hasOwnProperty("difficulty"))
            object.difficulty = message.difficulty;
        if (message.timeStamp != null && message.hasOwnProperty("timeStamp"))
            if (typeof message.timeStamp === "number")
                object.timeStamp = options.longs === String ? String(message.timeStamp) : message.timeStamp;
            else
                object.timeStamp = options.longs === String ? $util.Long.prototype.toString.call(message.timeStamp) : options.longs === Number ? new $util.LongBits(message.timeStamp.low >>> 0, message.timeStamp.high >>> 0).toNumber() : message.timeStamp;
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            if (typeof message.nonce === "number")
                object.nonce = options.longs === String ? String(message.nonce) : message.nonce;
            else
                object.nonce = options.longs === String ? $util.Long.prototype.toString.call(message.nonce) : options.longs === Number ? new $util.LongBits(message.nonce.low >>> 0, message.nonce.high >>> 0).toNumber() : message.nonce;
        return object;
    };

    /**
     * Converts this BlockHeader to JSON.
     * @function toJSON
     * @memberof BlockHeader
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlockHeader.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return BlockHeader;
})();

$root.BlockHeaders = (function() {

    /**
     * Properties of a BlockHeaders.
     * @exports IBlockHeaders
     * @interface IBlockHeaders
     * @property {Array.<IBlockHeader>|null} [blockHeaders] BlockHeaders blockHeaders
     * @property {number|null} [maxHeight] BlockHeaders maxHeight
     */

    /**
     * Constructs a new BlockHeaders.
     * @exports BlockHeaders
     * @classdesc Represents a BlockHeaders.
     * @implements IBlockHeaders
     * @constructor
     * @param {IBlockHeaders=} [properties] Properties to set
     */
    function BlockHeaders(properties) {
        this.blockHeaders = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BlockHeaders blockHeaders.
     * @member {Array.<IBlockHeader>} blockHeaders
     * @memberof BlockHeaders
     * @instance
     */
    BlockHeaders.prototype.blockHeaders = $util.emptyArray;

    /**
     * BlockHeaders maxHeight.
     * @member {number} maxHeight
     * @memberof BlockHeaders
     * @instance
     */
    BlockHeaders.prototype.maxHeight = 0;

    /**
     * Creates a new BlockHeaders instance using the specified properties.
     * @function create
     * @memberof BlockHeaders
     * @static
     * @param {IBlockHeaders=} [properties] Properties to set
     * @returns {BlockHeaders} BlockHeaders instance
     */
    BlockHeaders.create = function create(properties) {
        return new BlockHeaders(properties);
    };

    /**
     * Encodes the specified BlockHeaders message. Does not implicitly {@link BlockHeaders.verify|verify} messages.
     * @function encode
     * @memberof BlockHeaders
     * @static
     * @param {IBlockHeaders} message BlockHeaders message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockHeaders.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.blockHeaders != null && message.blockHeaders.length)
            for (var i = 0; i < message.blockHeaders.length; ++i)
                $root.BlockHeader.encode(message.blockHeaders[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.maxHeight != null && message.hasOwnProperty("maxHeight"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.maxHeight);
        return writer;
    };

    /**
     * Encodes the specified BlockHeaders message, length delimited. Does not implicitly {@link BlockHeaders.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BlockHeaders
     * @static
     * @param {IBlockHeaders} message BlockHeaders message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlockHeaders.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlockHeaders message from the specified reader or buffer.
     * @function decode
     * @memberof BlockHeaders
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BlockHeaders} BlockHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockHeaders.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BlockHeaders();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.blockHeaders && message.blockHeaders.length))
                    message.blockHeaders = [];
                message.blockHeaders.push($root.BlockHeader.decode(reader, reader.uint32()));
                break;
            case 2:
                message.maxHeight = reader.int32();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BlockHeaders message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BlockHeaders
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BlockHeaders} BlockHeaders
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlockHeaders.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlockHeaders message.
     * @function verify
     * @memberof BlockHeaders
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlockHeaders.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.blockHeaders != null && message.hasOwnProperty("blockHeaders")) {
            if (!Array.isArray(message.blockHeaders))
                return "blockHeaders: array expected";
            for (var i = 0; i < message.blockHeaders.length; ++i) {
                var error = $root.BlockHeader.verify(message.blockHeaders[i]);
                if (error)
                    return "blockHeaders." + error;
            }
        }
        if (message.maxHeight != null && message.hasOwnProperty("maxHeight"))
            if (!$util.isInteger(message.maxHeight))
                return "maxHeight: integer expected";
        return null;
    };

    /**
     * Creates a BlockHeaders message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BlockHeaders
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BlockHeaders} BlockHeaders
     */
    BlockHeaders.fromObject = function fromObject(object) {
        if (object instanceof $root.BlockHeaders)
            return object;
        var message = new $root.BlockHeaders();
        if (object.blockHeaders) {
            if (!Array.isArray(object.blockHeaders))
                throw TypeError(".BlockHeaders.blockHeaders: array expected");
            message.blockHeaders = [];
            for (var i = 0; i < object.blockHeaders.length; ++i) {
                if (typeof object.blockHeaders[i] !== "object")
                    throw TypeError(".BlockHeaders.blockHeaders: object expected");
                message.blockHeaders[i] = $root.BlockHeader.fromObject(object.blockHeaders[i]);
            }
        }
        if (object.maxHeight != null)
            message.maxHeight = object.maxHeight | 0;
        return message;
    };

    /**
     * Creates a plain object from a BlockHeaders message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BlockHeaders
     * @static
     * @param {BlockHeaders} message BlockHeaders
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlockHeaders.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.blockHeaders = [];
        if (options.defaults)
            object.maxHeight = 0;
        if (message.blockHeaders && message.blockHeaders.length) {
            object.blockHeaders = [];
            for (var j = 0; j < message.blockHeaders.length; ++j)
                object.blockHeaders[j] = $root.BlockHeader.toObject(message.blockHeaders[j], options);
        }
        if (message.maxHeight != null && message.hasOwnProperty("maxHeight"))
            object.maxHeight = message.maxHeight;
        return object;
    };

    /**
     * Converts this BlockHeaders to JSON.
     * @function toJSON
     * @memberof BlockHeaders
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlockHeaders.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return BlockHeaders;
})();

module.exports = $root;
