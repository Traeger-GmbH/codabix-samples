// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// The following snippet demonstrates how to call a script function (doSomethingAsync)
// once every day (e.g. 14:00 local time).
// 
runtime.handleAsync(async function () {

    function doSomethingAsync(): Promise<void> {
        logger.logWarning("Doing something at 14:00!");
        return Promise.resolve();
    }

    async function waitUntilAsync(date: Date) {
        while (true) {
            let now = Date.now();
            let timeToWait = date.getTime() - now;

            if (timeToWait > 0) {
                // Wait again (max. 5 seconds, to handle the case when the machine
                // was in hibernation/sleep state during the wait time).
                await timer.delayAsync(Math.min(5000, timeToWait));
            }
            else {
                // We arrived at the given date/time.
                return;
            }
        }
    }

    // Wait until it is 14:00.
    // Create a new date with the current date components, and then set the target time.
    let currentDate = new Date();
    let targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    targetDate.setHours(14);
    targetDate.setMinutes(0);

    // If the target time has already passed, set it to the next day.
    if (targetDate.getTime() - currentDate.getTime() < 0)
        targetDate.setDate(targetDate.getDate() + 1);

    while (true) {
        logger.log("Wait until: " + targetDate);
        await waitUntilAsync(targetDate);
        logger.log("Time has passed.");

        try {
            await doSomethingAsync();
        }
        catch (e) {
            // Handle exceptions in the scheduled function so that the script is not aborted/restarted.
            logger.logError("Error when handling time-scheduled function: " + e);
        }

        // Set the time to the next day.
        targetDate.setDate(targetDate.getDate() + 1);
    }

}());