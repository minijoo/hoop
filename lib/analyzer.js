import _ from "lodash";
import fs from "fs";

const renderAnalysis = (analysisName, gamePath) => {
  if (analysisName === "Box Score") {
    const playsInFile = fs.readFileSync(gamePath + "/plays.json");
    const allPlays = playsInFile.length ? JSON.parse(playsInFile) : [];
    const playsByPlayer = _.groupBy(allPlays, "playerId");

    const playCountsByPlayer = {};
    Object.keys(playsByPlayer).forEach((playerId) => {
      const counts = _.countBy(playsByPlayer[playerId], "playType");
      playCountsByPlayer[playerId] = counts;
    });

    console.log(playCountsByPlayer);
  }
};

export default { renderAnalysis };
