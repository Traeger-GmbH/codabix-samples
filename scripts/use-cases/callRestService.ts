// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how a web service can be used using its REST interface.
// To do so the sample uses a HTTP client to send the REST request while its response is expected,
// parsed and processed as a JSON object.
// 
runtime.handleAsync(async function () {
    let temperatureNode = codabix.findNode("/Nodes/Temperature", true);

    while (true) {
        let valueToWrite: codabix.NodeValue;

        try {
            let response = await net.httpClient.sendAsync({
                url: "https://api.openmeteo.com/observations/openmeteo/1001/t2"
            });

            let result = JSON.parse(response.content!.body);
            valueToWrite = new codabix.NodeValue(result[1]);
        }
        catch (e) {
            logger.logWarning("Could not retrieve weather data: " + e);

            valueToWrite = new codabix.NodeValue(null, undefined, {
                statusCode: codabix.NodeValueStatusCodeEnum.Bad,
                statusText: String(e)
            });
        }

        // Write the temperature value.
        await codabix.writeNodeValueAsync(temperatureNode, valueToWrite);

        // Wait 5 seconds
        await timer.delayAsync(5000);
    }
}());
