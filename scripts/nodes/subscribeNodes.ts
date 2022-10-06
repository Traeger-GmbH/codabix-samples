// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to subscribe nodes in a script.
// 
runtime.handleAsync(async function () {
    let nodeA = codabix.findNode("/Nodes/A", true);
    let nodeB = codabix.findNode("/Nodes/B", true);

    // Subscribe the two nodes using an interval of 200 ms.
    // This will instruct the registered NodeReader to monitor the value source for changes.
    // For example, if the node is an S7 Variable, the S7 Device Plugin will read the variable
    // in the specified interval, and if a change is detected, write the new value into the variable.
    let interval = 200;

    // ForceUpdate specifies (for plugins that use polling) whether every read value should be
    // written into the node, even if the new value is the same as the previous one.
    let forceUpdate = false;

    // Create the subscription. Note: To actually process the values delivered by the subscription
    // here, we would need to add a ValueChanged EventListener to the nodes.
    let subscription = codabix.subscribeNodes([nodeA, nodeB], interval, forceUpdate);
    logger.log(`Subscription created. Interval=${subscription.interval}, ForceUpdate=${subscription.forceUpdate}`);

    // To later remove the subscription, use the unsubscribe method. Also, if the script is
    // forced to stop (e.g. when disabling it), all subscriptions it has created are
    // automatically stopped.
    await timer.delayAsync(60 * 1000);
    codabix.unsubscribeNodes(subscription);
    logger.log("Subscription stopped.");
}());