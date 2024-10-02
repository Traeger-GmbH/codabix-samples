/**
 * Contains Codabix-related functions and types, e.g. to access and manipulate nodes.
 */
declare namespace codabix {
    /**
     * Contains security-related Codabix functions.
     */
    namespace security {
        /**
         * Encrypts a password using the back-end database's password key, so that it can safely be stored in a node of type 'Password', or in script code where you can decrypt it using `decryptPassword()`.
         * 
         * Storing the encrypted password avoids showing a password in clear text on the screen, and if you create a backup, the password can only be decrypted when the backup option "Include Passwords" was enabled.
         * 
         * The returned string will consist only of printable ASCII characters (range U+0021 to U+007E).
         * @param password The password to encrypt.
         */
        function encryptPassword(password: string): string;
        /**
         * Encrypts a password using the back-end database's password key, so that it can safely be stored in a node of type 'Password', or in script code where you can decrypt it using `decryptPassword()`.
         * 
         * Storing the encrypted password avoids showing a password in clear text on the screen, and if you create a backup, the password can only be decrypted when the backup option "Include Passwords" was enabled.
         * 
         * The returned string will consist only of printable ASCII characters (range U+0021 to U+007E).
         * @param password The password to encrypt.
         */
        function encryptPassword(password: string | null): string | null;
        /**
         * Encrypts a password using the back-end database's password key, so that it can safely be stored in a node of type 'Password', or in script code where you can decrypt it using `decryptPassword()`.
         * 
         * Storing the encrypted password avoids showing a password in clear text on the screen, and if you create a backup, the password can only be decrypted when the backup option "Include Passwords" was enabled.
         * 
         * The returned string will consist only of printable ASCII characters (range U+0021 to U+007E).
         * @param password The password to encrypt.
         */
        function encryptPassword(password: string | null | undefined): string | null | undefined;

        /**
         * Decrypts a password that was previously encrypted with 'encryptPassword()', was stored in a node of type 'Password', or was encrypted using the 'Password Security' menu item in the Codabix Web Configuration.
         * @param password The password to decrypt.
         */
        function decryptPassword(password: string): string;
        /**
         * Decrypts a password that was previously encrypted with 'encryptPassword()', was stored in a node of type 'Password', or was encrypted using the 'Password Security' menu item in the Codabix Web Configuration.
         * @param password The password to decrypt.
         */
        function decryptPassword(password: string | null): string | null;
        /**
         * Decrypts a password that was previously encrypted with 'encryptPassword()', was stored in a node of type 'Password', or was encrypted using the 'Password Security' menu item in the Codabix Web Configuration.
         * @param password The password to decrypt.
         */
        function decryptPassword(password: string | null | undefined): string | null | undefined;
    }

    /**
     * Contains functions related to configuring nodes in the Codabix Web Configuration.
     */
    namespace nodeconfiguration {
        enum ContextMenuActionInheritanceFilter {
            FolderNodes = 1 << 0,

            DirectoryNodes = 1 << 1,

            MethodNodes = 1 << 2,

            FileNodes = 1 << 3,

            ValueNodes = 1 << 4,

            FolderLikeNodes = FolderNodes | DirectoryNodes,

            NonFolderLikeNodes = MethodNodes | FileNodes | ValueNodes,

            AllNodes = FolderLikeNodes | NonFolderLikeNodes
        }

        interface ContextMenuAction {
            /**
             * The display name which is shown as context menu entry.
             */
            displayName: string;

            /**
             * Asynchronously handles the context menu action and returns a result.
             * 
             * Note: This function can throw an exception (or reject the returned Promise), in which case the script will not be aborted.
             * @param node The node for which the action was executed.
             */
            handleActionAsync(node: Node): Promise<ContextMenuVoidResult | ContextMenuDownloadResult>;

            /**
             * If `null` or `undefined`, the action will be shown only for the original node. Otherwise, the action will be shown for the original node and its children when they meet the specified node type filter.
             */
            inheritanceFilter?: ContextMenuActionInheritanceFilter | null;
        }

        interface ContextMenuVoidResult {
            readonly type: "void";
        }

        interface ContextMenuDownloadResult {
            readonly type: "download";

            /**
             * The file content. This can either be a `string` (which will be encoded using UTF-8) or an `ArrayBuffer` for binary files.
             * */
            readonly content: string | ArrayBuffer;

            readonly mediaType?: string | null;

            readonly fileName?: string | null;
        }

        /**
         * Registers a context menu action for the specified node, optionally showing it also for child nodes.
         * @param node The node for which the action should be registered.
         * @param action The action to register.
         */
        function registerNodeContextMenuAction(node: Node, action: ContextMenuAction): void;

        /**
         * Unregisters a context menu action for the specified node that was previously registered with `registerNodeContextMenuAction()`.
         * @param node The node for which the action should be registered.
         * @param action The action to register.
         */
        function unregisterNodeContextMenuAction(node: Node, action: ContextMenuAction): void;
    }

    // With the introduction of the Variant type, an array can now also contain elements
    // of different types.
    type NodeValuePrimitiveType = null | boolean | number | string | Date | Blob | Object;
    type NodeValueType = NodeValuePrimitiveType | boolean[] | number[] | string[] | Date[] | Blob[] | Object[] | NodeValuePrimitiveType[];
    type NodePathType = NodeValueType;

    enum NodeValueStatusCodeEnum {
        Good = 0x0,
        Bad = (0x80000000 & 0xFFFFFFFF)
    }

    interface NodeValueStatus {
        readonly statusCode: NodeValueStatusCodeEnum,
        readonly statusText?: string | null;
        readonly isBad?: boolean;
    }

    enum TypeCodeEnum {
        // Basic types
        String = 10,
        Blob = 11,
        Null = 20,
        Boolean = 21,
        SByte = 22,
        Byte = 23,
        Int16 = 24,
        UInt16 = 25,
        Int32 = 26,
        UInt32 = 27,
        Int64 = 28,
        UInt64 = 29,
        Single = 30,
        Double = 31,
        DateTime = 32,
        TimeSpan = 33,
        Object = 100,
        Variant = 150
    }

    enum NodeTypeEnum {
        Folder = 0,
        Directory = 1,
        Method = 2,
        File = 100,
        Value = 1000
    }

    enum NodeHistoryOptions {
        /**
         * A history value is never created for the node.
         */
        Inactive = 0,

        /**
         * When a (non-`null`) `HistoryInterval` is set on the node, a history value is created at that interval by a background timer; otherwise, a history value is created when writing a value to the node.
         */
        Active = 1,

        /**
         * A history value is created according to the rules of `Active`, but only if the new value is different from the previous history value.
         */
        ValueChange = 2 | Active,

        /**
         * A history value is created according to the rules of `Active`, and additionally a subscription shall be created which will read the underlying device values in a regular interval.
         */
        Subscription = 4 | Active
    }

    class NodeIdentifier {
        // Declare a unused private variable to enforce nominal typing.
        private _;
        // Declare a private constructor to prevent constructing the class.
        private constructor();

        /**
         * The global identifier is a GUID that uniquely identifies this system instance and can be used to synchronize nodes on distributed instances.
         */
        readonly global: string; // Guid

        /**
         * The local identifier is a 64-bit integer that uniquely identifies a node on this system instance.
         */
        readonly local: number; // ID
    }

    // When the node identifier is a string and can be parsed as a GUID,
    // it is treated as a GUID instead of a node path.
    type NodeQueryIdentifier = number | string | string[] | NodeIdentifier;

    type NodeValueChangedEventListener = (this: Node, e: {
        readonly oldValue: NodeValue | null;
        // (newValue can be null if a transaction is reverted)
        readonly newValue: NodeValue | null;
        /**
         * Specifies if the new value can actually be considered to be different than the old value.
         * 
         * This uses the same mechanism as the `codabix.NodeValue.equals()` method.
         */
        readonly isValueChanged: boolean;
        readonly source: boolean | number | string | object | null;
    }) => void;

    type NodeChildrenChangedEventListener = (this: Node, e: {
        readonly added: readonly Node[];
        readonly removed: readonly Node[];
    }) => void;

    // TODO: Fill parameters of the event object
    type NodePropertyChangedEventListener = (this: Node, e: {}) => void;

