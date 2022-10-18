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

const askEditGameChoice = () => {
  const questions = [
    {
      type: "list",
      name: "editChoice",
      message: "What would you like to change?",
      choices: [
        { key: "1", name: "Game name", value: "changeName" },
        { key: "2", name: "Player name/team", value: "changePlayer" },
        { key: "3", name: "Cancel", value: "cancel" },
      ],
      validate: (value) =>
        ["1", "2", "3"].includes(value)
          ? true
          : "Please enter a valid numerical value",
    },
    {
      type: "input",
      name: "newGameName",
      message: "Enter new game name: ",
      when: (answersSoFar) => {
        return answersSoFar?.editChoice === "changeName";
      },
      validate: (value) => (!!value ? true : "Please enter a game name"),
    },
  ];
  return inquirer.prompt(questions);
};

const askEditPlayerChoice = (gameInfo) => {
  const allPlayerChoices = [];
  const homes = gameInfo.home.players?.map(({ player, shorthand }) => {
    return {
      key: shorthand,
      name: `${player} - ${shorthand} ; (home)`,
      value: shorthand,
    };
  });
  homes && allPlayerChoices.push(...homes);
  allPlayerChoices.push(new inquirer.Separator());
  const aways = gameInfo.away.players?.map(({ player, shorthand }) => {
    return {
      key: shorthand,
      name: `${player} - ${shorthand} ; (away)`,
      value: shorthand,
    };
  });
  aways && allPlayerChoices.push(...aways);
  allPlayerChoices.push({ key: "cancel", name: "Cancel", value: "cancel" });
  allPlayerChoices.push(new inquirer.Separator());

  const questions = [
    {
      type: "list",
      name: "editPlayerChoice",
      message: "Is the player on the home (1) or away (2) team: ",
      choices: [
        { key: "1", name: "Home", value: "home" },
        { key: "2", name: "Away", value: "away" },
        { key: "3", name: "Back", value: "back" },
        new inquirer.Separator(),
        { key: "4", name: "Print Home", value: "printHome" },
        { key: "5", name: "Print Away", value: "printAway" },
        { key: "6", name: "Delete Player", value: "delete" },
      ],
    },
    {
      type: "input",
      name: "playerName",
      message: "Enter player name: ",
      when: (answersSoFar) => {
        return (
          answersSoFar?.editPlayerChoice === "home" ||
          answersSoFar?.editPlayerChoice === "away"
        );
      },
      validate: (value) => (!!value ? true : "Please enter a player name"),
    },
    {
      type: "input",
      name: "playerShort",
      message: "Enter shorthand name: ",
      when: (answersSoFar) => {
        return (
          answersSoFar?.editPlayerChoice === "home" ||
          answersSoFar?.editPlayerChoice === "away"
        );
      },
      validate: (value) => (!!value ? true : "Please enter a player name"),
    },
    {
      type: "list",
      name: "shortToDelete",
      message: "Select player to delete: ",
      choices: allPlayerChoices,
      when: (answersSoFar) => {
        return answersSoFar?.editPlayerChoice === "delete";
      },
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
        { key: "p", name: "Print last n plays", value: "print" },
        { key: "g", name: "Edit Game Details", value: "edit" },
      ],
    },
    {
      type: "input",
      name: "playerNumber",
      message: "Enter player shorthand (non- case sensitive): ",
      when: (answersSoFar) => {
        return (
          !answersSoFar.playType ||
          !["exit", "save", "undo", "addText", "print", "edit"].includes(
            answersSoFar.playType
          )
        );
      },
      validate: (value) => (value.length ? true : "Please enter a value"),
    },
    {
      type: "list",
      name: "isOkToUndo",
      message: "Undo last play?",
      when: (answersSoFar) => {
        return answersSoFar?.playType === "undo";
      },
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    },
    {
      type: "input",
      name: "numberOfPlays",
      message:
        "Enter number of plays to print (or nothing to print game details): ",
      when: (answersSoFar) => {
        return answersSoFar?.playType === "print";
      },
      validate: (value) =>
        !value || (value.length && !isNaN(parseInt(value)))
          ? true
          : "Please enter a valid numerical value",
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
    {
      type: "list",
      name: "outputType",
      message: "What format?",
      when: (answersSoFar) => {
        return answersSoFar?.whatToDo === "Box Score";
      },
      choices: ["Standard", "CSV"],
    },
  ];
  return inquirer.prompt(questions);
};

const askGamesToAggregate = () => {
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
            type: "checkbox",
            name: "gamesToAgg",
            message: "Select The Games To Aggregate",
            choices: gameChoices,
          },
          {
            type: "list",
            name: "outputType",
            message: "What format?",
            choices: ["Standard", "CSV"],
          },
        ]);
      }
    } catch (err) {
      throw new Error("gamestore.json is not in expected format");
    }
  }
};

export default {
  askLoadExistingOrNew,
  askGameDetails,
  askGameToLoad,
  askToCreateGameFiles,
  askNextPlay,
  askAnalyzeWhat,
  askGamesToAggregate,
  askEditGameChoice,
  askEditPlayerChoice,
};
