import inquirer from "inquirer";
import files from "./files.js";
import fs from "fs";
import { PlayChoices } from "./plays.js";

const askLoadExistingOrNew = () => {
  const questions = [
    {
      type: "list",
      name: "purpose",
      message: "Load existing or Create new?",
      choices: ["Load", "Create"],
    },
  ];
  return inquirer.prompt(questions);
};

const askGameDetails = () => {
  return inquirer.prompt([
    {
      type: "input",
      name: "gameName",
      message: "Enter Name For New Game",
      validate: (value) => {
        if (value.length) {
          if (
            files.directoryExists("./games/" + files.getDirNameFormat(value))
          ) {
            return "Game name already exists.";
          } else {
            return true;
          }
        } else {
          return "Please enter a value";
        }
      },
    },
    {
      type: "input",
      name: "gameDesc",
      message: "Enter Description For New Game",
      validate: (value) => (value.length ? true : "Please enter a value"),
    },
  ]);
};

const askGameToLoad = () => {
  if (files.directoryExists("gamestore.json")) {
    const gamestoreJson = JSON.parse(fs.readFileSync("gamestore.json"));
    try {
      const gameChoices = gamestoreJson
        .filter((el) => files.directoryExists(el.gameDirPath + "/info.json"))
        .map((el) => {
          const gameInfo = JSON.parse(
            fs.readFileSync(el.gameDirPath + "/info.json")
          );
          return {
            name: `${gameInfo.name} -- ${gameInfo.description} (${gameInfo.id}) [${el.gameDirPath}]`,
            value: el,
          };
        });
      if (gameChoices.length >= 1) {
        return inquirer.prompt([
          {
            type: "list",
            name: "gameToLoad",
            message: "Select The Game To Load",
            choices: gameChoices,
          },
        ]);
      }
    } catch (err) {
      throw new Error("gamestore.json is not in expected format");
    }
  }
};

const askToCreateGameFiles = () => {
  const questions = [
    {
      type: "list",
      name: "doCreateGameFiles",
      message: "?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    },
  ];
  return inquirer.prompt(questions);
};

const askNextPlay = () => {
  return inquirer.prompt([
    {
      type: "expand",
      name: "playType",
      message:
        "\n" +
        PlayChoices.map((el) => `${el.key} - ${el.name}`).join("\n") +
        "\n",
      choices: [
        ...PlayChoices,
        { key: "x", name: "Save & Exit", value: "exit" },
        { key: "v", name: "Save Only", value: "save" },
        { key: "u", name: "Undo", value: "undo" },
        { key: "d", name: "Add Text", value: "addText" },
      ],
    },
    {
      type: "input",
      name: "playerNumber",
      message: "Enter player number: ",
      when: (answersSoFar) => {
        return answersSoFar?.playType !== "exit";
      },
      validate: (value) => (value.length ? true : "Please enter a value"),
    },
  ]);
};

const askAnalyzeWhat = () => {
  const questions = [
    {
      type: "list",
      name: "whatToDo",
      message: "What would you like to get?",
      choices: ["Box Score", "Cookie", "Nothing."],
    },
  ];
  return inquirer.prompt(questions);
};

export default {
  askLoadExistingOrNew,
  askGameDetails,
  askGameToLoad,
  askToCreateGameFiles,
  askNextPlay,
  askAnalyzeWhat,
};