    type NodeValueConverter = {
        /**
         * Converts the specified NodeValue.
         * @param value The value to convert.
         * @param writeFromDevice `true` if the write call originates from a device, or `false` otherwise.
         */
        (this: Node, value: NodeValue, writeFromDevice: boolean): NodeValue | null | undefined;
    }

    /**
     * Contains properties that are to be changed on a existing node. Only those properties that are set will be changed on the Node.
     */
    interface NodeStructure {
        name?: string;
        displayName?: string | null;
        description?: string | null;
        location?: string | null;
        minValue?: number | null;
        maxValue?: number | null;
        hysteresis?: number | null;
        scalingFactor?: number | null;
        scalingOffset?: number | null;
        unit?: string | null;
        format?: string | null;
        path?: NodePathType;
        pathType?: Type | null;
        parentIdentifier?: NodeIdentifier | null;
        type?: NodeTypeEnum;
        valueType?: Type | null;
        historyOptions?: NodeHistoryOptions;
        historyInterval?: number | null;
        historyResolution?: number | null;
        maxHistoryValues?: number | null;
        maxHistoryAge?: number | null;
        isReadOnly?: boolean;
    }

    // When creating a node, some of the properties are required. Therefore we extend
    // the interface and require those properties.
    /**
     * Contains properties that are used to create a new node. For properties which are not set, default values are used.
     */
    interface CreateNodeStructure extends NodeStructure {
        name: string;
        parentIdentifier: NodeIdentifier | null;
        type: NodeTypeEnum;
    }

    interface NodeReader {
        /**
         * Asynchronously excecutes a synchronous read for the specified nodes. When the returned Promise is fulfilled, it indicates that the synchronous read has completed.
         * 
         * The general contract is that the values are read from the underlying physical source **after** this method has been invoked.
         * 
         * After the values have been read, the NodeReader is responsible for writing the new value into the corresponding nodes.
         * 
         * Note that synchronous read requests are not automatically cumulated, so for each synchronous read that is executed, this method is called (even if a previous synchronous read did not yet finish).
         * @param nodes The nodes to be read.
         */
        readValuesAsync(nodes: Node[]): Promise<void>;

        /**
         * Called when a new subscription for the specified nodes has been created.
         * @param nodeTuples The node subscription tuples that have been created.
         * 
         * Items:
         * `node`: The subscribed node.
         * `interval`: The interval of the subscription in which values should be read, or `null` if a default interval should be used.
         * `forceUpdate`: `true` if the NodeReader handling the subscription should write a new value to the node even if the value is the same as the previous written value, `false` otherwise.
         */
        subscriptionCreated?(nodeTuples: {
            node: Node,
            interval: number | null,
            forceUpdate: boolean
        }[]): void;

        /**
         * Called when an existing subscription for the specified nodes has been modified.
         * @param nodeTuples The node subscription tuples that have been modified.
         * 
         * Items:
         * `node`: The subscribed node.
         * `interval`: The interval of the subscription in which values should be read, or `null` if a default interval should be used.
         * `forceUpdate`: `true` if the NodeReader handling the subscription should write a new value to the node even if the value is the same as the previous written value, `false` otherwise.
         */
        subscriptionModified?(nodeTuples: {
            node: Node,
            interval: number | null,
            forceUpdate: boolean
        }[]): void;

        /**
         * Called when a subscription for the specified nodes has been removed.
         * @param nodes The nodes that are being unsubscribed.
         */
        subscriptionRemoved?(nodes: Node[]): void;
    }

    interface NodeArgument {
        readonly name: string;
        readonly type: Type;
        value: NodeValueType;
    }

    interface NodeCommandContext {
        readonly inputArguments: readonly Readonly<NodeArgument>[] & {
            /**
             * Gets the input argument with the specified name, or returns `undefined` if it cannot be found.
             * @param name The name of the input argument.
             */
            get(name: string): Readonly<NodeArgument> | undefined;
        };

        readonly outputArguments: readonly NodeArgument[] & {
            /**
             * Gets the output argument with the specified name, or returns `undefined` if it cannot be found.
             * @param name The name of the output argument.
             */
            get(name: string): NodeArgument | undefined;
        };
    }

    interface NodeCommand {
        executeAsync(context: NodeCommandContext): Promise<void>;
    }

    // TODO: For this to work, we would need to add the parameter "fromDevice" to one of the write value methods.
    //interface NodeWriter {
    //    isWriteFromDevice(): boolean;

    //    writeValuesAsync(valueTuples: {
    //        node: Node;
    //        values: NodeValue[]
    //    }): Promise<void>;
    //}

    abstract class TypeMember {
        // Declare a unused private variable to enforce nominal typing.
        private _;

        readonly name: string;
        readonly displayName: string;
        readonly description: string;
    }

    class TypeValue extends TypeMember {
        /**
         * Creates a new TypeValue instance.
         * @param name
         * @param displayName
         * @param description
         * @param value
         */
        constructor(name: string, displayName: string, description: string, value: string | null);

        readonly value: string | null;
    }

    class TypeField extends TypeMember {
        /**
         * Creates a new TypeField instance.
         * @param name
         * @param displayName
         * @param description
         * @param fieldType
         */
        constructor(name: string, displayName: string, description: string, fieldType: codabix.Type);

        readonly fieldType: codabix.Type;
    }

    class Type {
        // Declare a unused private variable to enforce nominal typing.
        private _;

        static getType(typeCode: TypeCodeEnum, isArray?: boolean): Type;
        static getTypes(): Type[];

        /**
         * Creates a new Type instance.
         * @param name
         * @param displayName
         * @param description
         * @param fullName
         * @param typeCode
         * @param length
         * @param rank
         * @param validationExpression
         * @param typeValues
         * @param isValueRestricted
         */
        constructor(
            name: string,
            displayName: string,
            description: string,
            fullName: string,
            typeCode: TypeCodeEnum,
            fields?: ArrayLike<TypeField> | null,
            length?: number | null,
            rank?: ArrayLike<number | null> | null,
            validationExpression?: string | null,
            values?: ArrayLike<TypeValue> | null,
            isValueRestricted?: boolean);

        readonly identifier: number | null;
        readonly name: string;
        readonly displayName: string;
        readonly description: string;
        readonly fullName: string;
        readonly typeCode: TypeCodeEnum;
        readonly length: number | null;
        readonly rank: readonly (number | null)[] | null;
        readonly isValueRestricted: boolean;
        readonly validationExpression: string | null;
        readonly isArray: boolean;
        readonly isEnum: boolean;
        readonly isStruct: boolean;
        readonly isUserType: boolean;

        // This is implemented as a method to symbolize that we create a new array instance on every call.
        getValues(): readonly TypeValue[];

        // This is implemented as a method to symbolize that we create a new array instance on every call.
        getFields(): readonly TypeField[];

        /**
         * Returns a string representation of this Type.
         */
        toString(): string;
    }

    interface Types {
        readonly null: Type;
        readonly string: Type;
        readonly blob: Type;
        readonly boolean: Type;
        readonly byte: Type;
        readonly sbyte: Type;
        readonly int16: Type;
        readonly uint16: Type;
        readonly int32: Type;
        readonly uint32: Type;
        readonly int64: Type;
        readonly uint64: Type;
        readonly single: Type;
        readonly double: Type;
        readonly datetime: Type;
        readonly timespan: Type;
        readonly variant: Type;
        readonly stringArray: Type;
        readonly blobArray: Type;
        readonly booleanArray: Type;
        readonly byteArray: Type;
        readonly sbyteArray: Type;
        readonly int16Array: Type;
        readonly uint16Array: Type;
        readonly int32Array: Type;
        readonly uint32Array: Type;
        readonly int64Array: Type;
        readonly uint64Array: Type;
        readonly singleArray: Type;
        readonly doubleArray: Type;
        readonly datetimeArray: Type;
        readonly timespanArray: Type;
        readonly variantArray: Type;
        readonly password: Type;
        readonly passwordBlob: Type;
    }
    const Types: Types;

    /**
     * Represents a BLOB (binary large object) value that can be stored in a node with value type 'Blob'. 
     * The `Blob` instance is read-only.
     **/
    class Blob {
        // Declare a unused private variable to enforce nominal typing.
        private _;
        // Declare a private constructor to prevent constructing the class.
        private constructor();

