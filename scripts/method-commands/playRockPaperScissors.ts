// Copyright (c) Traeger Industry Components GmbH. All Rights Reserved.
// 
// # Requirements
// The following method command expects a method node in path "/Nodes/PlayRockPaperScissors".
// This method requires an input argument 'PlayerHand' of the 'Value Type' equals 'Int32'.
// This method requires an output argument 'Result' of the 'Value Type' equals 'String'.
// 
// # Task
// Takes a number indicating the players move (1 = Rock, 2 = Paper, 3 = Scissors), calculates the
// random Codabix move and returns the moves of the game + winner.
// 
runtime.handleAsync(async function () {
    let methodNode = codabix.findNode("/Nodes/PlayRockPaperScissors", true);

    methodNode.registerCommand({
        executeAsync(context: codabix.NodeCommandContext): Promise<void> {
            // 0 = Rock, 1 = Paper, 2 = Scissors
            let moves = ["Rock", "Paper", "Scissors"];

            let playerHand = context.inputArguments[0].value as number;
            let codabixHand = Math.floor(Math.random() * 3) + 1;

            let winner = "Player";

            if (playerHand == codabixHand) {
                winner = "neither";
            }
            else if ((playerHand === 1 /* Rock */ && codabixHand === 2 /* Paper */)
                    || (playerHand === 2 /* Paper */ && codabixHand === 3 /* Scissors */)
                    || (playerHand === 3 /* Scissor*/ && codabixHand === 1 /* Rock */)) {
                winner = "Codabix";
            }

            context.outputArguments[0].value
                = `Player: '${moves[playerHand - 1]}', `
                + `Codabix: '${moves[codabixHand - 1]}'`
                + `-> Winner: ${winner}`;

            return Promise.resolve();
        }
    });
}());
