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
  console.log("1");
  if (branchName.indexOf(config.branch) > -1) {
    const package = file.read(`${config.filePath}/package.json`);
    console.log("7");
    const versions = await file.getVersions(package.name);
    console.log(versions);

    if (versions.includes(config.version)) {
      console.error(`${config.version} 版本已存在`);
      return;
    }
    console.log("3");

    const hasChanges = await git.hasCodeChanges(config.filePath);
    if (hasChanges) {
      console.error("Please git commit your changes!");
      return;
    }
    console.log("4");
    const diffFlag = await git.diff(config.filePath, config.branch);
    if (!diffFlag) {
      package.version = config.version;
      const writeFlag = await file.write(
        `${config.filePath}/package.json`,
        JSON.stringify(package, "", "\t")
      );
      if (writeFlag) {
        // const commitFlag = await git.commit(config.filePath, config.version);
      }
    }
  } else {
    console.log(config.branch);
  }
}
// if (program.path) console.log(program.path);

// async function ckp() {
//   const hasChanges = await hasCodeChanges();
//   console.log(hasChanges);
// }
