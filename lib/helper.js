import _ from "lodash";
import inquirer from "./inquirer.js";
import chalk from "chalk";
import files from "./files.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const INFO_FN = "info.json";
const PLAY_FN = "plays.json";

const _exitWithMessage = () => {
  console.log("Exiting program");
};

const addGameToGamestore = (newGameDirPath) => {
  const gamestoreJson = JSON.parse(fs.readFileSync("gamestore.json"));
  gamestoreJson.unshift({
    gameDirPath: newGameDirPath,
  });
  fs.writeFileSync("gamestore.json", JSON.stringify(gamestoreJson, null, 2));
};

// name should be already checked for uniqueness
const createGameDirAndInfo = async (gameName, gameDesc) => {
  const gameDirPath = "./games/" + files.getDirNameFormat(gameName);
  const infoFilePath = gameDirPath + "/" + INFO_FN;

  addGameToGamestore(gameDirPath);

  fs.mkdirSync(gameDirPath);
  fs.writeFileSync(
    infoFilePath,
    JSON.stringify(
      {
        id: uuidv4(),
        name: gameName,
        description: gameDesc,
        home: {
          name: "home",
        },
        away: {
          name: "away",
        },
        players: [],
      },
      null,
      2
    )
  );

  return gameDirPath;
};

const setupGameFiles = async (gameDirPath) => {
  const infoFilePath = gameDirPath + "/" + INFO_FN;
  const playFilePath = gameDirPath + "/" + PLAY_FN;
  if (
    !files.directoryExists(gameDirPath) ||
    !files.directoryExists(infoFilePath)
  ) {
    throw new Error(
      `Game in ${gameDirPath} was not found or was created without info file`
    );
  }
  if (!files.directoryExists(playFilePath)) {
    console.log("Play file not found");
    // const { doCreateGameFiles } = await inquirer.askToCreateGameFiles();
    // console.log(doCreateGameFiles);
    // if (doCreateGameFiles) {
    // console.log("Creating game files");
    // if (!files.directoryExists(infoFilePath)) {
    //   files.createFile(gameDirPath, INFO_FN);
    //   fs.writeFileSync(
    //     infoFilePath,
    //     JSON.stringify({
    //       id: _.uniqueId("game_"),
    //     })
    //   );
    //   console.log("Created game info file");
    // }
    fs.writeFileSync(playFilePath, "[]");
    console.log("Created play file");
  }
  console.log("Game found and validated");
  return JSON.parse(fs.readFileSync(infoFilePath));
};

const saveCsv = async (csvStr, name) => {
  if (!csvStr || !name) {
    console.log("CSV file not saved");
    return;
  }
  fs.writeFileSync(name + ".csv", csvStr);
  console.log(chalk.black.bgGreenBright`Generated CSV: ${name}`);
};

const updateGameInfo = async (gameDirPath, gameInfo) => {
  fs.writeFileSync(
    gameDirPath + "/" + INFO_FN,
    JSON.stringify(gameInfo, null, 2)
  );
  console.log(chalk.black.bgGreenBright`Updated game info sucessfully`);
};

const commitPlays = async (gameDirPath, newPlays) => {
  console.log("Committing plays to file");
  const playsInFile = fs.readFileSync(gameDirPath + "/" + PLAY_FN);
  const allPlays = playsInFile.length ? JSON.parse(playsInFile) : [];
  allPlays.push(...newPlays);
  fs.writeFileSync(
    gameDirPath + "/" + PLAY_FN,
    JSON.stringify(allPlays, null, 2)
  );
  console.log("Done committing plays to file");
};

export default {
  createGameDirAndInfo,
  setupGameFiles,
  commitPlays,
  updateGameInfo,
  saveCsv,
};
