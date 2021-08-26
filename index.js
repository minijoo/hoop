// index.js

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "./lib/inquirer.js";
import files from "./lib/files.js";

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
    const { gameToLoad } = await inquirer.askGameToLoad();
    console.log(gameToLoad);
    if (files.directoryExists(gameToLoad.gameFilePath)) {
      console.log(`${gameToLoad.gameFilePath} found`);
    } else {
      throw new Error("Sorry. Unable to find " + gameToLoad.gameFilePath);
    }
  }
};

run();
