#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require("commander");
var git = require("./utils/git.js");
var file = require("./utils/file.js");
var gcook = require("./utils/gcook.js");
var { MsgFunc } = require("./utils/log.js");
program
  .version("1.0.0")
  .option("-p, --path <string>", "Config.js Path")
  .option("-a, --all", "All message")
  .parse(process.argv);
var configObject = require(program.path);
var msgFunc = new MsgFunc(configObject, program.all);
// 检查数据合法性
if (!msgFunc.configCheck(program.path)) {
  return;
} else {
  configObject.gcook.forEach((item) => {
    item.path = configObject.root + "/" + item.path;
    item.path.replace("//", "/");
  });
}
Promise.all(configObject.gcook.map((config) => batchPublish(config)))
  .then((res) => {
    console.table(res);
    console.log("程序执行结束");
  })
  .catch((error) => {
    console.log("error", error);
  });

function batchPublish(config) {
  return new Promise(async (resolve) => {
    msgFunc.green(`${config.name}发布开始`);
    // 检测是否有未提交的变更
    const hasChanges = await git.hasCodeChanges(config.path);
    if (hasChanges) {
      msgFunc.errorMsgPush(
        "hasChanges",
        config.name,
        `${config.branch}分支，本地有修改，请先提交`
      );
      return resolve({
        name: config.name,
        msg: `Please git commit your changes!`,
      });
    }
    msgFunc.successMsgPush(
      "hasChanges",
      config.name,
      `Nothing need git commit`
    );
    // 获取当前分支名
    msgFunc.infoMsgPush("getBranchName", config.name, `获取当前分支名`);
    const branchName = await git.getBranchName(config.path);
    let branchFlag = branchName.indexOf(config.branch) > -1;
    if (!branchFlag) {
      msgFunc.infoMsgPush(
        "branchChekc",
        config.name,
        `当前分支不正确，尝试自动切换`
      );
      const checkoutFlag = await git.checkout(config);
      if (checkoutFlag) {
        msgFunc.successMsgPush(
          "branchcheckout",
          config.name,
          `成功切换至${config.branch}`
        );
      } else {
        msgFunc.errorMsgPush(
          "branchcheckout",
          config.name,
          `自动切换失败，${config.branch}`
        );
        return resolve({
          name: config.name,
          msg: `当前分支不正确且自动切换失败，请手动切换至${config.branch}`,
        });
      }
    } else {
      // 当前分支是否为目标分支
      msgFunc.successMsgPush("branchChekc", config.name, `分支核对完成`);
    }
    // 读取package.json中的数据
    const package = file.read(`${config.path}/package.json`);
    // 获取此npm包的所有版本号
    msgFunc.infoMsgPush("checkVersions", config.name, `版本合法性检测开始`);
    const versions = await file.getVersions(package.name);
    // 判断当前版本号是否存在
    if (versions.includes(config.version)) {
      msgFunc.errorMsgPush(
        "resultVersions",
        config.name,
        `${config.version}已存在`
      );
      return resolve({
        name: config.name,
        msg: `${config.version} 版本已存在`,
      });
    }
    msgFunc.successMsgPush(
      "resultVersions",
      config.name,
      `${config.version}可用`
    );
    // 判断远端库是否有修改，如果有修改需要手动git pull
    const noChange = await git.diff(config.path, config.branch);
    if (noChange) {
      msgFunc.successMsgPush("diff", config.name, `本地代码无需更新`);
      let commitFlag = true;
      if (package.version !== config.version) {
        // 写入目标版本号，准备执行git commit
        package.version = config.version;
        const writeFlag = await file.write(
          `${config.path}/package.json`,
          JSON.stringify(package, null, 2)
        );
        // 写入完成
        if (writeFlag) {
          msgFunc.successMsgPush("write", config.name, `version写入完成`);
          commitFlag = await git.commit(config);
        } else {
          msgFunc.errorMsgPush("write", config.name, `version写入失败`);
          return resolve({
            name: config.name,
            msg: `package.json写入失败`,
          });
        }
      }
      // git commit 完成准备publish
      // if (commitFlag) {
      //   msgFunc.successMsgPush(
      //     "commit",
      //     config.name,
      //     `git add & git commit 执行成功`
      //   );
      //   msgFunc.warnMsgPush(
      //     "publish",
      //     config.name,
      //     `cook发布较为耗时，请耐心等待...`
      //   );
      //   const command =
      //     config.version.indexOf("beta") > -1 ? "beta" : "publish";
      //   const publishFlag = await gcook.publish(
      //     config.path,
      //     command,
      //     config.name
      //   );
      //   if (publishFlag) {
      //     resolve({
      //       name: config.name,
      //       msg: `发布完成，请及时合并至master`,
      //     });
      //   }
      // } else {
      //   msgFunc.errorMsgPush(
      //     "commit",
      //     config.name,
      //     `git add & git commit 执行失败`
      //   );
      //   resolve({
      //     name: config.name,
      //     msg: `package.git commit 执行失败`,
      //   });
      // }
    } else {
      msgFunc.errorMsgPush("diff", config.name, `请更新本地代码`);
      resolve({
        name: config.name,
        msg: `请更新本地代码`,
      });
    }
  });
}
