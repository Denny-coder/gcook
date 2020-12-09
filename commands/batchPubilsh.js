#!/usr/bin/env node

/**
 * Module dependencies.
 */

var { Git } = require("../utils/git.js");
var { Log } = require("../utils/log.js");
const path = require("path");
var file = require("../utils/file.js");
var { Validator } = require("../utils/validator.js");
const masterBranch = "master";
// const masterBranch = "feat-release-1130-test";
function batchPubilsh(program) {
  var configObject = require(program.path);
  var log = new Log(configObject, program.all);
  // 检查数据合法性
  if (!log.configCheck(program.path)) {
    return;
  }
  if (configObject.root) {
    configObject.gcook.forEach((item) => {
      item.path = configObject.root + "/" + item.path;
      item.path.replace("//", "/");
    });
  }
  function batchPublish(config) {
    return new Promise(async (resolve) => {
      var git = new Git(config);
      var validator = new Validator({ git, log, config });
      log.green(`${config.name}发布开始`);
      validator.add("judgeVersion");
      validator.add("judgeCodeStatus");
      validator.add("judgeBranchName");
      validator.add("judgeChangeCurrent");
      validator.add("judgeChangeMaster", masterBranch);
      validator.add("updateVersion");
      validator.add("publishCook", masterBranch);
      validator.add("pushPublished");
      validator.add("checkoutMaster", masterBranch);
      validator.add("mergeToMaster");
      validator.add("pushMater", masterBranch);
      const info = await validator.start();
      resolve(info);
    });
  }
  Promise.all(configObject.gcook.map((config) => batchPublish(config)))
    .then((result) => {
      console.table(
        result
          .filter((item) => item)
          .map((item) => ({ name: item.name, msg: item.msg }))
      );
      try {
        const logPath = path.resolve(__dirname, "..", "log.json");
        file.write(logPath, JSON.stringify({ log, result }, null, 2));
        console.log("相关日志可参考:" + logPath);
      } catch (error) {
        console.error(error);
      }
      console.log("程序执行结束");
    })
    .catch((error) => {
      console.log("error", error);
    });
}
module.exports = batchPubilsh;
