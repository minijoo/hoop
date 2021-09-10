import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";

const playType = {
  TWPT: "TWPTS",
  THPT: "THPTS",
  TWPTMI: "TWPTMI",
  THPTMI: "THPTMI",
  AST: "AST",
  FL: "FL",
  BLK: "BLK",
  REB: "REB",
  OREB: "OREB",
  SBIN: "SBIN",
  SBOU: "SBOU",
  STL: "STL",
  FT: "FT",
  FTMI: "FTMI",
  TOV: "TO",
  TIMEOUT: "TIMEOUT",
};

const playChoices = [
  { key: "2", name: "2PT Made", value: playType.TWPT },
  { key: "3", name: "3PT Made", value: playType.THPT },
  { key: "w", name: "2PT Miss", value: playType.TWPTMI },
  { key: "e", name: "3PT Miss", value: playType.THPTMI },
  { key: "a", name: "Assist", value: playType.AST },
  { key: "f", name: "Foul", value: playType.FL },
  { key: "b", name: "Block", value: playType.BLK },
  { key: "r", name: "Rebound", value: playType.REB },
  { key: "o", name: "Off-board", value: playType.OREB },
  // { key: "n", name: "Sub In", value: playType.SBIN }, for minutes.. not ready..
  // { key: "m", name: "Sub Out", value: playType.SBOU },
  { key: "s", name: "Steal", value: playType.STL },
  { key: "1", name: "Free Throw", value: playType.FT },
  { key: "q", name: "Free Throw Miss", value: playType.FTMI },
  { key: "z", name: "Timeout", value: playType.TIMEOUT },
  { key: "t", name: "Turnover", value: playType.TOV },
];

const plays = [];

const loadGame = (gameDirPath) => {
  // nothing for now, just use `plays`
};

const addPlay = (gameDirPath, playType, playerId, parentPlayId) => {
  plays.push({
    pId: uuidv4(),
    playType: playType,
    playerId: playerId,
    timestamp: Date.now(),
  });
};

const clearPlays = (gameDirPath) => {
  plays.splice(0, plays.length); // empties const array
};

const printPlays = (gameDirPath) => {
  console.log(plays);
};

const getPlays = (gameDirPath) => {
  console.log("Getting plays");
  return plays;
};

const undoPlay = (gameDirPath) => {
  if (plays.length < 0) {
    console.log(chalk.yellow.bgBlack`Nothing to undo`);
    return;
  }
  const popped = plays.pop();
  console.log(
    chalk.yellow
      .bgBlack`Undo successful. Removed: ${popped.playType} | ${popped.playerId} (${popped.pId})`
  );
};

export const PlayType = playType;
export const PlayChoices = playChoices;
export default {
  addPlay,
  loadGame,
  printPlays,
  getPlays,
  undoPlay,
  clearPlays,
};
