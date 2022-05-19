// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how a method node can be executed in a script.
// 
// Note that consuming the output of an execution might not belong to the own call and only works
// correct if not someone else calls the method at the same time, as then it could happen that 
// the output arguments are already set to different values (for the other method call). This
// behavior is expected to be improved in a future Codabix version, so that then
// the output argument values can be read reliably.
// 
runtime.handleAsync(async function () {
    // Find the method node.
    let methodNode = codabix.findNode("/Nodes/MyMethod", true);

    // Find the method argument nodes.
    let inputArgument1 = methodNode.findNode("IN/MyInput1", true);
    let outputArgument1 = methodNode.findNode("OUT/MyOutput1", true);

    // Before calling the method node, set the input argument.
    await codabix.writeNodeValueAsync(inputArgument1, "some value");

    try {
        await codabix.executeNodeCommandsAsync(methodNode);

        // Retrieve the output argument value.
        let outputArgumentValue = outputArgument1.value?.value;

        logger.log("Method call output argument value: " + outputArgumentValue);
    }
    catch (e) {
        logger.log("Could not call method node: " + e);
    }
}());
