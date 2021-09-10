import _ from "lodash";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import clui from "clui";
import clc from "cli-color";

const playsByPlayer = {
  "35-h": {
    TWPT: 5,
    TWPTMIS: 6,
    THPT: 1,
    THPTMIS: 2,
    AST: 4,
    BLK: 3,
    STL: 1,
    REB: 11,
    TOV: 3,
    FL: 3,
    FT: 4,
    FTMIS: 0,
  },
  "7-a": {
    TWPT: 5,
    TWPTMIS: 2,
    THPT: 3,
    THPTMIS: 0,
    AST: 3,
    BLK: 1,
    STL: 1,
    REB: 8,
    TOV: 0,
    FL: 4,
    FT: 5,
    FTMIS: 1,
  },
};

const run = async () => {
  // console.log(playsByPlayer);

  var Line = clui.Line,
    LineBuffer = clui.LineBuffer;

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
    .column("FG", 9, [clc.cyan])
    .column("FG%", 9, [clc.cyan])
    .column("3PT", 9, [clc.cyan])
    .column("AST", 5, [clc.cyan])
    .column("REB", 5, [clc.cyan])
    .column("BLK", 5, [clc.cyan])
    .column("STL", 5, [clc.cyan])
    .column("FT", 9, [clc.cyan])
    .column("FT%", 9, [clc.cyan])
    .column("FOULS", 5, [clc.cyan])
    .fill()
    .store();

  Object.keys(playsByPlayer).forEach((k) => {
    new Line(outputBuffer)
      .column(k, 12)
      .column((Math.random() * 100).toFixed(1), 9)
      .column((Math.random() * 100).toFixed(1), 9)
      .column((Math.random() * 100).toFixed(1), 9)
      .column((Math.random() * 100).toFixed(1), 5)
      .column((Math.random() * 100).toFixed(1), 5)
      .column((Math.random() * 100).toFixed(1), 5)
      .column((Math.random() * 100).toFixed(1), 5)
      .column((Math.random() * 100).toFixed(1), 9)
      .column((Math.random() * 100).toFixed(1), 9)
      .column((Math.random() * 100).toFixed(1), 5)
      .fill()
      .store();
  });

  outputBuffer.output();
};

run();
