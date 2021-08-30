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
  if (purpose === "Create") {
    throw new Error("Sorry. Create is not supported at this moment");
    // const game = await inquirer.askGameDetails();
    // console.log(game);
  }
  if (purpose === "Load") {
    const { gameToLoad } = await inquirer.askGameToLoad(); // validates game files
    const gamePath = gameToLoad.gameDirPath.trimEnd("/");
    console.log(gamePath);
    await helper.setupGameFiles(gamePath);
  }

  // Game files are ready
  plays.loadGame(gamePath);
  console.log("Game loaded in memory");

  do {
    const input = await inquirer.askNextPlay();
    if (!input.isExit) {
      // record input
    }
  } while (!input.isExit);
};

run();
