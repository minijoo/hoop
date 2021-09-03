// analyze.js

import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "./lib/inquirer.js";
import analyzer from "./lib/analyzer.js";
import plays from "./lib/plays.js";

clear();

console.log(
  chalk.yellow(figlet.textSync("hoop - anlyz", { horizontalLayout: "full" }))
);

const run = async () => {
  let gamePath;
  const { gameToLoad } = await inquirer.askGameToLoad(); // validates game files
  gamePath = gameToLoad.gameDirPath.trimEnd("/");
  console.log(gamePath);

  // Game files are ready
  plays.loadGame(gamePath);
  console.log("Game loaded in memory");

  let selectedAnalysis;
  do {
    selectedAnalysis = (await inquirer.askAnalyzeWhat()).whatToDo;
    console.log(selectedAnalysis);
    if (selectedAnalysis !== "Nothing.") {
      analyzer.renderAnalysis(selectedAnalysis, gamePath);
    }
  } while (selectedAnalysis !== "Nothing.");

  console.log("Exiting..");
};

run();
