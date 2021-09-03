import _ from "lodash";
import fs from "fs";
import path from "path";
import touch from "touch";

const getCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

const directoryExists = (filePath) => {
  return fs.existsSync(filePath);
};

const createFile = (dirPath, file) => {
  touch(dirPath + "/" + file);
};

const getDirNameFormat = (dirName) => {
  return _.toLower(dirName.replace(/ /g, "_"));
};

export default {
  getCurrentDirectoryBase,
  directoryExists,
  createFile,
  getDirNameFormat,
};
