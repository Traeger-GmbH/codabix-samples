runtime.handleAsync(async function () {
    interface NodeChildrenChangedEventArg {
        added: readonly codabix.Node[];
        removed: readonly codabix.Node[];
    }

    interface NodeValueChangedEventArg {
        readonly oldValue: codabix.NodeValue | null;
        readonly newValue: codabix.NodeValue | null;
    }

    enum TriggerType {
        FallingEdge,
        RisingEdge,
        Toggle,
        Interval,
        NotSupported
    }

    function addChildNodeIfNotExist(parent: codabix.Node, name: string, nodeType: codabix.NodeTypeEnum, valueType: codabix.TypeCodeEnum | null): void {
        if (nodeType == codabix.NodeTypeEnum.Value && valueType == null) {
            throw "Creating a value node requires a value type to be set.";
        }
        if (!parent.children.some(node => node.name == name)) {
            if (nodeType == codabix.NodeTypeEnum.Value) {
                codabix.createNode({ name: name, type: nodeType, parentIdentifier: parent.identifier, valueType: codabix.Type.getType(valueType!) });
            }
            else {
                codabix.createNode({ name: name, type: nodeType, parentIdentifier: parent.identifier });
            }
        }
    }

    function addPropertyNodes(transferNode: codabix.Node, properties: Array<{ name: string, nodeType: codabix.NodeTypeEnum, valueType: codabix.TypeCodeEnum | null }>): void {
        properties.forEach(property => addChildNodeIfNotExist(transferNode, property.name, property.nodeType, property.valueType));
    }

    function getTriggerTypeFromValueType(valueType: codabix.Type, nodeLocation: string): TriggerType {
        let result = TriggerType.NotSupported;
        if (!valueType.isArray) {
            if (String(nodeLocation).toLowerCase() === 'toggle') {
                switch (valueType.typeCode) {
                    case codabix.TypeCodeEnum.Boolean:
                        result = TriggerType.Toggle;
                        break;
                }
            }
            else if (String(nodeLocation).toLowerCase() === 'fallingedge') {
                switch (valueType.typeCode) {
                    case codabix.TypeCodeEnum.Boolean:
                        result = TriggerType.FallingEdge;
                        break;
                }
            }
            else {
                switch (valueType.typeCode) {
                    case codabix.TypeCodeEnum.Boolean:
                        result = TriggerType.RisingEdge;
                        break;
                    case codabix.TypeCodeEnum.UInt16:
                    case codabix.TypeCodeEnum.UInt32:
                    case codabix.TypeCodeEnum.UInt64:
                    case codabix.TypeCodeEnum.Int16:
                    case codabix.TypeCodeEnum.Int32:
                    case codabix.TypeCodeEnum.Int64:
                    case codabix.TypeCodeEnum.Double:
                    case codabix.TypeCodeEnum.Single:
                        result = TriggerType.Interval;
                }
            }
        }
        return result;
    }

    class Timer {
        constructor(callback: (this: void) => void, interval: number) {
            this._callback = callback;
            if (interval < 50) {
                logger.logWarning("Timer intervals smaller than 50ms, in this case " + interval + "ms, are not allowed. Using minimum value of 50ms instead.");
                interval = 50;
            }
            this._interval = interval;
        }
        private _interval: number;
        private _callback: (this: void) => void;
        private _timerId: number | null = null;

        public start(): void {
            if (this._timerId == null) {
                logger.logDebug("Start timer.");
                this._timerId = timer.setTimeout(this._callback, this._interval);
            }
        }

        public stop(): void {
            if (this._timerId != null) {
                logger.logDebug("Stop timer.");
                timer.clearTimeout(this._timerId);
                this._timerId = null;
            }
        }

        public reset(): void {
            logger.logDebug("Reset timer.");
            this.stop();
            this.start();
        }

        public set interval(value: number) {
            if (value < 50) {
                logger.logWarning("Timer intervals smaller than 50ms, in this case " + value + "ms, are not allowed. Using minimum value of 50ms instead.");
                value = 50;
            }
            this._interval = value;
            this.reset();
        }
        public get interval(): number {
            return this._interval;
        }
    }

    class Trigger {
        constructor(node: codabix.Node, callback: (trigger: Trigger) => void) {
            this._node = node;
            this._callback = callback;
            if (!(this._callback != null)) {
                logger.logError("Passed callback is not defined.");
            }
            if (this.type == TriggerType.Interval) {
                this._timer = new Timer(this._pullTrigger, this.defaultInterval);
            }
            logger.log("Created new trigger '" + node.name + "' of type '" + TriggerType[this.type] + "'.");
        }

        private readonly defaultInterval = 500;
        private _node: codabix.Node;
        private _timer: Timer | null = null;
        private _callback: (trigger: Trigger) => void;

        private get logPrefix(): string {
            return "Trigger '" + this.name + "': ";
        }

        private logDebug(message: string): void {
            logger.logDebug(this.logPrefix + message);
        }

        private logInfo(message: string): void {
            logger.logInfo(this.logPrefix + message);
        }

        private logError(message: string): void {
            logger.logError(this.logPrefix + message);
        }

        private logWarning(message: string): void {
            logger.logWarning(this.logPrefix + message);
        }

        private get value(): codabix.NodeValueType {
            if (this._node.value != null) {
                return this._node.value!.value;
            }
            else {
                return this.defaultInterval;
            }
        }

        private _pullTrigger = (): void => {
            this.logDebug("Pull trigger.");
            if (this._callback != null) {
                this._callback.call(this, this);
            }
            else {
                this.logError("Trigger callback is not defined.");
            }
        };

        private _handleValueChange = (e: NodeValueChangedEventArg): void => {
            this.logDebug("handleValueChange()");
            if (this.type == TriggerType.RisingEdge ||
                this.type == TriggerType.FallingEdge ||
                this.type == TriggerType.Toggle) {
                if (e.oldValue != null && e.newValue != null) {
                    let oldValue = e.oldValue.value as boolean;
                    let newValue = e.newValue.value as boolean;

                    if (this.type == TriggerType.RisingEdge && !oldValue && newValue ||
                        this.type == TriggerType.FallingEdge && oldValue && !newValue ||
                        this.type == TriggerType.Toggle && oldValue != newValue) {
                        this._pullTrigger();
                    }
                }
            }
            else if (this.type == TriggerType.Interval) {
                if (e.newValue != null) {
                    let newInterval = e.newValue.value as number;
                    this.logDebug("Set new trigger interval: " + newInterval);
                    this._timer!.interval = newInterval;
                }
                else {
                    this.logError("Cannot set new trigger interval as the value is of type 'null'.");
                }
            }
        };

        private get valueType(): codabix.Type {
            return this._node.valueType!;
        }

        private get location(): string {
            return this._node.location!;
        }

        public resetTrigger(): void {
            if (this.type == TriggerType.RisingEdge) {
                logger.logDebug("Reset trigger '" + this.node.name + "'.");
                codabix.writeNodeValueAsync(this._node, false);
            }
            else if (this.type == TriggerType.Interval) {
                logger.logDebug("Restart timer for interval trigger '" + this.node.name + "'.");
                this._timer!.reset();
            }
        }

        public start(): void {
            logger.logDebug("Start trigger '" + this.node.name + "'.");
            this._node.addValueChangedEventListener(this._handleValueChange);
            if (this.type == TriggerType.Interval) {
                this._timer!.interval = this.value as number;
                this._timer!.start();
            }
            else if (this.type == TriggerType.RisingEdge) {
                if (this.node.value != null && this.node.value.value as boolean == true) {
                    this._pullTrigger();
                }
            }
        }

        public stop(): void {
            logger.logDebug("Stop trigger " + this.node.name + "'.");
            this._node.removeValueChangedEventListener(this._handleValueChange);
            if (this.type == TriggerType.Interval) {
                this._timer!.stop();
            }
        }

        public get name(): string {
            return this._node.name;
        }

        public get node(): codabix.Node {
            return this._node;
        }

        public get type(): TriggerType {
            return getTriggerTypeFromValueType(this.valueType, this.location);
        }
    }

    type TriggerCallback = (acknowledge: (this: void) => void) => void;

    class TriggerCollection {
        constructor(node: codabix.Node, callback: TriggerCallback) {
            this._node = node;
            this._pullTrigger = callback;
            this.initializeItems();
            this._node.addChildrenChangedEventListener(this.handleChildrenChange);
        }

        private initializeItems(): void {
            this._node.children.forEach((child) => {
                if (child.type == codabix.NodeTypeEnum.Value) {
                    let trigger = new Trigger(child, this.handleTriggerEvent);
                    this._items.push(trigger);
                }
            });
        }

        private _pullTrigger: TriggerCallback;
        private isActive: boolean = false;

        private handleChildrenChange = (e: NodeChildrenChangedEventArg): void => {
            e.added.forEach(node => {
                this.addTriggerNode(node);
            })
            e.removed.forEach(node => {
                this.removeTriggerNode(node);
            })
        }

        private handleTriggerEvent = (source: Trigger): void => {
            logger.logDebug("TriggerCollection: handleTriggerEvent()");
            this._pullTrigger(() => {
                source.resetTrigger();
            });
        }

        private addTriggerNode(triggerNode: codabix.Node) {
            let trigger = new Trigger(triggerNode, this.handleTriggerEvent);
            logger.logDebug("Add new trigger node '" + triggerNode.name + "'.");
            this._items.push(trigger);
            if (this.isActive) {
                trigger.start();
            }
        }

        private removeTriggerNode(triggerNode: codabix.Node) {
            let filteredList = this._items.filter(item => item.node == triggerNode);
            if (filteredList.length > 0) {
                let trigger = filteredList[0];
                let index = this._items.indexOf(trigger);
                if (index >= 0) {
                    logger.logDebug("Remove trigger node '" + triggerNode.name + "'.");
                    let trigger = this._items[index];
                    trigger.stop();
                    this._items.splice(index, 1);
                }
            }
        }

        private _node: codabix.Node;
        private _items: Array<Trigger> = new Array<Trigger>();

        public activate(): void {
            if (!this.isActive) {
                logger.logDebug("Activate trigger collection.");
                this._items.forEach((trigger) => trigger.start());
                this.isActive = true;
            }
        }

        public deactivate(): void {
            if (this.isActive) {
                logger.logDebug("Deactivate trigger collection.");
                this._items.forEach((trigger) => trigger.stop());
                this.isActive = false;
            }
        }

        public dispose(): void {
            logger.logDebug("Dispose trigger collection.");
            this.deactivate();
            this._items = new Array<Trigger>();
        }
    }

    function normalizeArray<T>(array: Array<T>, indexKey: keyof T): { [key: string]: T } {
        const normalizedObject: any = {}
        for (let i = 0; i < array.length; i++) {
            const key = array[i][indexKey]
            normalizedObject[key] = array[i]
        }
        return normalizedObject as { [key: string]: T }
    }

    class Transfer {
        constructor(node: codabix.Node) {
            this._node = node;
            this.initTransfer();
            this.triggerCollection = new TriggerCollection(
                this._children.Triggers, this.handleTriggerEvent);
            this._children.isActive.addValueChangedEventListener(this.handleIsActivePropertyChange);
            if (this.isActive) {
                this.activate();
            }
        }

        public static propertyList: Array<{ name: string, nodeType: codabix.NodeTypeEnum, valueType: codabix.TypeCodeEnum | null, defaultValue: codabix.NodeValueType }> = [
            { name: "Inputs", nodeType: codabix.NodeTypeEnum.Folder, valueType: null, defaultValue: null },
            { name: "Outputs", nodeType: codabix.NodeTypeEnum.Folder, valueType: null, defaultValue: null },
            { name: "Triggers", nodeType: codabix.NodeTypeEnum.Folder, valueType: null, defaultValue: null },
            { name: "isActive", nodeType: codabix.NodeTypeEnum.Value, valueType: codabix.TypeCodeEnum.Boolean, defaultValue: false },
        ];

        private static collectChildrenRecursively(node: codabix.Node): codabix.Node[] {
            let collectedChildren: codabix.Node[] = [];

            for (let child of node.children) {
                if (child.type == codabix.NodeTypeEnum.Folder) {
                    // Recursively collect the child nodes of the folder.
                    collectedChildren = collectedChildren.concat(
                        Transfer.collectChildrenRecursively(child));
                }
                else {
                    collectedChildren.push(child);
                }
            }

            return collectedChildren;
        }        

        private handleIsActivePropertyChange: codabix.NodeValueChangedEventListener = (e: NodeValueChangedEventArg): void => {
            if (e.oldValue == null || e.oldValue.value as boolean == false) {
                if (e.newValue != null && e.newValue.value as boolean == true) {
                    this.activate();
                }
            }
            else {
                if (e.newValue == null || e.newValue.value as boolean == false) {
                    this.deactivate();
                }
            }
        }

        private _node: codabix.Node;
        private triggerCollection: TriggerCollection;

        private initTransfer(): void {
            addPropertyNodes(this._node, Transfer.propertyList);
            let writeDefaultPairs = new Array<{ node: codabix.Node, value: codabix.NodeValueType }>();
            Transfer.propertyList.forEach(property => {
                let instanceProperty = this._children[property.name];
                if (property.defaultValue != null && instanceProperty.value == null) {
                    writeDefaultPairs.push({ node: instanceProperty, value: property.defaultValue });
                }
            });
            if (writeDefaultPairs.length >= 1) {
                codabix.writeNodeValuesAsync(writeDefaultPairs);
            }
        }

        private get _children(): { [key: string]: codabix.Node } {
            // we have to create this for every call to get the current array of children nodes
            return normalizeArray(this._node.children, "name");
        }

        private get isActive(): boolean {
            return this._children.isActive.value!.value as boolean;
        }

        private get inputs(): Array<codabix.Node> {
            // Recursively collect the non-folder nodes.
            return Transfer.collectChildrenRecursively(this._children.Inputs);
        }

        private get outputs(): Array<codabix.Node> {
            // Recursively collect the non-folder nodes.
            return Transfer.collectChildrenRecursively(this._children.Outputs);
        }

        private handleTriggerEvent = (acknowlede: (this: void) => void): void => {
            codabix.scheduleCallback(() => {
                runtime.handleAsync(this.execute(acknowlede));
            });
        };

        private async execute(acknowlede: (this: void) => void): Promise<void> {
            if (this.isActive) {
                logger.logInfo("Executing transfer '" + this.name + "'...");
                let inputs = this.inputs;
                let outputs = this.outputs;

                if (inputs.length != outputs.length) {
                    logger.logWarning("The number of inputs does not match the number of outputs: " + inputs.length + " input nodes, " + outputs.length + " output nodes");
                }

                let nodeListString = "";
                inputs.forEach((node, index) => {
                    nodeListString = nodeListString.concat("'" + node.name + "'");
                    if (index < inputs.length - 1) {
                        nodeListString = nodeListString.concat(", ");
                    }
                })
                logger.logInfo("Reading values of input nodes (" + nodeListString + ")...");
                let inputValues = await codabix.readNodeValuesAsync(inputs);

                logger.logInfo("Acknowledge trigger...");
                acknowlede();

                let outputValuePairs = new Array<{ node: codabix.Node, value: codabix.NodeValueType }>();

                let length = Math.min(inputs.length, outputs.length);
                for (let i = 0; i < length; i++) {
                    let value = inputValues[i];
                    if (value != null) {
                        if (value.status.isBad) {
                            let errorMessage = "Could not read value of node '" + inputs[i] + "'.";
                            if (value.status.statusText != null) {
                                errorMessage = errorMessage.concat(" Status text: " + value.status.statusText);
                            }
                            logger.logError(errorMessage);
                            logger.logError("Aborting transfer...");
                            return;
                        }
                        outputValuePairs.push({ node: outputs[i], value: value.value });
                    }
                    else {
                        logger.logError("Could not read value of node '" + inputs[i] + "': value = null.");
                        logger.logError("Aborting transfer...");
                        return;
                    }
                }

                nodeListString = "";
                outputs.forEach((node, index) => {
                    nodeListString = nodeListString.concat("'" + node.name + "'");
                    if (index < inputs.length - 1) {
                        nodeListString = nodeListString.concat(", ");
                    }
                })
                logger.logInfo("Writing values to output nodes (" + nodeListString + ")...");
                let writeStatusList = await codabix.writeNodeValuesAsync(outputValuePairs);

                let isSuccess = !writeStatusList.some((status) => {
                    if (status != null) {
                        if (status.isBad) {
                            return true;
                        }
                    }
                    return false;
                });

                if (isSuccess) {
                    logger.logInfo("Successfully finished transfer '" + this.name + "'.");
                }
                else {
                    logger.logError("One or more errors occurred during writing the values:");
                    writeStatusList.forEach((status, index) => {
                        if (status != null) {
                            if (status.isBad) {
                                let valueNodePair = outputValuePairs[index];
                                let errorMessage = "Could not write value '" + valueNodePair.value + "' to node '" + valueNodePair.node.name + "'.";
                                if (status.statusText != null) {
                                    errorMessage = errorMessage.concat(" Status text: " + status.statusText);
                                }
                                logger.logError(errorMessage);
                            }
                        }
                    })
                }
            }
        }

        public get node(): codabix.Node {
            return this._node;
        }

        public get name(): string {
            return this._node.name;
        }

        private activate(): void {
            logger.logInfo("Activate transfer '" + this.name + "'.");
            this.triggerCollection.activate();
        }

        private deactivate(): void {
            logger.logInfo("Deactivate transfer '" + this.name + "'.");
            this.triggerCollection.deactivate();
        }

        public dispose(): void {
            logger.logInfo("Dispose transfer '" + this.name + "'.");
            this.deactivate();
            const isActiveNode = this._children.isActive;
            if (isActiveNode) {
                isActiveNode.removeValueChangedEventListener(this.handleIsActivePropertyChange);
            }
            this.triggerCollection.dispose();
        }
    }

    const transfersRootNodePath = "/Nodes/Transfers/";
    const transfersRootNode = codabix.findNode(transfersRootNodePath, true);
    let transferList = new Array<Transfer>();

    // register a new context menu action for adding a new Transfer
    codabix.nodeconfiguration.registerNodeContextMenuAction(transfersRootNode,
        {
            displayName: "Add new Transfer",
            handleActionAsync: (node: codabix.Node): Promise<codabix.nodeconfiguration.ContextMenuVoidResult> => {
                return new Promise((resolve) => {
                    const defaultName = "New Transfer";
                    let name = defaultName;

                    let suffix = "";
                    let i = 1;
                    while (node.children.some((node) => node.name == name.concat(" " + suffix))) {
                        suffix = (++i).toString();
                    }

                    name = name.concat(" " + suffix);

                    let transferNodeStructure: codabix.CreateNodeStructure = {
                        name: name,
                        type: codabix.NodeTypeEnum.Folder,
                        parentIdentifier: node.identifier,
                    }

                    let newTransfer = codabix.createNode(transferNodeStructure);

                    addPropertyNodes(newTransfer, Transfer.propertyList);
                    resolve({ type: "void" });
                });
            }
        }
    );

    // handle when a transfer is removed:
    transfersRootNode.addChildrenChangedEventListener((e) => {
        e.removed.forEach(node => {
            let filteredList = transferList.filter(item => item.node == node);
            if (filteredList.length > 0) {
                let transfer = filteredList[0];
                if (transfer != null) {
                    transfer.dispose();
                    let index = transferList.indexOf(transfer);
                    transferList.splice(index, 1);
                    logger.logInfo("Removed transfer '" + transfer.name + "'.");
                }
            }
        })
    })

    // check every 500ms if there is a new Transfer to be added
    while (true) {
        let currentTransferNodes = transfersRootNode.children;
        getNewTransfers(currentTransferNodes);
        await timer.delayAsync(500);
    }

    function getNewTransfers(currentTransferNodes: codabix.Node[]) {
        currentTransferNodes.forEach((node, index) => {
            if (!(typeof node.path == "string" && node.path.toLowerCase() === 'group')) {
                if (!transferList.some((element: Transfer) => element.node == node)) {
                    try {
                        let transfer = new Transfer(node);
                        transferList.push(transfer);
                    }
                    catch (e) {
                        logger.logWarning("Could not add new Transfer '" + node.name + "': " + e);
                    }
                }
            } else {
                getNewTransfers(node.children);
            }
        });
    }

}());
