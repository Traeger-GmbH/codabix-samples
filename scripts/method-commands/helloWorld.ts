// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// # Requirements
// The following method command expects a method node in path "/Nodes/HelloWorld".
// 
// # Task
// Prints a log entry with the content "Hello World!".
// 
// # Notes
// This method does not consume/require any input/output arguments to be defined.
// 
runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/HelloWorld", true);

    methodNode.registerCommand({
        executeAsync(context: codabix.NodeCommandContext): Promise<void> {
            logger.log(`Hello World!`);
            return Promise.resolve();
        }
    });
}());
