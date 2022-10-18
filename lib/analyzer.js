import _ from "lodash";
import clui from "clui";
import clc from "cli-color";
import { PlayType } from "./plays.js";
import helper from "./helper.js";
import formulas, { Category } from "./formulas.js";

const Line = clui.Line,
  LineBuffer = clui.LineBuffer;

// const awayPre = "A-";
// const homePre = "H-";
const HOME = "home",
  AWAY = "away";

// const gameInfoGlobal = {};

const initAnalysis = (playsParsed, gameInfoParsed) => {
  const allPlays = playsParsed;
  const info = gameInfoParsed;

  const gameTitle = info.name || "Untitled Game";
  const description = info.description || "";
  const awayStr = info.away?.name || "Away";
  const homeStr = info.home?.name || "Home";
  const playersByShorts = info.home.players?.reduce((prev, curr) => {
    prev[curr.shorthand] = { player: curr.player, side: HOME };
    return prev;
  }, {});
  info.away.players?.reduce((prev, curr) => {
    prev[curr.shorthand] = { player: curr.player, side: AWAY };
    return prev;
  }, playersByShorts);

  // const playersByNum = info.players.reduce((prev, curr) => {
  //   if (curr.side && _.toLower(curr.side) === "away") {
  //     prev[awayPre + curr.id] = curr;
  //   } else if (curr.side && _.toLower(curr.side) === "home") {
  //     prev[homePre + curr.id] = curr;
  //   }
  //   return prev;
  // }, {});

  // Populate gameInfo object
  const gameInfo = {};
  gameInfo.title = gameTitle;
  gameInfo.description = description;
  gameInfo.homeName = homeStr;
  gameInfo.awayName = awayStr;
  // gameInfo.playersMap = playersByNum;
  gameInfo.playersByShorts = playersByShorts;
  return [allPlays, gameInfo];
};

const genCsv = (allPlays, gameInfo) => {
  /** INIT */
  const playsByPlayer = _.groupBy(allPlays, "playerId");
  const playCountsByPlayer = {};
  Object.keys(playsByPlayer).forEach((playerId) => {
    const counts = _.countBy(playsByPlayer[playerId], "playType");
    playCountsByPlayer[playerId] = counts;
  });

  let homeTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {}),
    awayTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {});

  const categoryOrder = [
    Category.PTS,
    Category.FG,
    Category.FGP,
    Category.THPT,
    Category.THMADE,
    Category.AST,
    Category.REB,
    Category.OREB,
    Category.BLK,
    Category.STL,
    Category.FT,
    Category.FTP,
    Category.TO,
    Category.FOUL,
    Category.TIME,
  ];

  const homePlayerRows = [];
  const awayPlayerRows = [];
  Object.keys(playCountsByPlayer)
    .filter((a) => gameInfo.playersByShorts?.[a]?.side === HOME)
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        homePlayerRows.push(
          genBoxScoreLineCsv(gameInfo, playCountsByPlayer[k], k, categoryOrder)
        );
      }
      // but include them in team totals
      Object.values(PlayType).forEach((el) => {
        homeTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });

  Object.keys(playCountsByPlayer)
    .filter((a) => gameInfo.playersByShorts?.[a]?.side !== HOME) // Checking !HOME instead so that all players will be displayed. For ease of debugging/development
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        awayPlayerRows.push(
          genBoxScoreLineCsv(gameInfo, playCountsByPlayer[k], k, categoryOrder)
        );
      }
      Object.values(PlayType).forEach((el) => {
        awayTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });

  const line0 =
    `"Box Score: ${gameInfo.title}; Description: ${gameInfo.description}"` +
    genCommas(categoryOrder.length + 1);
  const homeName =
    `Team ${gameInfo.homeName}` + genCommas(categoryOrder.length + 1);
  const cats =
    "Player," +
    categoryOrder
      .map((el) => {
        if (el === "THPT") return "3PT";
        if (el === "THMADE") return "3PT Made";
        if (el === "FGP") return "FG%";
        if (el === "FTP") return "FT%";
        else return el;
      })
      .join(",");
  const homeRows = homePlayerRows.join("\n");

  const homeTot = genBoxScoreLineCsv(
    gameInfo,
    homeTotals,
    "Totals",
    categoryOrder
  );

  // AWAY
  const awayName = `Team ${gameInfo.awayName}`;
  const awayRows = awayPlayerRows.join("\n");
  const awayTot = genBoxScoreLineCsv(
    gameInfo,
    awayTotals,
    "Totals",
    categoryOrder
  );

  return (
    line0 +
    "\n" +
    "\n" +
    homeName +
    "\n" +
    cats +
    "\n" +
    homeRows +
    "\n" +
    homeTot +
    "\n" +
    "\n" +
    awayName +
    "\n" +
    cats +
    "\n" +
    awayRows +
    "\n" +
    awayTot
  );
};

