// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how create nodes in a script.
// 
runtime.handleAsync(async function () {
    let parentNode = codabix.findNode("/Nodes/MyParent", true);
    let nodeNames = [ "first", "second" ];

    for (let i = 0; i < nodeNames.length; i++) {
        let inputArgumentNode = codabix.createNode({
                name: nodeNames[i],
                parentIdentifier: parentNode.identifier,
                type: codabix.NodeTypeEnum.Value,
                valueType: codabix.Types.int32
        });
    }
}());
