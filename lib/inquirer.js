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
    const gamestoreBin = fs.readFileSync("gamestore.json");
    try {
      const gameChoices = JSON.parse(gamestoreBin).map((el) => {
        return {
          name: `${el.name} -- ${el.description} (${el.id}) [${el.gameFilePath}]`,
          value: el,
        };
      });
      return inquirer.prompt([
        {
          type: "list",
          name: "gameToLoad",
          message: "Select The Game To Load",
          choices: gameChoices,
        },
      ]);
    } catch (err) {
      throw new Error("gamestore.json is not in expected format");
    }
  }
};

export default { askLoadExistingOrNew, askGameDetails, askGameToLoad };
