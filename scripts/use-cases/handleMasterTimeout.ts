// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet provides a simple method which can be used to monitor and react to a
// timeout which relates to expected/required/continious method calls from some "master" instance.
// 
runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/MyMethod", true);

    methodNode.registerCommand({
        executeAsync(context: codabix.NodeCommandContext) : Promise<void>
        {
            resetTimer();

            // TODO: Implement method.
            return Promise.resolve();
        }
    });

    function handleMasterTimeout()
    {
        // TODO: Implement operations to perform "master lost" tasks.
    }

    let timerHandle : number | null = null;

    function resetTimer()
    {
        if (timerHandle != null) {
            // Reset timer, because the "master" did execute some task.
            timer.clearTimeout(timerHandle);
        }

        timerHandle = timer.setTimeout(handleMasterTimeout, 5000 /* ms */);
    }

    // Start initial timer.
    resetTimer();
}());
