import { PlayType } from "./plays.js";

export const Category = {
  PTS: "PTS",
  FG: "FG",
  FGP: "FGP",
  THPT: "THPT",
  THMADE: "THMADE",
  AST: "AST",
  REB: "REB",
  OREB: "OREB",
  BLK: "BLK",
  STL: "STL",
  FT: "FT",
  FTP: "FTP",
  TO: "TO",
  FOUL: "FOUL",
  TIME: "TIME",
};

const getAllStats = (playCounts, sep) => {
  const allStats = {};
  allStats[Category.PTS] = getPts(playCounts);
  allStats[Category.FG] = getFgs(playCounts, sep);
  allStats[Category.FGP] = getFgp(playCounts);
  allStats[Category.THPT] = get3pt(playCounts, sep);
  allStats[Category.THMADE] = get3ptMade(playCounts);
  allStats[Category.AST] = getAst(playCounts);
  allStats[Category.REB] = getReb(playCounts);
  allStats[Category.OREB] = getOreb(playCounts);
  allStats[Category.BLK] = getBlk(playCounts);
  allStats[Category.STL] = getStl(playCounts);
  allStats[Category.FT] = getFts(playCounts, sep);
  allStats[Category.FTP] = getFtp(playCounts);
  allStats[Category.TO] = getTov(playCounts);
  allStats[Category.FOUL] = getFls(playCounts);
  allStats[Category.TIME] = getTimeouts(playCounts);
  return allStats;
};

const getPts = (playCounts) => {
  return (
    (playCounts[PlayType.TWPT] || 0) * 2 +
    (playCounts[PlayType.THPT] || 0) * 3 +
    (playCounts[PlayType.FT] || 0)
  ).toFixed(0);
};

const getFgs = (playCounts, sep) => {
  return (
    (
      (playCounts[PlayType.TWPT] || 0) + (playCounts[PlayType.THPT] || 0)
    ).toFixed(0) +
    sep +
    (
      (playCounts[PlayType.TWPTMI] || 0) +
      (playCounts[PlayType.TWPT] || 0) +
      (playCounts[PlayType.THPT] || 0) +
      (playCounts[PlayType.THPTMI] || 0)
    ).toFixed(0)
  );
};

const getFgp = (playCounts) => {
  return !playCounts[PlayType.TWPTMI] &&
    !playCounts[PlayType.TWPT] &&
    !playCounts[PlayType.THPT] &&
    !playCounts[PlayType.THPTMI]
    ? "--"
    : (
        (((playCounts[PlayType.TWPT] || 0) + (playCounts[PlayType.THPT] || 0)) /
          ((playCounts[PlayType.TWPTMI] || 0) +
            (playCounts[PlayType.TWPT] || 0) +
            (playCounts[PlayType.THPT] || 0) +
            (playCounts[PlayType.THPTMI] || 0))) *
        100.0
      ).toFixed(1);
};

const get3pt = (playCounts, sep) => {
  return (
    (playCounts[PlayType.THPT] || 0).toFixed(0) +
    sep +
    (
      (playCounts[PlayType.THPT] || 0) + (playCounts[PlayType.THPTMI] || 0)
    ).toFixed(0)
  );
};

const get3ptMade = (playCounts) => {
  return (playCounts[PlayType.THPT] || 0).toFixed(0);
};

const getAst = (playCounts) => {
  return (playCounts[PlayType.AST] || 0).toFixed(0);
};

const getReb = (playCounts) => {
  return (
    (playCounts[PlayType.REB] || 0) + (playCounts[PlayType.OREB] || 0)
  ).toFixed(0);
};

const getOreb = (playCounts) => {
  return (playCounts[PlayType.OREB] || 0).toFixed(0);
};

const getBlk = (playCounts) => {
  return (playCounts[PlayType.BLK] || 0).toFixed(0);
};

const getStl = (playCounts) => {
  return (playCounts[PlayType.STL] || 0).toFixed(0);
};

const getFts = (playCounts, sep) => {
  return (
    (playCounts[PlayType.FT] || 0).toFixed(0) +
    sep +
    ((playCounts[PlayType.FT] || 0) + (playCounts[PlayType.FTMI] || 0)).toFixed(
      0
    )
  );
};

const getFtp = (playCounts) => {
  return !playCounts[PlayType.FT] && !playCounts[PlayType.FTMI]
    ? "--"
    : (
        ((playCounts[PlayType.FT] || 0) /
          ((playCounts[PlayType.FT] || 0) + (playCounts[PlayType.FTMI] || 0))) *
        100.0
      ).toFixed(1);
};

const getFls = (playCounts) => {
  return (playCounts[PlayType.FL] || 0).toFixed(0);
};

const getTimeouts = (playCounts) => {
  return !playCounts[PlayType.TIMEOUT]
    ? "--"
    : (playCounts[PlayType.TIMEOUT] || 0).toFixed(0);
};

const getTov = (playCounts) => {
  return (playCounts[PlayType.TOV] || 0).toFixed(0);
};

export default {
  getAllStats,
  getPts,
  getFgs,
  getFgp,
  get3pt,
  getAst,
  getReb,
  getOreb,
  getBlk,
  getStl,
  getFts,
  getFtp,
  getTov,
  getFls,
  getTimeouts,
};
