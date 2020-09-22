#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require("commander");
var git = require("./utils/git.js");
var file = require("./utils/file.js");
program
  .version("1.0.0")
  .requiredOption("-p, --path <string>", "Config.js Path")
  .parse(process.argv);
var configArray = require(program.path);

configArray.forEach((config) => {
  batchPublish(config);
});

async function batchPublish(config) {
  console.log(1);
  const branchName = await git.getBranchName(config.filePath);
  if (branchName.indexOf(config.branch) > -1) {
    const package = file.read(`${config.filePath}/package.json`);
    const versions = await file.getVersions(package.name);
    if (versions.includes(config.version)) {
      console.log(`${config.version} 版本已存在`);
      return;
    }
    const hasChanges = await git.hasCodeChanges(config.filePath);
    if (hasChanges) {
      console.log("Please git commit your changes!");
      return;
    }
    package.version = config.version;
    const writeFlag = await file.write(
      `${config.filePath}/package.json`,
      JSON.stringify(package, "", "\t")
    );
    if (writeFlag) {
      const addFlag = await git.add(config.filePath, config.version);
      console.log("addFlag", addFlag);
    }
  }
}
// if (program.path) console.log(program.path);

// async function ckp() {
//   const hasChanges = await hasCodeChanges();
//   console.log(hasChanges);
// }
