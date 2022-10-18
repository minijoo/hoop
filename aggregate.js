// aggregate.js

import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "./lib/inquirer.js";
import analyzer from "./lib/analyzer.js";
import constants from "./lib/constants.js";
import fs from "fs";

clear();

console.log(
  chalk.yellow(figlet.textSync("hoop - agg", { horizontalLayout: "full" }))
);

const run = async () => {
  // let gamePath;
  const { gamesToAgg, outputType } = await inquirer.askGamesToAggregate(); // validates game files
  // gamePath = gameToLoad.gameDirPath.trimEnd("/");
  console.log(gamesToAgg);

  const allPlays = [];
  gamesToAgg.forEach((gm) => {
    const playsInFile = fs.readFileSync(gm.gameDirPath + "/plays.json");
    const gameInfoFile = fs.readFileSync(gm.gameDirPath + "/info.json");
    // play file
    const plays = playsInFile.length ? JSON.parse(playsInFile) : [];

    // game file
    const info = gameInfoFile.length ? JSON.parse(gameInfoFile) : {};

    const playersByShorts = info.home.players?.reduce((prev, curr) => {
      prev[curr.shorthand] = { player: curr.player, side: constants.HOME };
      return prev;
    }, {});
    info.away.players?.reduce((prev, curr) => {
      prev[curr.shorthand] = { player: curr.player, side: constants.AWAY };
      return prev;
    }, playersByShorts);

    // normalize into player names
    plays.forEach((pl) => {
      const plName = playersByShorts[pl.playerId];
      if (plName) pl.playerId = plName.player;
    });

    plays.length && allPlays.push(...plays);
  });

  const aggGameInfo = {
    name: "Aggregated Box Score",
    description: ".",
    home: {},
    away: {},
  };

  if (outputType === "Standard") {
    analyzer.renderAnalysis("Box Score", allPlays, aggGameInfo);
  } else if (outputType === "CSV") {
    analyzer.csv("Box Score", allPlays, aggGameInfo);
  } else {
    console.log("Output Type ${outputType} unsupported");
  }
};

run();
