#!/usr/bin/env node

/**
 * Module dependencies.
 */

var { Git } = require("../utils/git.js");
var file = require("../utils/file.js");
var gcook = require("../utils/gcook.js");
var { Log } = require("../utils/log.js");
const masterBranch = "feat-release-1130-test";
function batchPubilsh(program) {
  var configObject = require(program.path);
  var msgFunc = new Log(configObject, program.all);
  // 检查数据合法性
  if (!msgFunc.configCheck(program.path)) {
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
      msgFunc.green(`${config.name}发布开始`);
      // 检测是否有未提交的变更
      const hasChanges = await git.hasCodeChanges();
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
      const branchName = await git.getBranchName();
      let branchFlag = branchName.indexOf(config.branch) > -1;
      if (!branchFlag) {
        msgFunc.infoMsgPush(
          "branchCheck",
          config.name,
          `当前分支不正确，尝试自动切换`
        );
        const checkoutFlag = await git.checkout();
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
        msgFunc.successMsgPush("branchCheck", config.name, `分支核对完成`);
      }
      // 判断远端库是否有修改
      const noChange = await git.diff();
      if (noChange) {
        msgFunc.successMsgPush("diffCurrent", config.name, `本地代码无需更新`);
      } else {
        // 自动git pull
        msgFunc.errorMsgPush("diffCurrent", config.name, `尝试更新远程代码`);
        const pullFlag = await git.pull();
        if (pullFlag) {
          msgFunc.successMsgPush(
            "pullCurrent",
            config.name,
            `远程代码拉取完成`
          );
        } else {
          msgFunc.errorMsgPush("pullCurrent", config.name, `git pull执行失败`);
          return resolve({
            name: config.name,
            msg: `git pull执行失败`,
          });
        }
      }
      // 判断master远端库是否有修改
      const noChangeMaster = await git.diff(masterBranch);
      if (noChangeMaster) {
        msgFunc.successMsgPush("diffMaster", config.name, `本地代码无需更新`);
      } else {
        // 自动git pull
        msgFunc.infoMsgPush(
          "diffMaster",
          config.name,
          `尝试更新master远程代码`
        );
        const pullFlag = await git.pull(masterBranch);
        if (pullFlag) {
          msgFunc.successMsgPush(
            "pullMaster",
            config.name,
            `master远程代码拉取完成`
          );
        } else {
          msgFunc.errorMsgPush(
            "pullMaster",
            config.name,
            `git pull origin ${masterBranch}执行失败,请查看本地代码`
          );
          return resolve({
            name: config.name,
            msg: `git pull origin ${masterBranch}执行失败,请查看本地代码`,
          });
        }
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
          commitFlag = await git.commit();
        } else {
          msgFunc.errorMsgPush("write", config.name, `version写入失败`);
          return resolve({
            name: config.name,
            msg: `package.json写入失败`,
          });
        }
      }
      // git commit 完成准备publish
      if (commitFlag) {
        msgFunc.successMsgPush(
          "commit",
          config.name,
          `git add & git commit 执行成功`
        );
        msgFunc.warnMsgPush(
          "publish",
          config.name,
          `cook发布较为耗时，请耐心等待...`
        );
        const command =
          config.version.indexOf("beta") > -1 ? "beta" : "publish";
        const publishFlag = await gcook.publish(
          config.path,
          command,
          config.name
        );
        if (publishFlag) {
          msgFunc.successMsgPush(
            "publish",
            config.name,
            `发布完成，开始手动推送至${masterBranch}`
          );
          const pullFlag = await git.pull();
          if (pullFlag) {
            msgFunc.successMsgPush(
              "pullCurrent",
              config.name,
              `远程代码推送完成`
            );
          } else {
            msgFunc.errorMsgPush(
              "pullCurrent",
              config.name,
              `git push执行失败`
            );
            return resolve({
              name: config.name,
              msg: `git push执行失败`,
            });
          }
          const checkoutMaster = await git.checkout(masterBranch);
          if (checkoutMaster) {
            msgFunc.successMsgPush(
              "branchcheckoutMaster",
              config.name,
              `成功切换至${masterBranch}`
            );
          } else {
            msgFunc.errorMsgPush(
              "branchcheckoutMaster",
              config.name,
              `自动切换失败，${masterBranch}`
            );
            return resolve({
              name: config.name,
              msg: `自动切换失败，请手动切换至${masterBranch}`,
            });
          }
          const mergeFlag = await git.merge();
          if (mergeFlag) {
            msgFunc.successMsgPush(
              "mergeFlag",
              config.name,
              `merge${config.branch}成功`
            );
          } else {
            msgFunc.errorMsgPush(
              "mergeFlag",
              config.name,
              `merge${config.branch}失败`
            );
            return resolve({
              name: config.name,
              msg: `merge${config.branch}失败`,
            });
          }
          const pushMasterFlag = await git.push(masterBranch);
          if (pushMasterFlag) {
            msgFunc.successMsgPush(
              "pushMasterFlag",
              config.name,
              `已合并至${masterBranch}`
            );
          } else {
            msgFunc.errorMsgPush(
              "pushMasterFlag",
              config.name,
              `push至${masterBranch}失败`
            );
            return resolve({
              name: config.name,
              msg: `push至${masterBranch}失败`,
            });
          }
          resolve({
            name: config.name,
            msg: `${config.version}发布完成`,
          });
        }
      } else {
        msgFunc.errorMsgPush(
          "commit",
          config.name,
          `git add & git commit 执行失败`
        );
        resolve({
          name: config.name,
          msg: `package.git commit 执行失败`,
        });
      }
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
}
module.exports = batchPubilsh;
