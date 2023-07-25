export var clientState;
(function (clientState) {
    clientState[clientState["Created"] = 0] = "Created";
    clientState[clientState["Connecting"] = 1] = "Connecting";
    clientState[clientState["Connected"] = 2] = "Connected";
    clientState[clientState["Disconnecting"] = 3] = "Disconnecting";
    clientState[clientState["Disconnected"] = 4] = "Disconnected";
    clientState[clientState["Reconnecting"] = 5] = "Reconnecting";
    clientState[clientState["Reconnected"] = 6] = "Reconnected";
})(clientState || (clientState = {}));
//# sourceMappingURL=clientState.js.map