// Script which adds context menu entries to folder nodes for (recursively)
// enabling and disabling history values for all child nodes.

runtime.handleAsync(async function () {

    function getAction(enable: boolean): (node: codabix.Node) => Promise<codabix.nodeconfiguration.ContextMenuVoidResult> {
        return node => {
            let updateStructore: codabix.NodeStructure = {
                // The following flags will set "History Options" to "Yes, only on value change" in the UI.
                // To use "Yes" instead, remove the flag "codabix.NodeHistoryOptions.ValueChange".
                historyOptions: enable ? codabix.NodeHistoryOptions.Subscription | codabix.NodeHistoryOptions.ValueChange : 0,
            };

            // // Uncomment this if you want to set the history interval e.g. to 500 ms.
            // if (enable)
            //     updateStructore.historyInterval = 500;

            // // Uncomment this if you want to set the max history age and value count
            // // (so that older values are automatically deleted by the History Garbage Collector).
            // if (enable) {
            //     updateStructore.maxHistoryAge = 24 * 60 * 60 * 1000; // 24 hours
            //     updateStructore.maxHistoryValues = 10000; // Max. 10000 values per node
            // }

            let updateCounter = 0;
            let startDate = Date.now();

            function updateChildren(node: codabix.Node) {
                let children = node.children;
                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    codabix.updateNode(child, updateStructore);
                    updateChildren(child);
                    updateCounter++;
                }
            }

            updateChildren(node);

            logger.log("Enabled history values for " + updateCounter + " nodes in " + (Date.now() - startDate) + " ms.");

            return Promise.resolve({
                type: "void"
            });
        };
    }

    let action: codabix.nodeconfiguration.ContextMenuAction = {
        displayName: "Enable History Values",
        inheritanceFilter: codabix.nodeconfiguration.ContextMenuActionInheritanceFilter.FolderLikeNodes,
        handleActionAsync: getAction(true)
    };

    codabix.nodeconfiguration.registerNodeContextMenuAction(codabix.findNode("/Nodes")!, action);
    codabix.nodeconfiguration.registerNodeContextMenuAction(codabix.findNode("/System")!, action);

    action = {
        displayName: "Disable History Values",
        inheritanceFilter: codabix.nodeconfiguration.ContextMenuActionInheritanceFilter.FolderLikeNodes,
        handleActionAsync: getAction(false)
    };

    codabix.nodeconfiguration.registerNodeContextMenuAction(codabix.findNode("/Nodes")!, action);
    codabix.nodeconfiguration.registerNodeContextMenuAction(codabix.findNode("/System")!, action);

}());