import { INodeValue } from "./node-value.js";
import { NodeId } from "./node.js";
export interface INodeChildrenChanges {
    node: NodeId;
    added: Array<NodeId>;
    removed: Array<NodeId>;
}
export interface INodePropertyChanges {
    node: NodeId;
    property: string;
    oldValue: any;
    newValue: any;
}
export interface INodeValueChanges {
    node: NodeId;
    oldValue: INodeValue;
    newValue: INodeValue;
    isValueChanged: boolean;
}
