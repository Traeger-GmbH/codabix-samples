import { Type } from "./node.js";
export declare enum NodeValueStatusCode {
    good = "good",
    bad = "bad"
}
export declare enum NodeValueCategory {
    good = "good",
    bad = "bad"
}
export interface INodeValueStatus {
    statusCode: NodeValueStatusCode;
    statusText?: string;
}
export interface IValueType {
    type: Type;
    isArray?: boolean;
}
export declare type ValueType = IValueType | Type;
export interface INodeValue {
    value: any;
    timestamp?: Date;
    category?: string;
    status?: INodeValueStatus;
    valueType?: IValueType;
}
export declare type NodeValue = null | INodeValue;
