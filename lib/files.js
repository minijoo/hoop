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
  touch(dirPath + file);
};

export default { getCurrentDirectoryBase, directoryExists, createFile };
