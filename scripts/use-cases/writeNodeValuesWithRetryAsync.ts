// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet provides a simple method which can be used to write the node values of
// multiple nodes. Only if every node could be written successfully the method returns; otherwise
// the write operation is repeated for an infinite number of times using a delay of 1000 ms - until
// every node could be written successfully.
// 
async function writeNodeValuesWithRetryAsync(nodeValues: {
    node: codabix.Node,
    value: codabix.NodeValue | codabix.NodeValueType
}[]) {
    while (true) {
        let results = await codabix.writeNodeValuesAsync(nodeValues);

        // Check if we could write the values.
        let success = true;

        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            if (!result || result.isBad) {
                logger.logWarning(`Could not write values (first failed node '${nodeValues[i].node}'): '${result && result.statusText || "Error"}'. Trying again in ${1000} ms...`);
                success = false;
                break;
            }
        }

        if (!success) {
            await timer.delayAsync(1000);
            continue;
        }

        // OK, we could write the values.
        return;
    }
}

// Possible usage
runtime.handleAsync(async function () {
    let node1 = codabix.findNode("/Nodes/A", true);
    let node2 = codabix.findNode("/Nodes/B", true);
    let node3 = codabix.findNode("/Nodes/C", true);

    await writeNodeValuesWithRetryAsync([
        {
            node: node1,
            value: 1
        },
        {
            node: node2,
            value: 2
        },
        {
            node: node3,
            value: 3
        }
    ]);
}());
