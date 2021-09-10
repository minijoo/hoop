import _ from "lodash";
import fs from "fs";
import clui from "clui";
import clc from "cli-color";
import { PlayType } from "./plays.js";

const Line = clui.Line,
  LineBuffer = clui.LineBuffer;

const awayPre = "A-";
const homePre = "H-";

const renderAnalysis = (analysisName, gamePath) => {
  if (analysisName === "Box Score") {
    const playsInFile = fs.readFileSync(gamePath + "/plays.json");
    const gameInfoFile = fs.readFileSync(gamePath + "/info.json");

    // play file
    const allPlays = playsInFile.length ? JSON.parse(playsInFile) : [];
    const playsByPlayer = _.groupBy(allPlays, "playerId");

    // game file
    const info = gameInfoFile.length ? JSON.parse(gameInfoFile) : {};
    const gameTitle = info.name || "Untitled Game";
    const description = info.description || "";
    const homeAndAwayStr =
      (info.away?.name || "Away") + "vs" + (info.home?.name || "Home");
    const awayPlayersByNum = info.players.reduce((prev, curr) => {
      if (curr.side?.toLower() === "away") {
        prev[curr.id] = curr;
      }
    }, {});

    const playCountsByPlayer = {};
    Object.keys(playsByPlayer).forEach((playerId) => {
      const counts = _.countBy(playsByPlayer[playerId], "playType");
      playCountsByPlayer[playerId] = counts;
    });

    // console.log(JSON.stringify(playCountsByPlayer));

    renderBoxScore(playCountsByPlayer);
  }
};

const renderBoxScore = (playCountsByPlayer) => {
  var outputBuffer = new LineBuffer({
    x: 0,
    y: 0,
    width: "console",
    height: "console",
  });

  var message = new Line(outputBuffer)
    .column("Box Score", 20, [clc.green])
    .fill()
    .store();

  var blankLine = new Line(outputBuffer).fill().store();

  var header = new Line(outputBuffer)
    .column("Id", 12, [clc.cyan])
    .column("PTS", 5, [clc.cyan])
    .column("FG", 9, [clc.cyan])
    .column("FG%", 9, [clc.cyan])
    .column("3PT", 9, [clc.cyan])
    .column("AST", 5, [clc.cyan])
    .column("REB", 5, [clc.cyan])
    .column("OREB", 5, [clc.cyan])
    .column("BLK", 5, [clc.cyan])
    .column("STL", 5, [clc.cyan])
    .column("FT", 9, [clc.cyan])
    .column("FT%", 9, [clc.cyan])
    .column("TO", 5, [clc.cyan])
    .column("FOUL", 5, [clc.cyan])
    .column("TIME", 5, [clc.cyan])
    .fill()
    .store();

  let homeTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {}),
    awayTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {});

  // Home
  Object.keys(playCountsByPlayer)
    .filter((a) => a.substring(0, 1) === "H")
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        // don't render team only stats
        renderBoxScoreLine(outputBuffer, playCountsByPlayer[k], k);
      }
      // but include them in team totals
      Object.values(PlayType).forEach((el) => {
        homeTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });
  // Home totals
  renderBoxScoreLine(outputBuffer, homeTotals, "Totals");

  // Blank line
  new Line(outputBuffer).fill().store();

  // Away
  Object.keys(playCountsByPlayer)
    .filter((a) => a.substring(0, 1) === "A")
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        renderBoxScoreLine(outputBuffer, playCountsByPlayer[k], k);
      }
      Object.values(PlayType).forEach((el) => {
        awayTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });
  // Home totals
  renderBoxScoreLine(outputBuffer, awayTotals, "Totals");

  outputBuffer.output();
};

