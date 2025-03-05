// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to validate that numeric values read
// from device variables are within a specific range (and otherwise use a 'Bad' value),
// by registering a value converter for the variable node.
//
runtime.handleAsync(async function () {

    // Create a value converter that will validate the value when reading it from
    // a device.
    let validatorConverter: codabix.NodeValueConverter = (value, writeFromDevice) => {
        let rawValue = value.value;

        // Check whether a read numeric value (from the device) is within a specific
        // range, and otherwise returns a value with a 'Bad' status.
        if (writeFromDevice && !value.status.isBad && typeof rawValue == "number") {
            // Validate the value range.
            if (rawValue < 0 || rawValue > 100) {
                return new codabix.NodeValue(
                    rawValue,
                    value.timestamp,
                    {
                        statusCode: codabix.NodeValueStatusCodeEnum.Bad,
                        statusText: "The read value from the device is outside of the allowed range."
                    });
            }
        }

        // Return the original value.
        return value;
    };

    // Register the converter.
    let node = codabix.findNode("/System/Devices/S7 Device/Channels/SPS/Variables/Scaler", true);
    node.registerValueConverter(validatorConverter);

}());