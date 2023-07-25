import axios from 'axios';
import * as signalR from "@microsoft/signalr";
import adminPrerequisite from './adminPrerequisite.js';
import { WebResponseStatus } from './web-response.js';
import { clientState } from './clientState.js';
const signalrNodesPath = '/api/signalr/nodes';
const authenticatePath = '/api/rest/users/authenticate';
const defaultReconnectDelay = 5000;
let reconnectDelaySnapshot;
export class Client {
    constructor(host) {
        this.delay = defaultReconnectDelay;
        this.host = host;
    }
    async connect(usernameOrToken, password) {
        this.changeState(clientState.Connecting);
        if (password === undefined) {
            this.authToken = usernameOrToken;
        }
        else {
            this.username = usernameOrToken;
            this.password = password;
        }
        if (this.authToken === undefined) {
            let credentials = {
                username: this.username,
                password: this.password
            };
            if (this.username === 'admin') {
                credentials.adminPrerequisite = adminPrerequisite;
            }
            let response;
            try {
                response = await axios.post(this.host + authenticatePath, credentials);
            }
            catch (e) {
                this.changeState(clientState.Disconnected);
                throw new Error('An error occurred during authentication: ' + e);
            }
            if (response.status === 200) {
                this.authToken = response.data.token;
            }
            else {
                this.changeState(clientState.Disconnected);
                throw new Error('An error occurred during authentication: ' + response.data);
            }
        }
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.host + signalrNodesPath, {
            accessTokenFactory: () => this.authToken,
            withCredentials: false
        })
            .build();
        this.connection.onclose(() => {
            this.onClosed();
        });
        reconnectDelaySnapshot = defaultReconnectDelay;
        this.isCancellationRequested = false;
        this.applyConnectionSettings();
        await this.startConnection();
        this.changeState(clientState.Connected);
    }
    async startConnection() {
        try {
            await this.connection.start();
        }
        catch (err) {
            this.changeState(clientState.Disconnected);
            throw new Error('An error occurred during connecting: ' + err);
        }
    }
    async onClosed() {
        if (this.state !== clientState.Disconnecting && reconnectDelaySnapshot > 0) {
            this.changeState(clientState.Reconnecting);
            while (!this.isCancellationRequested) {
                try {
                    await this.connection.start();
                    if (this.isCancellationRequested) {
                        await this.disconnect();
                        return;
                    }
                    this.changeState(clientState.Reconnected);
                    return;
                }
                catch {
                }
                this.wait(reconnectDelaySnapshot);
            }
        }
        this.changeState(clientState.Disconnected);
    }
    async disconnect() {
        this.changeState(clientState.Disconnecting);
        this.isCancellationRequested = true;
        await this.connection.stop();
        this.changeState(clientState.Disconnected);
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async changeState(state) {
        var _a, _b, _c, _d, _e, _f;
        if (state == clientState.Connecting) {
            await ((_a = this.onConnectingHandler) === null || _a === void 0 ? void 0 : _a.call(null));
        }
        else if (state === clientState.Connected) {
            await ((_b = this.onConnectedHandler) === null || _b === void 0 ? void 0 : _b.call(null));
        }
        else if (state === clientState.Disconnecting) {
            await ((_c = this.onDisconnectingHandler) === null || _c === void 0 ? void 0 : _c.call(null));
        }
        else if (state === clientState.Disconnected) {
            await ((_d = this.onDisconnectedHandler) === null || _d === void 0 ? void 0 : _d.call(null));
        }
        else if (state === clientState.Reconnecting) {
            await ((_e = this.onReconnectingHandler) === null || _e === void 0 ? void 0 : _e.call(null));
        }
        else if (state === clientState.Reconnected) {
            await ((_f = this.onReconnectedHandler) === null || _f === void 0 ? void 0 : _f.call(null));
        }
    }
    onConnecting(callback) {
        this.onConnectingHandler = callback;
    }
    onConnected(callback) {
        this.onConnectedHandler = callback;
    }
    onDisconnecting(callback) {
        this.onDisconnectingHandler = callback;
    }
    onDisconnected(callback) {
        this.onDisconnectedHandler = callback;
    }
    onReconnecting(callback) {
        this.onReconnectingHandler = callback;
    }
    onReconnected(callback) {
        this.onReconnectedHandler = callback;
    }
    applyConnectionSettings() {
        reconnectDelaySnapshot = this.reconnectDelay;
    }
    async readNode(id) {
        let request = {
            command: {
                id: id
            }
        };
        let response = await this.connection.invoke('ReadNode', request);
        this.handleError(response);
        return response.result.node;
    }
    async readNodes(ids) {
        let request = {
            commands: ids.map(e => {
                return { id: e };
            })
        };
        let response = await this.connection.invoke('ReadNodes', request);
        this.handleError(response);
        return response.result.map(e => e.node);
    }
    async createNode(node) {
        let request = {
            command: {
                node: node
            }
        };
        let response = await this.connection.invoke('CreateNode', request);
        this.handleError(response);
        return response.result.id;
    }
    async createNodes(nodes) {
        let request = {
            commands: nodes.map(e => {
                return { node: e };
            })
        };
        let response = await this.connection.invoke('CreateNodes', request);
        this.handleError(response);
        return response.result;
    }
    async deleteNode(id) {
        let request = {
            command: {
                id: id
            }
        };
        let response = await this.connection.invoke('DeleteNode', request);
        this.handleError(response);
    }
    async updateNode(id, node) {
        let request = {
            command: {
                id: id,
                node: node
            }
        };
        let response = await this.connection.invoke('UpdateNode', request);
        this.handleError(response);
    }
    async linkNode(id, destinationId) {
        let request = {
            command: {
                id: id,
                destinationId: destinationId
            }
        };
        let response = await this.connection.invoke('LinkNode', request);
        this.handleError(response);
    }
    async readChildNodes(id) {
        let request = {
            command: {
                id: id
            }
        };
        let response = await this.connection.invoke('ReadChildNodes', request);
        this.handleError(response);
        return response.result.nodes;
    }
    subscribeValueChanges(ids, createSubscription, interval, forceUpdate) {
        let request = {
            nodes: ids,
            createSubscription: createSubscription,
            interval: interval,
            forceUpdate: forceUpdate
        };
        return this.connection.stream('SubscribeValueChanges', request);
    }
    subscribePropertyChanges(...ids) {
        let request = {
            nodes: ids
        };
        return this.connection.stream('SubscribePropertyChanges', request);
    }
    subscribeChildrenChanges(...ids) {
        let request = {
            nodes: ids
        };
        return this.connection.stream('SubscribeChildrenChanges', request);
    }
    async writeNodeValue(id, value) {
        if (!value || !value.value) {
            value = {
                value: value
            };
        }
        ;
        let request = {
            command: {
                id: id,
                value: value
            }
        };
        let response = await this.connection.invoke('WriteNodeValue', request);
        this.handleError(response);
        return response.result.status;
    }
    async writeNodeValues(nodeValuePairs) {
        nodeValuePairs.forEach(item => {
            if (!item.value || !item.value.value) {
                item.value = {
                    value: item.value
                };
            }
            ;
        });
        let request = {
            commands: nodeValuePairs.map(e => {
                return {
                    id: e.id,
                    value: e.value
                };
            })
        };
        console.log(JSON.stringify(request));
        let response = await this.connection.invoke('WriteNodeValues', request);
        this.handleError(response);
        return response.result;
    }
    async readNodeValue(id, performRead = false, timeToLive) {
        let request = {
            command: {
                id: id,
                performRead: performRead,
                timeToLive: timeToLive
            }
        };
        let response = await this.connection.invoke('ReadNodeValue', request);
        this.handleError(response);
        return response.result.value;
    }
    async readNodeValueHistory(id, start, end, timeInterval, limit, continuationPoint) {
        let skipFirst = false;
        if (continuationPoint) {
            start = continuationPoint.timestamp;
            skipFirst = true;
        }
        let request = {
            command: {
                id: id,
            },
            start: start,
            end: end,
            timeInterval: timeInterval,
            skipFirst: skipFirst
        };
        if (limit) {
            request.limit = limit;
        }
        let response = await this.connection.invoke('ReadNodeValueHistory', request);
        this.handleError(response);
        let result = {
            values: response.result.values,
            continuationPoint: null
        };
        if (response.nextStart) {
            result.continuationPoint = {
                timestamp: response.nextStart
            };
        }
        else {
            result.continuationPoint = null;
        }
        return result;
    }
    async readNodesValueHistory(ids, start, end, timeInterval, limit, continuationPoint) {
        let skipFirst = false;
        if (continuationPoint) {
            start = continuationPoint.timestamp;
            skipFirst = true;
        }
        let request = {
            commands: ids.map(e => {
                return { id: e };
            }),
            start: start,
            end: end,
            timeInterval: timeInterval,
            skipFirst: skipFirst
        };
        if (limit) {
            request.limit = limit;
        }
        let response = await this.connection.invoke('ReadNodesValueHistory', request);
        this.handleError(response);
        let result = {
            values: response.result.map(e => e.values),
            continuationPoint: response.nextStart ?
                {
                    timestamp: response.nextStart
                }
                :
                    null
        };
        return result;
    }
    handleError(response) {
        if (response.status === WebResponseStatus.success) {
            return response;
        }
        else {
            const message = Client.generateErrorMessage(response.error);
            throw new Error(message);
        }
    }
    static generateErrorMessage(error) {
        let message = error.detail;
        if (error.parameters) {
            console.log(error.parameters);
            message += ':\n\nParameters:\n';
            for (const [key, value] of Object.entries(error.parameters)) {
                // error.parameters.forEach((value, key) => {
                message += `"${key}": ${JSON.stringify(value)}\n`;
            }
            message += '\n\n';
        }
        if (error.errors) {
            message += ':\n\nSub errors:\n';
            error.errors.forEach(e => {
                message += this.generateErrorMessage(e);
            });
        }
        return message;
    }
    get state() {
        return this.clientState;
    }
    get reconnectDelay() {
        return this.delay;
    }
    set reconnectDelay(value) {
        this.delay = value;
    }
}
export * from './types.js';
//# sourceMappingURL=codabix-signalr.js.map