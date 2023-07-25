export var NodeType;
(function (NodeType) {
    NodeType["folder"] = "folder";
    NodeType["value"] = "value";
    NodeType["file"] = "file";
    NodeType["method"] = "method";
    NodeType["directory"] = "directory";
})(NodeType || (NodeType = {}));
export var Type;
(function (Type) {
    Type["int16"] = "int16";
    Type["int32"] = "int32";
    Type["int64"] = "int64";
    Type["object"] = "object";
})(Type || (Type = {}));
export var HistoryOptions;
(function (HistoryOptions) {
    HistoryOptions["inactive"] = "inactive";
    HistoryOptions["active"] = "active";
    HistoryOptions["valueChange"] = "valueChange";
    HistoryOptions["subscription"] = "subscription";
})(HistoryOptions || (HistoryOptions = {}));
export class Node {
    constructor(init) {
        Object.assign(this, init);
    }
}
export class ValueNode extends Node {
    constructor(init) {
        super(init);
        this.type = NodeType.value;
        Object.assign(this, init);
    }
}
export class FolderNode extends Node {
    constructor(init) {
        super(init);
        this.type = NodeType.folder;
        Object.assign(this, init);
    }
}
export class DirectoryNode extends Node {
    constructor(init) {
        super(init);
        this.type = NodeType.folder;
        Object.assign(this, init);
    }
}
export class FileNode extends Node {
    constructor(init) {
        super(init);
        this.type = NodeType.file;
        Object.assign(this, init);
    }
}
export class MethodNode extends Node {
    constructor(init) {
        super(init);
        this.type = NodeType.method;
        Object.assign(this, init);
    }
}
//# sourceMappingURL=node.js.map