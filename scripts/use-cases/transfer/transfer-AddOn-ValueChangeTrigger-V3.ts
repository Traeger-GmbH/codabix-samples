// Script uses the ValueChangeListener on a specified node, and when its value changes, writes
// False and then True to a specified boolean trigger (for a Transfer).

runtime.handleAsync(async function () {

    // -- Declarations --

    let instances: {
        nodesToWatch: codabix.Node[];
        boolNode: codabix.Node;
    }[] = [
            {
                nodesToWatch: [
                    codabix.findNode("/Nodes/A", true),
                    codabix.findNode("/Nodes/B", true)
                ],
                boolNode: codabix.findNode("/Nodes/Transfers/XYZ/Triggers/Script-Trigger", true)
            }
        ];

    // -- Script Logic --

    let instancesNodeValueChanged = new Array<boolean>(instances.length);

    for (let index = 0; index < instances.length; index++) {
        let { nodesToWatch } = instances[index];

        // Subscribe the nodes.
        codabix.subscribeNodes(nodesToWatch);

        // Add a value change event listeners.
        for (let node of nodesToWatch) {
            node.addValueChangedEventListener(e => {
                if (e.isValueChanged && e.newValue && !e.newValue.status.isBad)
                    instancesNodeValueChanged[index] = true;
            }, false);
        }
    }

    // Add a NodeChangeCompleted listener that, when previously one of the value
    // change listeners was called, writes False (and then True) to the boolean node, in order
    // to raise a Boolean trigger for a Transfer.
    codabix.addNodeChangeCompletedEventListener(e => {
        for (let index = 0; index < instancesNodeValueChanged.length; index++) {
            if (instancesNodeValueChanged[index]) {
                instancesNodeValueChanged[index] = false;

                codabix.scheduleCallback(() => {
                    void codabix.writeNodeValuesAsync([
                        {
                            node: instances[index].boolNode,
                            value: false
                        },
                        {
                            node: instances[index].boolNode,
                            value: true
                        }
                    ]);
                })
            }
        }
    });

}());