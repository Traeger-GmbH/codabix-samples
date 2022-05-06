// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// # Requirements
// The following method command expects a method node in path "/Nodes/MyMethod".
// 
// # Notes
// This sample demonstrates how a method node is being implemented in a custom script.
// The following approach uses a function defined in an object instance.
// 
class MyMethodCommand implements codabix.NodeCommand {
    constructor() {
    }

    executeAsync(context: codabix.NodeCommandContext): Promise<void> {
        // TODO: Implement method.
        return Promise.resolve();
    }
}

runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/MyMethod", true);
    methodNode.registerCommand(new MyMethodCommand());
}());
