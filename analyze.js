// analyze.js

import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import fs from "fs";
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
    let input = await inquirer.askAnalyzeWhat();
    selectedAnalysis = input.whatToDo;
    console.log(selectedAnalysis);
    if (selectedAnalysis !== "Nothing.") {
      if (selectedAnalysis === "Cookie") {
        console.log(
          chalk.red.bgBlack`No cookie here or in the oven at this time`
        );
      } else {
        clear();
        const playsInFile = fs.readFileSync(gamePath + "/plays.json");
        const gameInfoFile = fs.readFileSync(gamePath + "/info.json");
        const playsParsed = playsInFile.length ? JSON.parse(playsInFile) : [];
        const gameInfoParsed = gameInfoFile.length
          ? JSON.parse(gameInfoFile)
          : {};
        if (input.outputType === "CSV") {
          analyzer.csv(selectedAnalysis, playsParsed, gameInfoParsed);
        } else {
          analyzer.renderAnalysis(
            selectedAnalysis,
            playsParsed,
            gameInfoParsed
          );
        }
      }
    }
  } while (selectedAnalysis !== "Nothing.");

  console.log("Exiting..");
};

run();
