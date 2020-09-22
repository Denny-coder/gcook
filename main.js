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
  const branchName = await git.getBranchName(config.filePath);
  if (branchName.indexOf(config.branch) > -1) {
    const hasChanges = await git.hasCodeChanges(config.filePath);
    if (hasChanges) {
      console.log("Please git commit your changes!");
      return;
    }
    const package = file.read(`${config.filePath}/package.json`);
    const versions = await file.getVersions(package.name);
    console.log(typeof versions);
  }
}
// if (program.path) console.log(program.path);

// async function ckp() {
//   const hasChanges = await hasCodeChanges();
//   console.log(hasChanges);
// }
