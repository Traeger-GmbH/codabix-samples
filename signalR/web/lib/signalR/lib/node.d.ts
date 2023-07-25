import { NodeValue, ValueType } from "./node-value.js";
export declare type NodeId = string;
export declare type NodeQueryIdentifier = string;
export declare enum NodeType {
    folder = "folder",
    value = "value",
    file = "file",
    method = "method",
    directory = "directory"
}
export declare enum Type {
    int16 = "int16",
    int32 = "int32",
    int64 = "int64",
    object = "object"
}
export declare enum HistoryOptions {
    inactive = "inactive",
    active = "active",
    valueChange = "valueChange",
    subscription = "subscription"
}
export declare type PathValue = any;
export interface INode {
    name: string;
    parentId: NodeQueryIdentifier | null;
    displayName?: string | null;
    description?: string | null;
    maxValueAge?: number | null;
    pathType?: Type;
    path?: PathValue | null;
}
export interface IValueNode extends INode {
    valueType: ValueType;
    value?: NodeValue;
    location?: string | null;
    historyOptions?: string | null;
    historyInterval?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    hysteresis?: number | null;
    scalingFactor?: number | null;
    scalingOffset?: number | null;
    unit?: string | null;
    format?: string | null;
}
export declare class Node implements INode {
    name: string;
    parentId: NodeQueryIdentifier | null;
    type: NodeType;
    displayName?: string;
    description?: string;
    maxValueAge?: number;
    pathType?: Type;
    path?: PathValue | null;
    constructor(init?: INode);
}
export declare class ValueNode extends Node implements IValueNode {
    type: NodeType;
    valueType: ValueType;
    value?: NodeValue;
    location?: string | null;
    historyOptions?: string | null;
    historyInterval?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    hysteresis?: number | null;
    scalingFactor?: number | null;
    scalingOffset?: number | null;
    unit?: string | null;
    format?: string | null;
    constructor(init?: IValueNode);
}
export declare class FolderNode extends Node {
    type: NodeType;
    constructor(init?: INode);
}
export declare class DirectoryNode extends Node {
    type: NodeType;
    constructor(init?: INode);
}
export declare class FileNode extends Node {
    type: NodeType;
    constructor(init?: INode);
}
export declare class MethodNode extends Node {
    type: NodeType;
    constructor(init?: INode);
}
