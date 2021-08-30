import _ from "lodash";
import inquirer from "./inquirer.js";
import files from "./files.js";
import fs from "fs";

const INFO_FN = "info.json";
const PLAY_FN = "plays.json";

const _exitWithMessage = () => {
  console.log("Exiting program");
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
    files.createFile(gameDirPath, PLAY_FN);
    fs.writeFileSync(playFilePath, "[]");
    console.log("Created play file");
  }
  console.log("Game found and validated");
};

export default { setupGameFiles };
