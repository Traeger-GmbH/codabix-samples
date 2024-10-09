// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to register a node reader for a specific node,
// which writes the current date into the node every time it is read.
// This can be used for the CSV Exchange Plugin (by specifying the node path in a Node Query
// Expression in the FileName setting, e.g.
// "%CodabixProjectDir%/userdata/${/Nodes/CSV-Test/Filename}.csv").
// 
runtime.handleAsync(async function () {

    let fileNameNode = codabix.findNode("/Nodes/CSV-Test/Filename", true);

    fileNameNode.registerReader({
        readValuesAsync() {
            // Use local time for the timestamp.
            let fileTimeStamp = runtime.date.format(Date.now(), "yyyy-MM-dd", true, false);

            // Write the value into the node.
            let value = new codabix.NodeValue(fileTimeStamp);
            void codabix.writeNodeValueAsync(fileNameNode, value);
            return Promise.resolve();
        }
    });

}());
