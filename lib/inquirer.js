import inquirer from "inquirer";
import files from "./files.js";
import fs from "fs";

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
      validate: (value) => (value.length ? true : "Please enter a value"),
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
      type: "list",
      name: "",
      message: "?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    },
    {
      type: "input",
      name: "gameDesc",
      message: "Enter Description For New Game",
      validate: (value) => (value.length ? true : "Please enter a value"),
    },
  ]);
};

export default {
  askLoadExistingOrNew,
  askGameDetails,
  askGameToLoad,
  askToCreateGameFiles,
};
