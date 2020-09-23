#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require("commander");
var git = require("./utils/git.js");
var file = require("./utils/file.js");
var gcook = require("./utils/gcook.js");
var log = require("./utils/log.js");
program
  .version("1.0.0")
  .option("-p, --path <string>", "Config.js Path")
  .parse(process.argv);
var configArray = require(program.path);

configArray.forEach((config) => {
  batchPublish(config);
});

async function batchPublish(config) {
  log.green(`${config.name}发布开始`);
  // 获取当前分支名
  const branchName = await git.getBranchName(config.filePath);
  // 当前分支是否为目标分支
  if (branchName.indexOf(config.branch) > -1) {
    // 检测是否有未提交的变更
    const hasChanges = await git.hasCodeChanges(config.filePath);
    if (hasChanges) {
      log.red("Please git commit your changes!");
      return;
    }
    // 读取package.json中的数据
    const package = file.read(`${config.filePath}/package.json`);
    log.green("1");
    // 获取此npm包的所有版本号
    const versions = await file.getVersions(package.name);
    // 判断当前版本号是否存在
    if (versions.includes(config.version)) {
      log.red(`${config.version} 版本已存在`);
      return;
    }
    log.green("2");
    // 判断远端库是否有修改，如果有修改需要手动git pull
    const noChange = await git.diff(config.filePath, config.branch);
    log.green("3", noChange);
    if (noChange) {
      // 写入目标版本号，准备执行git commit
      package.version = config.version;
      const writeFlag = await file.write(
        `${config.filePath}/package.json`,
        JSON.stringify(package, "", "\t")
      );
      log.green("4");
      // 写入完成
      if (writeFlag) {
        log.green("5");
        const commitFlag = await git.commit(config.filePath, config.version);
        log.green("6");
        // git commit 完成准备publish
        if (commitFlag) {
          log.green("7");
          const command =
            config.version.indexOf("beta") > -1 ? "beta" : "publish";
          log.green("8");
          const publishFlag = await gcook.publish(config.filePath, command);
          log.green("9");
          if (publishFlag) {
            log.green("发布完成，请及时合并至master");
          }
        } else {
          log.red("git commit 执行失败");
        }
      } else {
        log.red("package.json写入失败");
      }
    } else {
      log.red("请更新本地代码");
    }
  } else {
    log.red(`当前分支:${branchName} 目标分支:${config.branch}`);
  }
}
// if (program.path) log.green(program.path);

// async function ckp() {
//   const hasChanges = await hasCodeChanges();
//   log.green(hasChanges);
// }
