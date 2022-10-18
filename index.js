// index.js

/*
1. Case-insensitivize player input
3. CSV output
4. Box score use new player array
*/

import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "./lib/inquirer.js";
import helper from "./lib/helper.js";
import plays from "./lib/plays.js";

// globals
let game = {};

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
    game.path = await helper.createGameDirAndInfo(gameName, gameDesc);
  }
  if (purpose === "Load") {
    const { gameToLoad } = await inquirer.askGameToLoad(); // validates game files
    game.path = gameToLoad.gameDirPath.trimEnd("/");
    console.log(game.path);
  }

  game.info = await helper.setupGameFiles(game.path);

  // Game files are ready
  // plays.loadGame(game.path); commented out because every run should be additive not absolute
  // console.log("Game loaded in memory");

  let input;
  do {
    input = await inquirer.askNextPlay();
    if (input.playType !== "exit") {
      console.log(input.playType);
      if (
        ["save", "undo", "addText", "print", "edit"].includes(input.playType)
      ) {
        if (input.playType === "undo") {
          if (input.isOkToUndo) {
            plays.undoPlay(game.path);
          } else {
            console.log(chalk.yellow.bgBlack`Undo cancelled`);
          }
        } else if (input.playType === "print") {
          if (!input.numberOfPlays) {
            console.log(`Name: ${game.info.name}`);
            console.log(`Description: ${game.info.description}`);
            console.log(`Home Roster:`);
            game.info.home.players?.forEach(({ player, shorthand }) => {
              console.log(`\t${player} (${shorthand})`);
            });
            console.log(`Away Roster:`);
            game.info.away.players?.forEach(({ player, shorthand }) => {
              console.log(`\t${player} (${shorthand})`);
            });
          } else {
            const currPlays = plays.getPlays(game.path);
            const num = parseInt(input.numberOfPlays);
            if (currPlays.length <= num) {
              console.log(currPlays); // display plays
            } else {
              console.log(currPlays.slice(num * -1));
            }
          }
        } else if (input.playType === "save") {
          helper.commitPlays(game.path, plays.getPlays(game.path));
          // if above is successful
          plays.clearPlays(game.path);
        } else if (input.playType === "edit") {
          await enterEditGameMenu();
        } else {
          console.log("not supported");
        }
      } else {
        // record input
        plays.addPlay(game.path, input.playType, input.playerNumber);
      }
    }
  } while (input.playType !== "exit");

  plays.printPlays(game.path);
  helper.commitPlays(game.path, plays.getPlays(game.path));
};

const enterEditGameMenu = async () => {
  let input;
  do {
    input = await inquirer.askEditGameChoice();
    if (input.editChoice === "changeName") {
      game.info.name = input.newGameName;
      console.log(`Updating game name to "${game.info.name}"`);
      helper.updateGameInfo(game.path, game.info);
    } else if (input.editChoice === "changePlayer") {
      await enterAddPlayerMenu();
    }

    input.editChoice === "cancel" && clear();
  } while (input.editChoice !== "cancel");
};

const enterAddPlayerMenu = async () => {
  let input;
  do {
    input = await inquirer.askEditPlayerChoice(game.info);
    if (
      input.editPlayerChoice === "printHome" ||
      input.editPlayerChoice === "printAway"
    ) {
      if (input.editPlayerChoice === "printHome") {
        console.log(chalk.white.bgGray`Home Roster`);
        game.info.home?.players?.forEach(({ player, shorthand }) => {
          console.log(chalk.white.bgBlack`${player} (${shorthand})`);
        });
      } else {
        console.log(chalk.white.bgGray`Away Roster`);
        game.info.away?.players?.forEach(({ player, shorthand }) => {
          console.log(chalk.white.bgBlack`${player} (${shorthand})`);
        });
      }
      console.log(chalk.white.bgBlack`---END---`);
    }
    if (
      input.editPlayerChoice === "home" ||
      input.editPlayerChoice === "away"
    ) {
      const nameInput = input.playerName;
      const shortInput = input.playerShort;

      // Validate shorthand name
      const homeMatch = game.info.home.players?.find(
        ({ shorthand }) => shorthand === shortInput
      );
      const awayMatch = game.info.away.players?.find(
        ({ shorthand }) => shorthand === shortInput
      );
      if (homeMatch || awayMatch) {
        const notNullMatch = homeMatch || awayMatch;
        console.log(
          chalk.red
            .bgBlack`Shorthand already exists with player "${notNullMatch}"`
        );
        continue;
      }

      if (input.editPlayerChoice === "home") {
        if (!game.info.home.players) {
          game.info.home.players = [];
        }
        game.info.home.players.push({
          player: nameInput,
          shorthand: shortInput.toUpperCase(),
        });
      } else {
        if (!game.info.away.players) {
          game.info.away.players = [];
        }
        game.info.away.players.push({
          player: nameInput,
          shorthand: shortInput.toUpperCase(),
        });
      }

      helper.updateGameInfo(game.path, game.info);
    }
    if (input.editPlayerChoice === "delete") {
      if (input.shortToDelete === "cancel") {
        continue;
      } else {
        const matchIndex = game.info.home.players?.findIndex(
          ({ shorthand }) => shorthand === input.shortToDelete
        );
        if (matchIndex != -1) {
          const toDel = game.info.home.players[matchIndex];
          game.info.home.players.splice(matchIndex, 1);
          console.log(
            chalk.yellow
              .bgBlack`Player "${toDel.player} (${input.shortToDelete})" was deleted from the home roster`
          );
        } else {
          const awayMatchIndex = game.info.away.players?.findIndex(
            ({ shorthand }) => shorthand === input.shortToDelete
          );
          const toDel = game.info.away.players[awayMatchIndex];
          game.info.away.players.splice(awayMatchIndex, 1);
          console.log(
            chalk.yellow
              .bgBlack`Player "${toDel.player} (${input.shortToDelete})" was deleted from the away roster`
          );
        }

        helper.updateGameInfo(game.path, game.info);
      }
    }

    input.editPlayerChoice === "back" && clear();
  } while (input.editPlayerChoice !== "back");
};

run();