        /**
         * Creates a new Blob instance from an `ArrayBuffer`.
         **/
        public static fromArrayBuffer(buffer: ArrayBuffer, mediaType?: string | null, fileName?: string | null): Blob;

        /**
         * Creates a new Blob instance from an Base64 string.
         **/
        public static fromBase64String(base64String: string, mediaType?: string | null, fileName?: string | null): Blob;

        public readonly length: number;
        public readonly fileName: string | null;
        public readonly mediaType: string | null;

        /**
         * Converts the `Blob` instance to a new `ArrayBuffer`.
         * 
         * Note: Because a `Blob` is read-only, a new `ArrayBuffer` instance will be created every time when this function is called.
         * */
        public toArrayBuffer(): ArrayBuffer;

        /**
         * Converts the `Blob` instance to a Base64 string.
         **/
        public toBase64String(): string;
    }

    class Object {
        constructor(type: Type);

        readonly type: Type;

        // TODO: Check if this property makes sense, as it would return a object whose properties
        // are the CodabixObject fields, which you can modify, but that wouldn't modify the underlying
        // CodabixObject - you would need to set the value again to that object in order to update
        // the values. Another possibility would be to implement handlers for the property access so
        // we can hook into the property access.
        //value: {
        //    [index: string]: NodeValueType;
        //};

        getFieldValue(index: number | string): NodeValueType;
        setFieldValue(index: number | string, value: NodeValueType): void;
    }

    // TODO: To support creating TimeSpan values, we would to implement a TimeSpan JS class like the following.
    //class TimeSpan {
    //    // Declare a unused private variable to enforce nominal typing.
    //    private _;

    //    readonly value: number; // milliseconds

    //    readonly days: number;
    //    readonly hours: number;
    //    readonly minutes: number;
    //    readonly seconds: number;
    //    readonly milliseconds: number;
    //    // ...

    //    /**
    //     * 
    //     * @param value The value in milliseconds.
    //     */
    //    constructor(value: number);
    //}

    class NodeSubscription {
        // Declare a unused private variable to enforce nominal typing.
        private _;
        // Declare a private constructor to prevent constructing the class.
        private constructor();

        /**
         * The nodes which have been subscribed.
         */
        readonly nodes: readonly Node[];

        /**
         * The refresh interval used for the subscription.
         */
        readonly interval: number | null;

        readonly forceUpdate: boolean;
    }

    /**
     * Represents a node value.
     */
    class NodeValue {
        // Declare a unused private variable to enforce nominal typing.
        private _;

        /**
         * The raw value.
         */
        readonly value: NodeValueType;
        readonly valueType: Type;
        /**
         * Contains the date/time when this value was created.
         */
        readonly timestamp: Date;
        /**
         * The status of the value.
         */
        readonly status: NodeValueStatus;

        /**
         * Creates a new NodeValue instance.
         * @param value The value.
         * @param timestamp The timestamp of the value. If not specified, the current time is used.
         * @param status The status of the value. If not specified. NodeValueStatus.Good is used.
         */
        constructor(value: NodeValueType, timestamp?: Date, status?: NodeValueStatus | NodeValueStatusCodeEnum);

        /**
         * Determines if two NodeValues can be considered to be equal, by checking their value and their status.
         * 
         * This is the same mechanism as used e.g. by the Codabix History Timer to determine if a node value has changed.
         * @param valueA
         * @param valueB
         */
        static equals(valueA: NodeValue | null | undefined, valueB: NodeValue | null | undefined): boolean;

        /**
         * Returns a string representation of this NodeValue.
         */
        toString(): string;
    }

    class Node {
        // Declare a unused private variable to enforce nominal typing.
        private _;
        // Declare a private constructor to prevent constructing the class.
        private constructor();


        readonly identifier: NodeIdentifier;

        /**
         * The name of the node. The name is used to find the node when specifying the node path for findNode().
         */
        readonly name: string;
        readonly displayName: string | null;
        readonly description: string | null;
        readonly location: string | null;
        readonly minValue: number | null;
        readonly maxValue: number | null;
        readonly hysteresis: number | null;
        readonly scalingFactor: number | null;
        readonly scalingOffset: number | null;
        readonly unit: string | null;
        readonly format: string | null;
        readonly historyOptions: NodeHistoryOptions;
        readonly historyInterval: number | null;
        readonly historyResolution: number | null;
        readonly maxHistoryValues: number | null;
        readonly maxHistoryAge: number | null;
        /**
         * The path of the node, which is used by devices like the S7 Device as variable address.
         * Note that this is not the same as the "node path" that can be retrieved using Node.getNodePath().
         */
        readonly path: NodePathType;
        readonly pathType: Type | null;
        readonly type: NodeTypeEnum;
        readonly valueType: Type | null;
        readonly position: number;
        readonly token: string;

        /***
         * Specifies whether the node is read-only. When `true`, the node cannot be updated (e.g. with `codabix.updateNode()`,
         * except when also updating `isReadOnly` to `false`), cannot be (un-)linked (e.g. with `codabix.linkNode()`), and
         * no new values can be written to it.
         */
        readonly isReadOnly: boolean;

        /**
         * The current value of this node, or null if it doesn't have a value.
         */
        readonly value: NodeValue | null;

        /**
         * The parent node of this node, or null if it doesn't have a parent.
         */
        readonly parent: Node | null;

        /**
         * The virtual link destination of this node, or `null` if this node doesn't have a virtual link to another node.
         * 
         * Note that the destination can in turn have a virtual link destination. To find the final link destination, you need to follow this property on the returned node until you get `null`.
         */
        readonly virtualLinkDestination: Node | null;


        /**
         * An array containing the child nodes.
         * 
         * Note: The array is not live – every time this property is accessed, a new array is returned.
         */
        readonly children: Node[];

        /**
         * Finds a node within this node using the specified query identifier.
         * @param identifier A value that identifies the node. It can be a local identifier (number), a global identifier (guid), a node path (string), a string array of node path elements, or a NodeIdentifier of an existing node.
         * @param throwIfNotFound Specifies if the method should throw when the specified node could not be found. The default is `false`.
         */
        findNode(identifier: NodeQueryIdentifier, throwIfNotFound: true): Node;
        /**
         * Finds a node within this node using the specified query identifier.
         * @param identifier A value that identifies the node. It can be a local identifier (number), a global identifier (guid), a node path (string), a string array of node path elements, or a NodeIdentifier of an existing node.
         * @param throwIfNotFound Specifies if the method should throw when the specified node could not be found. The default is `false`.
         */
        findNode(identifier: NodeQueryIdentifier, throwIfNotFound?: boolean): Node | null;

        /**
         * Retrieves the absolute Node Path to the node.
         * Note that this is not the same as the node's path that can be retrieved using the `path` property.
         */
        getNodePath(): string;

        /**
         * Returns a string representation of this Node.
         */
        toString(): string;


        /**
         * Adds a listener for the ValueChanged event. The listener will be called each time a value is written to the node.
         * Note that this event occurs even if the same value is written to the node. To determine if the value has actually changed, check the `isValueChanged` property of the listener argument.
         *
         * If you do not specify `false` for parameter `createSubscription`, calling this method will create an implicit subscription for this node (like it can be done with `codabix.subscribeNodes()`) until the listener is removed.
         * @param listener The event listener to register.
         * @param createSubscription `true` to create an implicit subscription for this node, or `false` to not create one. The default is `true`.
         */
        addValueChangedEventListener(listener: NodeValueChangedEventListener, createSubscription?: boolean): void;
        removeValueChangedEventListener(listener: NodeValueChangedEventListener): void;

        addChildrenChangedEventListener(listener: NodeChildrenChangedEventListener): void;
        removeChildrenChangedEventListener(listener: NodeChildrenChangedEventListener): void;

        addPropertyChangedEventListener(listener: NodePropertyChangedEventListener): void;
        removePropertyChangedEventListener(listener: NodePropertyChangedEventListener): void;

        /**
         * Registers a function that is called after a value is read from or before a value is written to a device. If the function returns a new NodeValue, this will become the value to be written to the node or the device.
         *
         * Note: The function can throw an exception to indicate that the conversion failed (in which case the script will not be aborted).
         * @param converter The value converter.
         */
        registerValueConverter(converter: NodeValueConverter): void;
        unregisterValueConverter(converter: NodeValueConverter): void;

