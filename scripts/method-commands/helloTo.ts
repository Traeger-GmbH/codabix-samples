// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// # Requirements
// The following method command expects a method node in path "/Nodes/HelloTo".
// This method requires an input argument 'Username' of the 'Value Type' equals 'String'.
// 
// # Task
// Prints a log entry with the content "Hello {Username}!".
// 
runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/HelloTo", true);

    methodNode.registerCommand({
        executeAsync(context: codabix.NodeCommandContext): Promise<void> {
            logger.log(`Hello '${context.inputArguments[0].value}'!`);
            return Promise.resolve();
        }
    });
}());
