// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// # Requirements
// The following method command expects a method node in path "/Nodes/HighFive".
// This method requires an output argument 'HighFive' of the 'Value Type' equals 'Int32'.
// 
// # Task
// Calculates the current seconds taken to the power of five as the exponent and returns the result.
// 
runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/HighFive", true);

    methodNode.registerCommand({
        executeAsync(context: codabix.NodeCommandContext): Promise<void> {
            let seconds = new Date().getSeconds();
            context.outputArguments[0].value = Math.pow(seconds, 5);

            return Promise.resolve();
        }
    });
}());