        /**
         * Registers a NodeReader that will be notified when a synchronous read for the specified nodes has been requested, or an subscription has been created, changed or removed.
         * 
         * When a synchronous read has been requested, the script can write new values into the specified nodes before the asynchronous method `readValuesAsync` returns.
         * 
         * Note: You can register the same NodeReader instance for multiple nodes, so that Codabix only calls the corresponding NodeReader method one time for multiple nodes.
         * @param reader The NodeReader instance to register.
         * @param level The level of the NodeReader that determines the preference when a NodeReader is selected. The default is `100`.
         */
        registerReader(reader: NodeReader, level?: number): void;

        /**
         * Unregisters a NodeReader that was previously registered with `registerReader()`.
         * @param reader The NodeReader instance to unregister.
         */
        unregisterReader(reader: NodeReader): void;

        registerCommand(command: NodeCommand): void;
        unregisterCommand(command: NodeCommand): void;
    }


    // Plain values and methods

    /**
     * The root node. This is not a real node, but a placeholder for the visible root nodes which are stored in the children array of this root node.
     */
    const rootNode: Node;

    /**
     * Finds a node using the specified query identifier.
     *
     * @param identifier A value that identifies the node. It can be a local identifier (number), a global identifier (guid), a node path (string), a string array of node path elements, or a NodeIdentifier of an existing node.
     * @param throwIfNotFound Specifies if the method should throw when the specified node could not be found. The default is `false`.
     */
    function findNode(identifier: NodeQueryIdentifier, throwIfNotFound: true): Node;
    /**
     * Finds a node using the specified query identifier.
     *
     * @param identifier A value that identifies the node. It can be a local identifier (number), a global identifier (guid), a node path (string), a string array of node path elements, or a NodeIdentifier of an existing node.
     * @param throwIfNotFound Specifies if the method should throw when the specified node could not be found. The default is `false`.
     */
    function findNode(identifier: NodeQueryIdentifier, throwIfNotFound?: boolean): Node | null;

    /**
     * Executes a "synchronous read" on the specified nodes, returning the values asynchronously.
     * For nodes for which a node reader has been registered, their values are guaranteed to be physically read from the underlying device after the point in time when this method has been invoked.
     *
     * Returns a Promise which will be resolved with an array of node values where each value corresponds to the node in the supplied array.
     * @param nodes The nodes which should be read.
     */
    function readNodeValuesAsync(...nodes: Node[]): Promise<(NodeValue | null)[]>;
    /**
     * Executes a "synchronous read" on the specified nodes, returning the values asynchronously.
     * For nodes for which a node reader has been registered, their values are guaranteed to be physically read from the underlying device after the point in time when this method has been invoked.
     *
     * Returns a Promise which will be resolved with an array of node values where each value corresponds to the node in the supplied array.
     * @param nodes An array of nodes which should be read.
     */
    function readNodeValuesAsync(nodes: ArrayLike<Node>): Promise<(NodeValue | null)[]>;

    /**
     * Asynchronously reads history values for the specified node from the history database, optionally restricted by a start time, end time and a maximum count.
     * @param node The node for which history values should be read.
     * @param startTime If specified, only those values are returned which have a timestamp greater than or equal to this value.
     * @param endTime If specified, only those values are returned which have a timestamp lower than or equal to this value.
     * @param maxCount If specified, limits the number of returned values.
     */
    function readNodeHistoryValuesAsync(node: Node, startTime?: Date | null, endTime?: Date | null, maxCount?: number | null): Promise<(NodeValue & {
        /**
         * Contains the date/time when this value was captured in Codabix.
         */
        receiveTimestamp: Date;
    })[]>;

    /**
     * Writes the specified values to the corresponding nodes asynchronously.
     * 
     * Returns a Promise which will be fulfilled when the registered node writers report that the value has been written to the underlying device (or it will be fulfilled immediately if no node writers are registered).
     * @param nodeValues The values to write.
     */
    function writeNodeValuesAsync(...nodeValues: {
        node: Node,
        value: NodeValueType | NodeValue,
        source?: boolean | number | string | object | null
    }[]): Promise<(NodeValueStatus | null)[]>;
    /**
     * Writes the specified values to the corresponding nodes asynchronously.
     * 
     * Returns a Promise which will be fulfilled when the registered node writers report that the value has been written to the underlying device (or it will be fulfilled immediately if no node writers are registered).
     * @param nodeValues An array of values to write.
     */
    function writeNodeValuesAsync(nodeValues: {
        node: Node,
        value: NodeValueType | NodeValue,
        source?: boolean | number | string | object | null
    }[]): Promise<(NodeValueStatus | null)[]>;

    /**
     * Writes a value to the specified node asynchronously.
     * 
     * Returns a Promise which will be fulfilled when the registered node writers report that the value has been written to the underlying device (or it will be fulfilled immediately if no node writers are registered).
     * @param node The node to which the values should be written.
     * @param value The value to write.
     */
    function writeNodeValueAsync(node: Node, value: NodeValueType | NodeValue): Promise<NodeValueStatus | null>;

    /**
     * Creates a new node.
     * @param nodeStructure The structure that specifies the properties of the node to create.
     */
    function createNode(nodeStructure: CreateNodeStructure): Node;
    /**
     * Updates the specified node. Only the properties which are actually specified in the structure will be updated.
     * @param node The node to update.
     * @param nodeStructure The structure that specifies the properties to update.
     */
    function updateNode(node: NodeQueryIdentifier | Node, nodeStructure: NodeStructure): void;
    /**
     * Deletes the specified node.
     * @param node The node to delete.
     */
    function deleteNode(node: NodeQueryIdentifier | Node): void;

    /**
     * Deletes an user-defined Type which is not used by any node any more.
     * @param type The type to delete.
     */
    function deleteType(type: Type): void;

    /**
     * Moves the specified nodes (which must all have the same parent) by changing their position.
     * @param nodes The Nodes to move.
     * @param direction
     */
    function moveNodes(nodes: ArrayLike<Node>, direction: number): void;
    /**
     * Moves the specified nodes (which must all have the same parent) by changing their position.
     * @param nodes The Nodes to move.
     * @param beforeNode The node which all nodes to move must precede, or null if the nodes should be moved down after the last node.
     */
    function moveNodes(nodes: ArrayLike<Node>, beforeNode: Node | null): void;

    /**
     * Links the given node to the specified target node, or removes the link from the node.
     * Currently, the only supported link type is 'virtual link'.
     * @param node The node which is to be linked.
     * @param targetNode The target node to which `node` should link, or `null` if the link is to be removed.
     */
    function linkNode(node: NodeQueryIdentifier | Node, targetNode: NodeQueryIdentifier | Node | null): void;

    /**
     * Asynchronously executes the registered commands for the specified method node. The returned Promise object will be fulfilled (or rejected) when execution of the commands is finished.
     * @param identifier The node (or a value that identifies the node) whose commands should be executed.
     */
    function executeNodeCommandsAsync(identifier: NodeQueryIdentifier | Node): Promise<void>;

    /**
     * Creates a subscription for the specified nodes. This will notify registered NodeReaders so that they can start reading the value from the underlying device.
     * 
     * Note that you will still need to handle the ValueChanged event to get notified when a node's value changes.
     * @param nodes The nodes for which the subscription is to be created.
     * @param interval The interval at which the values should be read, or `null` if the default value should be used. The default is `null`.
     * @param forceUpdate `true` if the NodeReader handling the subscription should write a new value to the node even if the value is the same as the previous written value, `false` otherwise. The default is `false`.
     */
    function subscribeNodes(nodes: ArrayLike<codabix.Node>, interval?: number | null, forceUpdate?: boolean): NodeSubscription;

    /**
     * Removes the specified node subscription that was previously created with `subscribeNodes()`.
     * @param subscription
     */
    function unsubscribeNodes(subscription: NodeSubscription): void;


    // Events

    type NodeChangeCompletedEventListener = (this: typeof codabix, e: {}) => void;

    /**
     * Adds a listener for the NodeChangeCompleted event. The listener will be called each time a batch of node change events (ValueChanged, ChildrenChanged, PropertyChanged) is completed.
     *
     * For example, if you write values for multiple nodes at once, the ValueChanged event for each node is raised, and then the NodeChangeCompleted event is raised.
     */
    function addNodeChangeCompletedEventListener(listener: NodeChangeCompletedEventListener): void;
    function removeNodeChangeCompletedEventListener(listener: NodeChangeCompletedEventListener): void;

