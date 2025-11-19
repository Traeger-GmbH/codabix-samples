// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to create nodes in a script.
// 
runtime.handleAsync(async function () {
    let parentNode = codabix.findNode("/Nodes/MyParent", true);
    let nodeNames = [ "first", "second" ];

    for (let i = 0; i < nodeNames.length; i++) {
        codabix.createNode({
                name: nodeNames[i],
                parentIdentifier: parentNode.identifier,
                class: codabix.NodeClassEnum.Value,
                valueType: codabix.Types.int32
        });
    }
}());
