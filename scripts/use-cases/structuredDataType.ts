// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to create a node using a new (custom-defined) structured data type.
// To do so the sample first creates a structured type that is nested in another structured type,
// then creates a new node using the type, and writes a value to the node.
runtime.handleAsync(async function () {
    
    // Create a (nested) structured data type.
    let innerTypeFields = [
        new codabix.TypeField("Name", "Name", "", codabix.Types.string),
        new codabix.TypeField("IsEnabled", "IsEnabled", "", codabix.Types.boolean)
    ]
 
    // Create it as 1-dimensional array type.
    let innerArrayType = new codabix.Type("My Setup Type", "My Setup Type", "", "", codabix.TypeCodeEnum.Object, innerTypeFields, null, [null]);
 
    // Create the outer structured type.
    let typeFields = [
        new codabix.TypeField("JobName", "JobName", "", codabix.Types.string),
        new codabix.TypeField("CuttingPositions", "CuttingPositions", "", codabix.Types.int32Array),
        new codabix.TypeField("Configs", "Configs", "", innerArrayType),
    ];
 
    // Create it as scalar type.
    let myDataType = new codabix.Type("My Structured Type A", "My Structured Type A", "", "", codabix.TypeCodeEnum.Object, typeFields);
 
    // Create a node with that type, and write a value.
    let newNode = codabix.createNode({
        name: "My ValueNode 1",
        parentIdentifier: codabix.findNode("/Nodes", true).identifier,
        class: codabix.NodeClassEnum.Value,
        valueType: myDataType
    });
 
    let configs: codabix.Object[] = [];
    let config = new codabix.Object(innerArrayType);
    config.setFieldValue("Name", "My Config A");
    config.setFieldValue("IsEnabled", true);
    configs.push(config);
 
    config = new codabix.Object(innerArrayType);
    config.setFieldValue("Name", "My Config B");
    config.setFieldValue("IsEnabled", false);
    configs.push(config);
 
    let value = new codabix.Object(myDataType);
    value.setFieldValue("JobName", "Hello World");
    value.setFieldValue("CuttingPositions", [1, 55, 30]);
    value.setFieldValue("Configs", configs);    
 
    await codabix.writeNodeValueAsync(newNode, value);
    
} ());