    /**
     * Schedules the callback to be executed as soon as possible after the current (node) event listener (if present) is left. If this method is not called from within an event listener, the callback is executed directly.
     * 
     * Normally, inside of a node event listener you cannot execute actions that would modify the node graph (e.g. write values). This method allows you to schedule a callback as soon as possible where you can modify the node graph.
     * 
     * You can specify arguments that should be passed to the callback function. This is more efficient than creating a closure each time, e.g. in an event listener where the callback needs access to the event parameters.
     * @param callback The function which should be called back.
     */
    function scheduleCallback<T extends any[]>(callback: (this: void, ...args: T) => void, ...args: T): void;
}


/**
 * Contains functions to create timers, so that you can let a function be called back at a regular interval.
 */
declare namespace timer {
    /**
     * Schedules repeated execution of the callback every `delay` milliseconds.
     * 
     * Returns a TimerHandle for use with clearInterval().
     * @param callback The function which should be called back.
     * @param delay The delay in milliseconds.
     */
    function setInterval(callback: (this: void) => void, delay: number): number;
    /**
     * Sets a timeout after wich the handler is called once.
     * 
     * Returns a TimerHandle for use with clearTimeout().
     * @param callback The function which should be called back.
     * @param delay The delay in milliseconds.
     */
    function setTimeout(callback: (this: void) => void, delay: number): number;

    /**
     * Cancels a timer that has been created with the setInterval() method.
     * @param handle The handle returned by setInterval().
     */
    function clearInterval(handle: number): void;
    /**
     * Cancels a timer that has been created with the setTimeout() method.
     * @param handle The handle returned by setTimeout().
     */
    function clearTimeout(handle: number): void;

    /**
     * Delays execution asynchronously by returning a Promise which will be fulfilled after the specified milliseconds have passed.
     * This can be used in an async function using `await timer.delayAsync(...)`.
     * @param delay The delay in milliseconds.
     */
    function delayAsync(delay: number): Promise<void>;

    /**
     * Interrupts execution asynchronously by returning a Promise which will be fulfilled after the current script execution is finished (and the current NodeLock is released).
     */
    function yield(): Promise<void>;
}


/**
 * Contains logging functions to write to the Script Log and the Codabix runtime log.
 */
declare namespace logger {
    enum LogLevel {
        Debug = 0,
        Info = 1,
        Warning = 2,
        Error = 3
    }

    /**
     * Writes the given message to the Script Log.
     * @param message The message to write.
     * @param level The log level. If not specified, Info is used.
     */
    function log(message: any, level?: LogLevel): void;

    /**
     * Writes the given message to the Script Log, using a log level of Debug.
     * @param message The message to write.
     */
    function logDebug(message: any): void;

    /**
     * Writes the given message to the Script Log, using a log level of Info.
     * @param message The message to write.
     */
    function logInfo(message: any): void;

    /**
     * Writes the given message to the Script Log, using a log level of Warning.
     * @param message The message to write.
     */
    function logWarning(message: any): void;

    /**
     * Writes the given message to the Script Log, using a log level of Error.
     * @param message The message to write.
     */
    function logError(message: any): void;
}


/**
 * Contains functions to persist string values across restarts of the script, using a string key.
 */
declare namespace storage {
    /**
     * Returns the saved value for this key, or null if it does not exist.
     */
    function getItem(key: string): string | null;

    /**
     * Saves the supplied value using the specified key. Existing values with the same key will be overwritten.
     */
    function setItem(key: string, value: string): void;

    /**
     * Removes the value for the specified key, if the key exists.
     */
    function clearItem(key: string): void;
}


/**
 * Contains namespaces for I/O operations.
 */
declare namespace io {
    /**
     * Defines a `closeAsync` method that must be called after the resource is not used any more.
     */
    interface Closeable {
        /**
         * Closes the resource.
         */
        closeAsync(): Promise<void>;
    }

    /**
     * Contains functions to work with file paths.
     */
    namespace path {
        /**
        * Combines the specified strings into a path.
        * @param pathElements The strings to be combined into a path.
        */
        function combinePath(...paths: string[]): string;

        /**
         * Returns the file name and extension of the specified path string.
         * @param filePath The path from which to obtain the file name and extension.
         */
        function getFileName(filePath: string): string;

        /**
         * Returns the directory information for the specified path string (the path without the file name), or `null` if the path denotes a root directory.
         * @param filePath The path of a file.
         */
        function getDirectoryName(filePath: string): string | null;
    }

    /**
     * Contains functions for directory operations.
     * Note: You should always specify the full path when working with files and directories.
     */
    namespace directory {
        /**
         * Determines whether the specified directory exists.
         * @param path The path to test.
         */
        function existsAsync(path: string): Promise<boolean>;

        /**
         * Creates all directories and subdirectories in the specified path unless they already exist.
         * @param path The directory to create.
         */
        function createAsync(path: string): Promise<void>;

        /**
         * Deletes a specified directory, and optionally any subdirectories.
         * @param path The name of the directory to remove.
         * @param recursive Specifies if files and subdirectories in the directory shall be deleted additionally to the directory itself. The default is `false`.
         */
        function deleteAsync(path: string, recursive?: boolean): Promise<void>;

        /**
         * Renames or moves a directory.
         * @param sourceFileName The path of the directory to move.
         * @param destFileName The new path of the directory.
         */
        function moveAsync(sourceDirName: string, destDirName: string): Promise<void>;

        /**
         * Returns a list of subfiles which are present in the specified directory.
         * The returned array elements contain the relative path.
         * @param path The path to the parent directory.
         */
        function getFilesAsync(path: string): Promise<string[]>;

        /**
         * Returns a list of subdirectories which are present in the specified directory.
         * The returned array elements contain the relative path.
         * @param path The path to the parent directory.
         */
        function getDirectoriesAsync(path: string): Promise<string[]>;
    }

    /**
     * Contains functions and types for file operations, e.g. to read or write a file.
     * Note: You should always specify the full path when working with files and directories.
     */
    namespace file {
        /**
         * Determines whether the specified file exists.
         * @param path The path to test.
         */
        function existsAsync(path: string): Promise<boolean>;

        /**
         * Copies a file.
         * @param sourceFileName The path of the file to copy.
         * @param destFileName The path of the destination file.
         * @param failIfDestFileExists `true` to throw an exception if the destination file already exists, `false` to overwrite it in that case. The default is `false`.
         */
        function copyAsync(sourceFileName: string, destFileName: string, failIfDestFileExists?: boolean): Promise<void>;

        /**
         * Renames or moves a file.
         * @param sourceFileName The path of the file to move.
         * @param destFileName The new path of the file.
         */
        function moveAsync(sourceFileName: string, destFileName: string): Promise<void>;

        /**
         * Deletes a file.
         * @param path The path of the file to delete.
         */
        function deleteAsync(path: string): Promise<void>;

        /**
         * Reads all text from the file, using UTF-8 encoding (or if decoding fails, using ISO-8859-1).
         *
         * Note: The function will fail if the file size exceeds 500 MiB.
         * @param path The path of the file to read.
         */
        function readAllTextAsync(path: string): Promise<string>;

        /**
         * Writes the specified text to the file, using UTF-8 encoding.
         * @param path The path of the file to write.
         * @param content
         * @param includeBom `true` to include a UTF-8 Byte Order Mark, `false` otherwise. The default is `false`.
         * @param failIfExists `true` to throw an exception if the file already exists, `false` to overwrite it in that case. The default is `false`.
         */
        function writeAllTextAsync(path: string, content: string, includeBom?: boolean, failIfExists?: boolean): Promise<void>;

        /**
         * Reads all bytes from the file.
         *
         * Note: The function will fail if the file size exceeds 500 MiB.
         * @param path The path of the file to read.
         */
        function readAllBytesAsync(path: string): Promise<ArrayBuffer>;

        /**
         * Writes the bytes in the specified `ArrayBuffer` to the file.
         * @param path The path of the file to write.
         * @param arrayBuffer The `ArrayBuffer` containing the bytes to write.
         * @param failIfExists `true` to throw an exception if the file already exists, `false` to overwrite it in that case. The default is `false`.
         */
        function writeAllBytesAsync(path: string, arrayBuffer: ArrayBuffer, failIfExists?: boolean): Promise<void>;

