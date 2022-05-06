// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet provides a simple method which can be used to read the node values of
// multiple nodes. Only if every node could be read successfully the values are returned; otherwise
// the read operation is repeated for an infinite number of times using a delay of 1000 ms - until
// every node could be read successfully.
// 
async function readNodeValuesWithRetryAsync(nodes: codabix.Node[]) {
    while (true) {
        let results = await codabix.readNodeValuesAsync(nodes);

        // Check if we could read the values.
        let success = true;

        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            if (!result || result.status.isBad) {
                logger.logWarning(`Could not read values (first failed node '${nodes[i]}'): '${result && result.status.statusText || "Error"}'. Trying again in ${1000} ms...`);
                success = false;
                break;
            }
        }

        if (!success) {
            // Wait a bit, then try again.
            await timer.delayAsync(1000);
            continue;
        }

        // OK, we could read the values.
        return results as codabix.NodeValue[];
    }
}

// Possible usage
runtime.handleAsync(async function () {
    let node1 = codabix.findNode("/Nodes/A", true);
    let node2 = codabix.findNode("/Nodes/B", true);
    let node3 = codabix.findNode("/Nodes/C", true);

    let values = await readNodeValuesWithRetryAsync([node1, node2, node3]);
}());
