// index.js

import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "./lib/inquirer.js";
import helper from "./lib/helper.js";
import plays from "./lib/plays.js";

clear();

console.log(
  chalk.yellow(figlet.textSync("hoop", { horizontalLayout: "full" }))
);

const run = async () => {
  const { purpose } = await inquirer.askLoadExistingOrNew();
  console.log(purpose);
  let gamePath;
  if (purpose === "Create") {
    const { gameName, gameDesc } = await inquirer.askGameDetails();
    gamePath = await helper.createGameDirAndInfo(gameName, gameDesc);
  }
  if (purpose === "Load") {
    const { gameToLoad } = await inquirer.askGameToLoad(); // validates game files
    gamePath = gameToLoad.gameDirPath.trimEnd("/");
    console.log(gamePath);
  }

  await helper.setupGameFiles(gamePath);

  // Game files are ready
  // plays.loadGame(gamePath); commented out because every run should be additive not absolute
  // console.log("Game loaded in memory");

  let input;
  do {
    input = await inquirer.askNextPlay();
    if (input.playType !== "exit") {
      // if (["save", "undo", "addText"].includes(input.playType))
      // record input
      plays.addPlay(gamePath, input.playType, input.playerNumber);
    }
  } while (input.playType !== "exit");

  plays.printPlays(gamePath);
  helper.commitPlays(gamePath, plays.getPlays(gamePath));
};

run();