        /**
         * Opens a text file using UTF-8 encoding and returns a `Reader` instance that can be used to read the file.
         * 
         * Note: You need to close the `Reader` when you are finished with reading the file.
         * @param path The path of the file to open.
         */
        function openReaderAsync(path: string): Promise<Reader>;

        /**
         * Opens a text file using UTF-8 encoding and returns a `Writer` instance that can be used to write to the file.
         * 
         * Note: You need to close the `Writer` when you are finished with writing to the file.
         * @param path The path of the file to open.
         * @param append If `true`, the file is opened in "append" mode (which means the new content will be appended to existing files). If `false`, an existing file (if present) will be overwritten, unless `failIfExists` is `true`. The default is `false`.
         * @param includeBom If `true`, the writer includes a UTF-8 Byte Order Mark when creating a new file. The default is `false`.
         * @param failIfExists `true` to throw an exception if the file already exists, `false` to overwrite it in that case. The default is `false`. Note that you cannot set `append` to `true` if `failIfExists` is `true`.
         */
        function openWriterAsync(path: string, append?: boolean, includeBom?: boolean, failIfExists?: boolean): Promise<Writer>;

        /**
         * Represents a reader to read strings from a text file.
         */
        class Reader implements Closeable {
            // Declare a private constructor to prevent constructing the class.
            private constructor();

            /**
             * Gets the current file length in bytes.
             * 
             * Note: This number is not necessarily proportional to the number of characters because UTF-8 uses a variable length of bytes per character.
             */
            getFileLengthAsync(): Promise<number>;

            /**
             * Reads a line from the file and returns the line as string, or `null` if the end of file has been reached.
             */
            readLineAsync(): Promise<string | null>;

            /**
             * Reads up to `maxCount` lines from the file and returns them as string array. If the array contains less than `maxCount` lines, the end of file has been reached.
             * 
             * Note: This method is more efficient than `readLineAsync` when you read multiple lines at once.
             * @param maxCount
             */
            readLinesAsync(maxCount?: number): Promise<string[]>;

            /**
             * Reads a string chunk from the file, limited by `length`.
             * If `length` is not specified, the complete file is read (up to a limit of 100 MB).
             * 
             * Reaching the end of the file is indicated by returning a string whose length is smaller than the supplied `length`.
             * @param length The maximum length of the chunk to read. If not specified, the maximum length is 104857600.
             */
            readStringAsync(length?: number): Promise<string>;

            /**
             * Closes the file.
             */
            closeAsync(): Promise<void>;
        }

        /**
         * Represents a writer to write strings to a text file.
         */
        class Writer implements Closeable {
            // Declare a private constructor to prevent constructing the class.
            private constructor();

            /**
             * Gets the current file length in bytes.
             * 
             * Note: This number is not necessarily proportional to the number of characters because UTF-8 uses a variable length of bytes per character.
             */
            getFileLengthAsync(): Promise<number>;

            /**
             * Writes a line to the file.
             * @param line The line to write.
             */
            writeLineAsync(line?: string): Promise<void>;

            /**
             * Writes the lines to the file.
             * 
             * Note: This method is more efficient than `writeLineAsync` when you write multiple lines at once.
             * @param lines A string array containing the lines to write.
             */
            writeLinesAsync(lines: string[]): Promise<void>;
            /**
             * Writes the lines to the file.
             * 
             * Note: This method is more efficient than `writeLineAsync` when you write multiple lines at once.
             * @param lines The lines to write.
             */
            writeLinesAsync(...lines: string[]): Promise<void>;

            /**
             * Writes a string to the file, without appending a line break.
             * @param string The string to write.
             */
            writeStringAsync(string: string): Promise<void>;

            /**
             * Closes the file.
             */
            closeAsync(): Promise<void>;
        }
    }

    namespace storagemodel {
        enum StorageEntryType {
            Item,
            Container
        }

        /**
         * A storage entry is an abstract representation of a storage element, which can be a container (like a directory) or an item (like a file).
         * 
         * Non-async methods don't involve any I/O and will complete immediately, whereas async methods will involve I/O and might take a short time to complete.
         */
        class StorageEntry {
            // Declare a unused private variable to enforce nominal typing.
            private _;
            // Declare a private constructor to prevent constructing the class.
            private constructor();

            /**
             * Gets the name of the storage entry, for example the file name.
             */
            readonly name: string;

            /**
             * Gets a value that indicates whether this entry represents a container entry (like a directory) or an item entry (like a file).
             */
            readonly type: StorageEntryType;

            /**
             * Gets an URI string representing this entry's location.
             */
            readonly location: string;

            /**
            * Determines whether this entry exists in the underlying storage.
            * @param path The path to test.
            */
            existsAsync(): Promise<boolean>;

            /**
             * Gets a `StorageEntry` representing a child element with the specified name and type.
             * 
             * Calling this method doesn't invole any I/O.
             * @param name
             * @param type
             */
            child(name: string, type: StorageEntryType): StorageEntry;

            /**
             * Retrieves `StorageEntry`s for the child elements of the current entry.
             */
            childrenAsync(): Promise<StorageEntry[]>;

            /**
             * Creates this storage entry in the underlying storage (for example, creates a directory).
             */
            createAsync(): Promise<void>;

            /**
             * Deletes this storage entry in the underlying storage.
             */
            deleteAsync(): Promise<void>;

            /**
             * Reads all text from the storage entry, using UTF-8 encoding (or if decoding fails, using ISO-8859-1).
             */
            readAllTextAsync(): Promise<string>;

            /**
             * Reads all bytes from the storage entry.
             */
            readAllBytesAsync(): Promise<ArrayBuffer>;

            /**
             * Writes the specified text to the storage entry, using UTF-8 encoding.
             * @param content
             * @param includeBom `true` to include a UTF-8 Byte Order Mark, `false` otherwise. The default is `false`.
             * @param failIfExists `true` to throw an exception if the storage entry already exists, `false` to overwrite it in that case. The default is `false`.
             */
            writeAllTextAsync(content: string, includeBom?: boolean, failIfExists?: boolean): Promise<void>;

            /**
             * 
             * Writes the bytes in the specified `ArrayBuffer` to the file.
             * @param content
             * @param failIfExists `true` to throw an exception if the storage entry already exists, `false` to overwrite it in that case. The default is `false`.
             */
            writeAllBytesAsync(content: ArrayBuffer, failIfExists?: boolean): Promise<void>;
        }

        abstract class Storage implements Closeable {
            // Declare a unused private variable to enforce nominal typing.
            private _;

            /**
             * Gets the URI scheme used by this `Storage`.
             */
            readonly scheme: string;

            /**
             * Opens the storage, which may involve creating a network connection to the target.
             */
            openAsync(): Promise<void>;

            /**
             * Closes the storage. After calling this method, `StorageEntry` objects retrieved from this `Storage` may no longer be used.
             */
            closeAsync(): Promise<void>;

            /**
             * Gets a `StorageEntry` from this storage using the specified URI.
             * @param uri The entry URI. The URI can be generated using the `getUri()` method of the corresponding `Storage` subclass.
             * @param type
             */
            getEntry(uri: string, type: StorageEntryType): StorageEntry;
        }

        /**
         * Implements an FTP-based storage. While the storage is opened, it will hold a FTP connection to the specified server.
         * 
         * Note: There can only ever be a single async operation in progress at any point in time on the `Storage` itself or any `StorageEntry` instances that originate from this `Storage`.
         */
        class FtpStorage extends Storage {
            constructor(hostname: string, port?: number | null, username?: string | null, password?: string | null);

            /**
             * Gets a URI from the specified FTP path that is suitable for passing it to `Storage.getEntry()`.
             * @param path The file or directory path. It must start with a forward slash (`/`).
             */
            getUri(path: string): string;
        }
    }
}


/**
 * Contains methods and classes that can be used for network-related operations.
 */
declare namespace net {
    interface RawWebSocket {
        /**
         * Asynchronously sends the specified string chunk as a text message.
         * 
         * Note: You can call this method while a `receiveAsync` operation is still in progress.
         * @param content The string to send.
         * @param endOfMessage If `true`, specifies that this chunk completes the current message. The default is `true`.
         */
        sendAsync(content: string /*| ArrayBuffer */, endOfMessage?: boolean): Promise<void>;