const genCommas = (n) => {
  let str = "";
  for (let i = 0; i < n; i++) {
    str += ",";
  }
  return str;
};

const genBoxScoreLineCsv = (gameInfo, playCounts, k, categoryOrder) => {
  const cols = [];
  const player = gameInfo.playersByShorts?.[k]
    ? gameInfo.playersByShorts[k].player
    : k;
  const allStats = formulas.getAllStats(playCounts, " of ");
  cols.push(player);
  categoryOrder.forEach((el) => {
    cols.push(allStats[el]);
  });
  return cols.length ? cols.join(",") : "";
};

const csv = (analysisName, playsParsed, gameInfoParsed) => {
  const [allPlays, gameInfo] = initAnalysis(playsParsed, gameInfoParsed);
  const csvStr = genCsv(allPlays, gameInfo);
  const csvName = gameInfo.title + "_" + Date.now();
  helper.saveCsv(csvStr, "csvs/" + csvName);
};

const renderAnalysis = (analysisName, playsParsed, gameInfoParsed) => {
  if (analysisName === "Box Score") {
    const [allPlays, gameInfo] = initAnalysis(playsParsed, gameInfoParsed);
    renderBoxScore(allPlays, gameInfo);
  }
};

const renderBoxScore = (allPlays, gameInfo) => {
  const playsByPlayer = _.groupBy(allPlays, "playerId");
  const playCountsByPlayer = {};
  Object.keys(playsByPlayer).forEach((playerId) => {
    const counts = _.countBy(playsByPlayer[playerId], "playType");
    playCountsByPlayer[playerId] = counts;
  });

  var outputBuffer = new LineBuffer({
    x: 0,
    y: 0,
    width: "console",
    height: "console",
  });

  var message = new Line(outputBuffer)
    .column("Box Score ", 15, [clc.green])
    .column(gameInfo.title, 25, [clc.white])
    .fill()
    .store();

  new Line(outputBuffer)
    .column("Description ", 15, [clc.green])
    .column(gameInfo.description, 100, [clc.white])
    .fill()
    .store();

  var blankLine = new Line(outputBuffer).fill().store();

  let homeTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {}),
    awayTotals = Object.values(PlayType).reduce((prev, pt) => {
      prev[pt] = 0; // initialize
      return prev;
    }, {});

  // Home
  new Line(outputBuffer)
    .column("Team ", 7, [clc.green])
    .column(gameInfo.homeName, 40, [clc.white])
    .fill()
    .store();

  renderHeaderLine(outputBuffer);

  Object.keys(playCountsByPlayer)
    .filter((a) => gameInfo.playersByShorts?.[a]?.side === HOME)
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        // don't render team only stats
        renderBoxScoreLine(outputBuffer, gameInfo, playCountsByPlayer[k], k);
      }
      // but include them in team totals
      Object.values(PlayType).forEach((el) => {
        homeTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });
  // Totals
  lineParity = false;
  new Line(outputBuffer).column("-", 102).fill().store();
  renderBoxScoreLine(outputBuffer, gameInfo, homeTotals, "Totals");

  // Blank line
  new Line(outputBuffer).fill().store();

  // Away
  new Line(outputBuffer)
    .column("Team ", 7, [clc.green])
    .column(gameInfo.awayName, 40, [clc.white])
    .fill()
    .store();
  renderHeaderLine(outputBuffer);

  lineParity = false;
  Object.keys(playCountsByPlayer)
    .filter((a) => gameInfo.playersByShorts?.[a]?.side !== HOME) // Checking !HOME instead so that all players will be displayed. For ease of debugging/development
    .forEach((k) => {
      if (!k.includes("-TEAM")) {
        renderBoxScoreLine(outputBuffer, gameInfo, playCountsByPlayer[k], k);
      }
      Object.values(PlayType).forEach((el) => {
        awayTotals[el] += playCountsByPlayer[k][el]
          ? playCountsByPlayer[k][el]
          : 0;
      });
    });
  // Totals
  lineParity = false;
  new Line(outputBuffer).column("-", 102).fill().store();
  renderBoxScoreLine(outputBuffer, gameInfo, awayTotals, "Totals");

  // Blank line
  new Line(outputBuffer).fill().store();

  outputBuffer.output();
};