const renderBoxScoreLine = (outputBuffer, playCounts, k) => {
  const thesePlays = playCounts;
  new Line(outputBuffer)
    .column(k, 12)
    .column(
      // PTS
      (
        (thesePlays[PlayType.TWPT] || 0) * 2 +
        (thesePlays[PlayType.THPT] || 0) * 3 +
        (thesePlays[PlayType.FT] || 0)
      ).toFixed(0),
      5,
      [
        thesePlays[PlayType.TWPT] ||
        thesePlays[PlayType.THPT] ||
        thesePlays[PlayType.FT]
          ? clc.green
          : clc.white,
      ]
    )
    .column(
      // FG
      (
        (thesePlays[PlayType.TWPT] || 0) + (thesePlays[PlayType.THPT] || 0)
      ).toFixed(0) +
        "/" +
        (
          (thesePlays[PlayType.TWPTMI] || 0) +
          (thesePlays[PlayType.TWPT] || 0) +
          (thesePlays[PlayType.THPT] || 0) +
          (thesePlays[PlayType.THPTMI] || 0)
        ).toFixed(0),
      9,
      [
        thesePlays[PlayType.TWPT] || thesePlays[PlayType.THPT]
          ? clc.green
          : clc.white,
      ]
    )
    .column(
      // FG%
      !thesePlays[PlayType.TWPTMI] &&
        !thesePlays[PlayType.TWPT] &&
        !thesePlays[PlayType.THPT] &&
        !thesePlays[PlayType.THPTMI]
        ? "--"
        : (
            (((thesePlays[PlayType.TWPT] || 0) +
              (thesePlays[PlayType.THPT] || 0)) /
              ((thesePlays[PlayType.TWPTMI] || 0) +
                (thesePlays[PlayType.TWPT] || 0) +
                (thesePlays[PlayType.THPT] || 0) +
                (thesePlays[PlayType.THPTMI] || 0))) *
            100.0
          ).toFixed(1),
      9,
      [
        thesePlays[PlayType.TWPT] || thesePlays[PlayType.THPT]
          ? clc.green
          : clc.white,
      ]
    )
    .column(
      // 3PT
      (thesePlays[PlayType.THPT] || 0).toFixed(0) +
        "/" +
        (
          (thesePlays[PlayType.THPT] || 0) + (thesePlays[PlayType.THPTMI] || 0)
        ).toFixed(0),
      9,
      [thesePlays[PlayType.THPT] ? clc.green : clc.white]
    )
    .column(
      // AST
      (thesePlays[PlayType.AST] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.AST] ? clc.green : clc.white]
    )
    .column(
      // REB
      (
        (thesePlays[PlayType.REB] || 0) + (thesePlays[PlayType.OREB] || 0)
      ).toFixed(0),
      5,
      [
        thesePlays[PlayType.REB] || thesePlays[PlayType.OREB]
          ? clc.green
          : clc.white,
      ]
    )
    .column(
      // O-REB
      (thesePlays[PlayType.OREB] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.OREB] ? clc.green : clc.white]
    )
    .column(
      // BLK
      (thesePlays[PlayType.BLK] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.BLK] ? clc.green : clc.white]
    )
    .column(
      // STL
      (thesePlays[PlayType.STL] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.STL] ? clc.green : clc.white]
    )
    .column(
      // FTS
      (thesePlays[PlayType.FT] || 0).toFixed(0) +
        "/" +
        (
          (thesePlays[PlayType.FT] || 0) + (thesePlays[PlayType.FTMI] || 0)
        ).toFixed(0),
      9,
      [thesePlays[PlayType.FT] ? clc.green : clc.white]
    )
    .column(
      // FT%
      !thesePlays[PlayType.FT] && !thesePlays[PlayType.FTMI]
        ? "--"
        : (
            ((thesePlays[PlayType.FT] || 0) /
              ((thesePlays[PlayType.FT] || 0) +
                (thesePlays[PlayType.FTMI] || 0))) *
            100.0
          ).toFixed(1),
      9,
      [thesePlays[PlayType.FT] ? clc.green : clc.white]
    )
    .column(
      // TOV
      (thesePlays[PlayType.TOV] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.TOV] ? clc.green : clc.white]
    )
    .column(
      // FLS
      (thesePlays[PlayType.FL] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.FL] ? clc.green : clc.white]
    )
    .column(
      // FLS
      !thesePlays[PlayType.TIMEOUT]
        ? "--"
        : (thesePlays[PlayType.TIMEOUT] || 0).toFixed(0),
      5,
      [thesePlays[PlayType.TIMEOUT] ? clc.green : clc.white]
    )
    .fill()
    .store();
};

export default { renderAnalysis };