        /**
         * Asynchronously reads a chunk of the next message, limited by `length`, reading as much as possible before returning.
         * 
         * If the returned string's length is smaller than the `length` argument, the current message is completed.
         * If the return value is `null`, the WebSocket has been closed.
         * 
         * Currently, only text messages are supported. When receiving a binary message, this method will throw.
         * 
         * Note: You can call this method while a `sendAsync` operation is still in progress.
         * @param length The number of characters to read.
         */
        receiveAsync(length: number): Promise<string /* | Uint8Array */ | null>;

        //closeOutputAsync(): Promise<void>;

        /**
         * Aborts the WebSocket connection and cancels any pending I/O operations.
         * 
         * Note: You can call this method while `sendAsync` and/or `receiveAsync` operations are still in progress. After calling this method, the pending `sendAsync` and `receiveAsync` operations will complete as soon as possible with an error.
         */
        abort(): void;
    }

    // TODO: Allow to suppress the CORS header. This must be specified when registering
    // the route as we do not route OPTIONS requests.

    /**
     * Registers the given callback as a HTTP route for the path "/scripthandlers/<routePath>".
     *
     * The callback will be called each time a request to that URL arrives at the web server. The `HttpContext` will stay active until the returned `Promise` object is fulfilled.
     * @param routePath The route path to register.
     * @param asyncHandler The handler for the request.
     */
    function registerHttpRoute(routePath: string, asyncHandler: (context: HttpContext) => Promise<void>, options?: {
        /*
         * Specifies whether user authentication is performed when processing the request. The default is `"none"`.
         * For `"none"`, the `HttpContext.user` property will be `null`; otherwise, the property will contain a `HttpUser` object with information about the authenticated (or anonymous) user.
         * 
         * - `"none"`: No user authentication is performed.
         * - `"optional"`: User authentication is performed if a token is provided. If it fails or no token was provided, an anonymous user is assumed. 
         * - `"mandatory"`: User authentication is always performed; if it fails or no token was provided, the request is rejected with a HTTP 403 status.
         * 
         * In order to authenticate, a client can retrieve an access token from the REST Interface v2 using the `/api/rest/users/authenticate` endpoint, and then send the retrieved token in a `Authorization: Bearer <token>` HTTP header.
         */
        authentication?: "none" | "optional" | "mandatory";
        // suppressCorsHeader?: boolean;
    }): void;

    /**
     * Unregisters a HTTP route that was previously registered with registerHttpRoute().
     * @param routePath
     */
    function unregisterHttpRoute(routePath: string): void;

    interface HttpUser {
        /**
         * Determines whether the current user is in the specified user group.
         * @param name The name of the user group.
         */
        isInGroup(name: string): boolean;

        /**
         * Specifies whether this is the Admin user.
         */
        readonly isAdmin: boolean;

        /**
         * Specifies whether this is the anonymous user (which means the user wasn't authenticated).
         */
        readonly isAnonymous: boolean;

        /**
         * The ID of the user. This will be `null` for the Admin user (when `isAdmin` is `true`).
         */
        readonly id: number | null;
        /**
         * The login name of the user. This will be `null` for the Admin user and anonymous user (when `isAdmin` is `true` or `isAnonymous` is `true`).
         */
        readonly loginName: string | null;
        readonly loginEmail: string | null;
        readonly loginPhoneNumber: string | null;
    }

    class HttpContext implements io.Closeable {
        // Declare a private constructor to prevent constructing the class.
        private constructor();

        /**
         * The `HttpRequest` object that represents the request sent by the client.
         */
        readonly request: HttpRequest;

        /**
         * The `HttpResponse` object that represents the response to be sent to the client.
         */
        readonly response: HttpResponse;

        /**
         * The authenticated or anonymous user associated with this request, or `null` if authentication has been set to `"none"` for the route.
         * If the user isn't authenticated, the `HttpUser.isAnonymous` property will be `true`.
         */
        readonly user: HttpUser | null;

        /**
         * Specifies if this request is a WebSocket request that can be accepted with `acceptWebSocketAsync`.
         */
        readonly isWebSocketRequest: boolean;

        /**
         * Accepts the WebSocket request and returns the `RawWebSocket` instance that can be used to communicate with the client.
         * @param subProtocol The sub-protocol to use, or undefined to not specify a sub-protocol.
         */
        acceptWebSocketAsync(subProtocol?: string): Promise<RawWebSocket>;

        /**
         * Serves a static file to the client.
         * @param path The path to the file.
         * @param downloadFilename If specified, serves the file as download (using a `Content-Disposition: attachment` header), using the specified string as download filename.
         */
        serveStaticFileAsync(path: string, downloadFilename?: string): Promise<void>;


        /**
         * Closes this `HttpContext`. This method will implicitly be called when the `Promise` object returned by the callback is fulfilled.
         */
        closeAsync(): Promise<void>;
    }

    interface HttpRequest {
        readonly requestMethod: "GET" | "HEAD" | "POST";

        /**
         * The HTTP headers sent by the client. Note that the keys are stored lower-case (e.g. `"content-type"`).
         */
        readonly headers: { [key: string]: string | undefined; };

        /**
         * The query string included in the request.
         */
        readonly queryString: { [key: string]: string | undefined; };

        /**
         * The client IP address (IPv4 or IPv6) from which the request originated.
         */
        readonly remoteAddress: string;

        /**
         * The server host name as specified by the client.
         */
        readonly serverHost: string;

        /**
         * The server port as specified by the client.
         */
        readonly serverPort: number;

        /**
         * Specifies if this request was sent over a secure connection (https).
         */
        readonly isHttps: boolean;

        /**
         * Reads a string chunk from the request body, limited by `length`, reading as much as possible before returning.
         *
         * Reaching the end of the request body is indicated by returning a string whose length is smaller than the supplied `length` argument.
         * @param length The maximum length of the chunk to read.
         */
        readBodyAsStringAsync(length: number): Promise<string>;

        /**
         * Reads a string chunk from the request body, limited by `length`, returning as soon as possible after trying to read at least one char (if `length` > 0).
         * 
         * Reaching the end of the request body is indicated by returning an empty string (`""`), provided that the supplied `length` argument is not equal to 0.
         * @param length The maximum length of the chunk to read.
         */
        readBodySegmentAsStringAsync(length: number): Promise<string>;

        //readBodyAsUint8ArrayAsync(length: number): Promise<Uint8Array>;
    }

    interface HttpResponse {
        contentType: string | null;

        statusCode: number;

        // TODO: Allow to write an ArrayBuffer/Uint8Array later
        /**
         * Writes the given string into the response body.
         * 
         * Note: If you only write a single string, you can achieve better performance by calling `writeBodyCompleteAsync` instead.
         * @param content The string to write into the response body.
         */
        writeBodyAsync(content: string /* | ArrayBuffer */): Promise<void>;

        /**
         * Writes the given string into the response body and then closes the response.
         * 
         * Calling this method is more performant than calling `writeBodyAsync` if you only write a single string, because if no data has been written to the response yet, the server can set a `Content-Length` header and does not need to send an additional data chunk after closing the response.
         * @param content The string to write into the response body.
         */
        writeBodyCompleteAsync(content: string /* | ArrayBuffer */): Promise<void>;
    }

    /**
     * Contains methods that allow to send HTTP requests to a server.
     */
    namespace httpClient {
        type ContentHeaders = {
            /**
             * The MIME type (possibly including a charset for text types) of the content.
             * 
             * For example, a JSON content could specify the content type `"application/json"`.
             */
            "content-type"?: string;
            "last-modified"?: string;
            expires?: string;
            [key: string]: string | undefined;
        };

        type RequestHeaders = {
            accept?: string;
            authorization?: string;
            "user-agent"?: string;
            [key: string]: string | undefined;
        }

        type ResponseHeaders = {
            server?: string;
            [key: string]: string | undefined;
        }

        interface HttpContent {
            /**
             * The HTTP headers associated with the content that are to be sent to the server.
             */
            readonly headers?: ContentHeaders;