const renderHeaderLine = (outputBuffer) => {
  new Line(outputBuffer)
    .column("Player", 12, [clc.cyan])
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
};

let lineParity = false;

const getCellColor = (val, parity) => {
  const color = val
    ? parity
      ? clc.black.bgGreen
      : clc.white
    : parity
    ? clc.blackBright.bgGreen
    : clc.white;
  return color;
};
const renderBoxScoreLine = (outputBuffer, gameInfo, playCounts, k) => {
  const thesePlays = playCounts;
  new Line(outputBuffer)
    .column(
      gameInfo.playersByShorts?.[k] ? gameInfo.playersByShorts[k].player : k,
      12,
      [getCellColor(1, lineParity)]
    )
    .column(
      // PTS
      formulas.getPts(thesePlays),
      5,
      [
        getCellColor(
          thesePlays[PlayType.TWPT] ||
            thesePlays[PlayType.THPT] ||
            thesePlays[PlayType.FT],
          lineParity
        ),
      ]
    )
    .column(
      // FG
      formulas.getFgs(thesePlays, "/"),
      9,
      [
        getCellColor(
          thesePlays[PlayType.TWPT] || thesePlays[PlayType.THPT],
          lineParity
        ),
      ]
    )
    .column(
      // FG%
      formulas.getFgp(thesePlays),
      9,
      [
        getCellColor(
          thesePlays[PlayType.TWPT] || thesePlays[PlayType.THPT],
          lineParity
        ),
      ]
    )
    .column(
      // 3PT
      formulas.get3pt(thesePlays, "/"),
      9,
      [getCellColor(thesePlays[PlayType.THPT], lineParity)]
    )
    .column(
      // AST
      formulas.getAst(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.AST], lineParity)]
    )
    .column(
      // REB
      formulas.getReb(thesePlays),
      5,
      [
        getCellColor(
          thesePlays[PlayType.REB] || thesePlays[PlayType.OREB],
          lineParity
        ),
      ]
    )
    .column(
      // O-REB
      formulas.getOreb(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.OREB], lineParity)]
    )
    .column(
      // BLK
      formulas.getBlk(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.BLK], lineParity)]
    )
    .column(
      // STL
      formulas.getStl(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.STL], lineParity)]
    )
    .column(
      // FTS
      formulas.getFts(thesePlays, "/"),
      9,
      [getCellColor(thesePlays[PlayType.FT], lineParity)]
    )
    .column(
      // FT%
      formulas.getFtp(thesePlays),
      9,
      [getCellColor(thesePlays[PlayType.FT], lineParity)]
    )
    .column(
      // TOV
      formulas.getTov(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.TOV], lineParity)]
    )
    .column(
      // FLS
      formulas.getFls(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.FL], lineParity)]
    )
    .column(
      // TOs
      formulas.getTimeouts(thesePlays),
      5,
      [getCellColor(thesePlays[PlayType.TIMEOUT], lineParity)]
    )
    .fill()
    .store();
  lineParity = !lineParity;
};

export default { csv, renderAnalysis, renderBoxScore };
