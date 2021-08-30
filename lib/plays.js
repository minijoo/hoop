import _ from "lodash";

const playType = {
  TWPT: "twpt",
  TOV: "to",
};

const plays = [
  {
    pId: "test1",
    pType: playType.TWPT,
    playerId: "pl-1B",
  },
  {
    pId: "test2",
    pType: playType.TOV,
    playerId: "pl-4A",
  },
];

const loadGame = (gameDirPath) => {
  // nothing for now, just use `plays`
};

const addPlay = (gameDirPath, playType, playerId, parentPlayId) => {
  plays.add({
    pId: _.uniqueId(),
    pType: playType,
    playerId: playerId,
  });
};

export default { addPlay };