            /**
             * The content body as string.
             * 
             * Note: The following items apply when sending the content to the server:
             * * The string body will always be encoded using UTF-8.
             * * If you don't specify a `content-type` header in the `headers` object, `"text/plain; charset=utf-8"` will be used.
             * * If you specify a custom `content-type` header for a text MIME type, you should append the string `"; charset=utf-8"` to indicate the UTF-8 encoding to the server.
             */
            readonly body: string;
        }

        interface HttpContentReceived extends HttpContent {
            /**
             * The HTTP headers associated with the content that were received from the server. The keys are stored lower case (e.g. `"content-type"`).
             */
            readonly headers: ContentHeaders;
        }

        interface HttpRequestMessage {
            /**
             * The URL used for the HTTP request.
             */
            readonly url: string;

            /**
             * The HTTP method to use for the request. The default is `"GET"`.
             */
            readonly method?: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT" | "TRACE";

            /**
             * When `true`, an "Expect: 100-Continue" header is added when sending the request. The default is `false`.
             * 
             * This allows the client to handle the case when sending a request which includes a body, but the server sends a response after reading the request headers but before reading the request body, which otherwise could lead to a deadlock in certain cases (as the client might only start to read the response once it completely sent the request body).
             */
            readonly expectContinue?: boolean;

            /**
             * The HTTP request headers to be sent to the server.
             * 
             * Note: Headers that belong to the content (like `Content-Type`) must not be set here, but instead in the `headers` object of the `content` object.
             * 
             * Note: When you want to provide multiple values for a header, you can use a line feed (\n) character to delimit the values.
             */
            readonly headers?: RequestHeaders;

            /**
             * The content of the HTTP request to be sent to the server.
             * 
             * Note: A content can only be used with HTTP methods that allow a content to be sent (like POST).
             */
            readonly content?: HttpContent;
        }

        interface HttpResponseMessage {
            /**
             * The status code of the HTTP response received from the server.
             */
            readonly statusCode: number;

            /**
             * The HTTP response headers received from the server. The keys are stored in lower case.
             * 
             * Note: Headers that belong to the content (like `Content-Type`) are not stored here, but instead in the `headers` object of the `content` object.
             */
            readonly headers: ResponseHeaders;

            /**
             * The content of the HTTP response received from the server.
             */
            readonly content?: HttpContentReceived;
        }

        interface HttpOptions {
            /**
             * When `true`, specifies that SSL/TLS errors (e.g. when the certificate cannot be validated) for `https` requests are ignored. The default is `false`.
             * 
             * This can be useful for testing purposes, but note that this means the connection will be **insecure**.
             */
            readonly ignoreSslErrors?: boolean;
        }

        interface RawWebSocket extends net.RawWebSocket, io.Closeable {
            /**
             * Closes the WebSocket. Note that this will close the connection immediately, without doing a graceful shutdown.
             */
            closeAsync(): Promise<void>;
        }

        //function getAsync(url: string): Promise<HttpResponseMessage>;
        //function getStringAsync(url: string): Promise<string>;

        /**
         * Asynchronously sends an HTTP request.
         * 
         * Note: The function will fail if the response content sent by the server is larger than 500 MB.
         * 
         * Example (sending a POST request to the Codabix REST API):
         * ```ts
         * let result = await net.httpClient.sendAsync({
         *     url: "http://localhost:8181/api/json",
         *     method: "POST",
         *     content: {
         *         headers: {
         *             "content-type": "application/json"
         *         },
         *         body: JSON.stringify({
         *             username: "demo@user.org",
         *             password: codabix.security.decryptPassword("<encrypted-password>"),
         *             browse: {
         *                 na: "/Nodes"
         *             }
         *         })
         *     }
         * });
         * 
         * if (result.content) {
         *     let jsonResult = JSON.parse(result.content.body);
         *     // TODO: Process JSON result...
         * }  
         * ```
         * @param request The HTTP request to be sent.
         * @param ensureSuccessStatusCode `true` to throw when the response status code doesn't indicate success, `false` otherwise. The default is `true`.
         * @param options Options for the HTTP connection, for example to ignore SSL/TLS certificate errors.
         */
        function sendAsync(request: HttpRequestMessage, ensureSuccessStatusCode?: boolean, options?: HttpOptions): Promise<HttpResponseMessage>;

        /**
         * Asynchronously connects to a WebSocket server using the specified URL.
         * @param url The web socket URL. It must begin with `ws:` or `wss:`.
         */
        function connectWebSocketAsync(url: string): Promise<RawWebSocket>;
    }

    /**
     * Contains methods that allow to send an ICMP echo request.
     */
    namespace ping {
        interface PingReply {
            /**
             * The IP address of the host that sent the reply.
             * 
             * It can be `"0.0.0.0"` (for IPv4) or the IPv6 "none" address in a format 
             * like `"::"` or `"0:0:0:0:0:0:0:0"` when no host sent a reply.
             */
            readonly address: string;

            /**
             * The round tip time in milliseconds.
             * 
             * Note: This property will be `0` when `status` is not `"success"`.
             */
            readonly roundtripTime: number;

            /**
             * The result of the operation. Any value other than `"success"` indicates
             * a failure.
             */
            readonly status: "success" | "timedOut" | "unknown";
        }

        /**
         * Sends an ICMP echo request to the specified host and receives a
         * corresponding ICMP echo reply.
         * @param host A host name or IP address that indicates the destination machine.
         */
        function sendAsync(host: string): Promise<PingReply>;
    }
}


/**
 * Contains functions related to XML.
 */
declare namespace xml {
    /**
     * Encodes the given string so that it can safely be used in HTML or XML as text (or attribute value), and additionally replaces invalid XML 1.0 characters with spaces.
     * @param value
     */
    function encode(value: string): string;
    /**
     * Encodes the given string so that it can safely be used in HTML or XML as text (or attribute value), and additionally replaces invalid XML 1.0 characters with spaces.
     * @param value
     */
    function encode(value: string | null | undefined): string | null | undefined;
}


/**
 * Contains functions related to creating or manipulating a globally unique identifier (GUID).
 */
declare const Guid: {
    /**
     * Creates a new GUID and formats it as string.
     * @param format
     */
    newGuidString(format?: string): string;
};


/**
 * Contains functions to interact with the Script Runtime Environment.
 */
declare namespace runtime {
    /**
     * Handles the Promise object returned by an async function to ensure unhandled exceptions are not silently swallowed.
     * @param promise The `Promise` to handle.
     */
    function handleAsync(promise: Promise<unknown>): void;

    /**
     * Replaces the name of each environment variable embedded in the specified string with the string equivalent of the value of the variable, then returns the resulting string.
     * @param path A string containing the names of zero or more environment variables. Each environment variable is quoted with the percent sign character (%).
     */
    function expandEnvironmentVariables(path: string): string;

    /**
     * The new line string defined for the current environment.
     */
    export const newLine: string;

    /**
     * Stores a shutdown handler that will be called when the script is to be stopped, e.g. because the Codabix Engine is shutting down, or the user has set the script to 'Disabled'.
     * 
     * Note: You don't need to release resources or remove event handlers in this method – this will be done automatically when the script is stopped.
     */
    export let onShutdown: (() => void) | null;

    /**
     * Contains additional date-related functionality.
     */
    namespace date {
        /**
         * Formats a date using the specified .NET `DateTime` format string.
         * @param date The Date object (or the date number) which should be formatted.
         * @param format The .NET `DateTime` format string. For more information, see https://learn.microsoft.com/dotnet/standard/base-types/standard-date-and-time-format-strings and https://learn.microsoft.com/dotnet/standard/base-types/custom-date-and-time-format-strings
         * @param invariantCulture `true` to format the date using the invariant culture; `false` to format it using the local culture. The default is `false`.
         * @param utcTime `true` to format the date as UTC time; `false` to format it as local time. The default is `false`.
         */
        function format(date: Date | number, format: string, invariantCulture?: boolean, utcTime?: boolean): string;
    }

    /**
     * Contains functionality for converting values.
     */
    namespace convert {
        /**
         * Converts a Base64 string into an `ArrayBuffer`.
         * @param s The Base64 string that is to be converted.
         */
        function fromBase64String(s: string): ArrayBuffer;

        /**
         * Converts the contents of an `ArrayBuffer` to a Base64 string.
         * @param buffer The ArrayBuffer whose contents are to be converted.
         */
        function toBase64String(buffer: ArrayBuffer): string;
    }
}
