// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// A script that creates some nodes in the "Demo Nodes" folder and then
// continuously writes random numbers to them. This is the same logic
// that is done by the "Demo Data (Continuous)" plugin (but using a different
// folder name).
// 
interface DemoNodeDescription {
    name: string;
    displayName: string;
    unit?: string;
    hasHistory?: boolean;
    minValue: number;
    maxValue: number;
}

runtime.handleAsync(async function () {

    // The name of the parent folder in which the demo data nodes are created.
    const parentFolderName = "Demo Nodes";

    let demoNodeDescriptions: DemoNodeDescription[] = [
        {
            name: "Temperature",
            displayName: "Temperature (°C)",
            unit: "°C",
            minValue: -20,
            maxValue: 90
        },
        {
            name: "Pressure",
            displayName: "Pressure",
            unit: "bar",
            minValue: 10,
            maxValue: 110
        },
        {
            name: "Gradient",
            displayName: "Gradient",
            hasHistory: true,
            minValue: 0,
            maxValue: 50
        }
    ];

    // Create the parent folder if it doesn't exist.
    let root = codabix.findNode("/Nodes", true);

    let parentNode = root.findNode(parentFolderName);
    if (!parentNode) {
        parentNode = codabix.createNode({
            name: parentFolderName,
            parentIdentifier: root.identifier,
            class: codabix.NodeClassEnum.Folder,
        });
    }

    // Create the demo nodes, if they don't exist.
    let demoNodes: codabix.Node[] = [];

    for (let demoNodeDescription of demoNodeDescriptions) {
        let demoNode = parentNode.findNode(demoNodeDescription.name);
        if (!demoNode) {
            demoNode = codabix.createNode({
                name: demoNodeDescription.name,
                displayName: demoNodeDescription.displayName,
                parentIdentifier: parentNode.identifier,
                class: codabix.NodeClassEnum.Value,
                valueType: codabix.Types.double,
                historyOptions: demoNodeDescription.hasHistory ?
                    codabix.NodeHistoryOptions.Subscription | codabix.NodeHistoryOptions.ValueChange :
                    codabix.NodeHistoryOptions.Inactive
            });
        }

        demoNodes.push(demoNode);
    }

    // Now start background tasks for all nodes that update the values, and wait
    // for a random interval.
    for (let index = 0; index < demoNodes.length; index++) {
        let demoNode = demoNodes[index];
        let nodeDescription = demoNodeDescriptions[index];

        runtime.handleAsync((async () => {
            while (true) {
                // Wait between 500 and 2500 ms.
                let waitInterval = Math.floor(Math.random() * 2000) + 500;
                await timer.delayAsync(waitInterval);

                // Generate a new value. The `maxValue` is used as inclusive value here.
                let newValue = Math.floor(Math.random() * (nodeDescription.maxValue + 1 - nodeDescription.minValue)) + nodeDescription.minValue;
                void codabix.writeNodeValueAsync(demoNode, newValue);
            }
        })());
    }

}());
