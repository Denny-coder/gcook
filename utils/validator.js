var file = require("./file.js");
var gcook = require("./gcook.js");

class Validator {
  constructor({ git, log, config }) {
    this.git = git; // git操作
    this.log = log; // 日志操作
    this.config = config; // 日志操作
    this.strategy = []; // 所有的策略
    this.info = null; // 程序执行信息
    this.packageData = {}; // package.json内容
  }
  async judgeCodeStatus() {
    const [hasChanges, error, stdout] = await this.git.hasCodeChanges();
    if (hasChanges) {
      this.log.errorMsgPush(
        "judgeCodeStatus",
        this.config.name,
        `${this.config.branch}分支，本地有修改，请先提交`
      );
      return {
        name: this.config.name,
        msg: `Please git commit your changes!`,
        error,
        stdout,
      };
    }
    this.log.successMsgPush(
      "judgeCodeStatus",
      this.config.name,
      `Nothing need git commit`
    );
  }
  async judgeBranchName() {
    // 获取当前分支名
    this.log.infoMsgPush("getBranchName", this.config.name, `获取当前分支名`);
    const [branchName] = await this.git.getBranchName();
    let branchFlag = branchName === this.config.branch;
    if (!branchFlag) {
      this.log.infoMsgPush(
        "branchjudgeBranchNameCheck",
        this.config.name,
        `当前分支不正确，尝试自动切换`
      );
      const [checkoutFlag] = await this.git.checkout();
      if (checkoutFlag) {
        this.log.successMsgPush(
          "branchCheckout",
          this.config.name,
          `成功切换至${this.config.branch}`
        );
      } else {
        this.log.errorMsgPush(
          "branchCheckout",
          this.config.name,
          `自动切换失败，${this.config.branch}`
        );
        return {
          name: this.config.name,
          msg: `当前分支不正确且自动切换失败，请手动切换至${this.config.branch}`,
        };
      }
    } else {
      // 当前分支是否为目标分支
      this.log.successMsgPush(
        "judgeBranchName",
        this.config.name,
        `分支核对完成`
      );
    }
  }
  async judgeChangeCurrent() {
    // 判断远端库是否有修改
    const [noChange] = await this.git.diff();
    if (noChange) {
      this.log.successMsgPush(
        "diffCurrent",
        this.config.name,
        `本地代码无需更新`
      );
    } else {
      // 自动git pull
      this.log.errorMsgPush(
        "diffCurrent",
        this.config.name,
        `尝试更新远程代码`
      );
      const [pullFlag, error, stdout] = await this.git.pull();
      if (pullFlag) {
        this.log.successMsgPush(
          "pullCurrent",
          this.config.name,
          `远程代码拉取完成`
        );
      } else {
        this.log.errorMsgPush(
          "pullCurrent",
          this.config.name,
          `git pull执行失败`
        );
        return {
          name: this.config.name,
          msg: `git pull执行失败`,
          error,
          stdout,
        };
      }
    }
  }
  async judgeChangeMaster(masterBranch) {
    // 判断master远端库是否有修改
    const [noChangeMaster] = await this.git.diff(masterBranch);
    if (noChangeMaster) {
      this.log.successMsgPush(
        "diffMaster",
        this.config.name,
        `本地代码无需更新${masterBranch}`
      );
    } else {
      // 自动git pull
      this.log.infoMsgPush(
        "diffMaster",
        this.config.name,
        `尝试更新${masterBranch}远程代码`
      );
      const [pullFlag, error, stdout] = await this.git.pull(masterBranch);
      if (pullFlag) {
        this.log.successMsgPush(
          "pullMaster",
          this.config.name,
          `${masterBranch}远程代码拉取完成`
        );
      } else {
        this.log.errorMsgPush(
          "pullMaster",
          this.config.name,
          `git pull origin ${masterBranch}执行失败,请查看本地代码`
        );
        return {
          name: this.config.name,
          msg: `git pull origin ${masterBranch}执行失败,请查看本地代码`,
          error,
          stdout,
        };
      }
    }
  }
  async judgeVersion() {
    // 读取package.json中的数据
    this.packageData = file.read(`${this.config.path}/package.json`);
    // 获取此npm包的所有版本号
    this.log.infoMsgPush(
      "checkVersions",
      this.config.name,
      `版本合法性检测开始`
    );
    const versions = await file.getVersions(this.packageData.name);
    // 判断当前版本号是否存在
    if (versions.includes(this.config.version)) {
      this.log.errorMsgPush(
        "resultVersions",
        this.config.name,
        `${this.config.version}已存在`
      );
      return {
        name: this.config.name,
        msg: `${this.config.version} 版本已存在`,
      };
    }
    this.log.successMsgPush(
      "resultVersions",
      this.config.name,
      `${this.config.version}可用`
    );
  }
  async updateVersion() {
    if (this.packageData.version !== this.config.version) {
      // 写入目标版本号，准备执行git commit
      this.packageData.version = this.config.version;
      const [writeFlag, errorWrite] = await file.write(
        `${this.config.path}/package.json`,
        JSON.stringify(this.packageData, null, 2)
      );
      // 写入完成
      if (writeFlag) {
        this.log.successMsgPush("write", this.config.name, `version写入完成`);
        const [commitFlag, error, stdout] = await this.git.commit();
        if (commitFlag) {
          this.log.successMsgPush(
            "commit",
            this.config.name,
            `git add & git commit 执行成功`
          );
        } else {
          this.log.errorMsgPush(
            "commit",
            config.name,
            `git add & git commit 执行失败`
          );
          return {
            name: this.config.name,
            msg: `package.git commit 执行失败`,
            error,
            stdout,
          };
        }
      } else {
        this.log.errorMsgPush("write", this.config.name, `version写入失败`);
        return {
          error: errorWrite,
          name: this.config.name,
          msg: `package.json写入失败`,
        };
      }
    }
  }

  async publishCook(masterBranch) {
    this.log.warnMsgPush(
      "publishCook",
      this.config.name,
      `cook发布较为耗时，请耐心等待...`
    );
    const command =
      this.config.version.indexOf("beta") > -1 ? "beta" : "publish";
    const [publishFlag, error, stdout] = await gcook.publish(
      this.config.path,
      command,
      this.config.name
    );
    if (publishFlag) {
      this.log.successMsgPush(
        "publishCook",
        this.config.name,
        `发布完成，开始手动推送至${masterBranch}`
      );
    } else {
      this.log.errorMsgPush("publishCook", this.config.name, `组件发布失败`);
      return {
        name: this.config.name,
        msg: `组件发布失败`,
        error,
        stdout,
      };
    }
  }
  async pushPublished() {
    const [pushFlag, error, stdout] = await this.git.push();
    if (pushFlag) {
      this.log.successMsgPush(
        "pushCurrent",
        this.config.name,
        `远程代码推送完成`
      );
    } else {
      this.log.errorMsgPush(
        "pushCurrent",
        this.config.name,
        `git push执行失败`
      );
      return {
        name: this.config.name,
        msg: `git push执行失败`,
        error,
        stdout,
      };
    }
  }
  async checkoutMaster(masterBranch) {
    const [checkoutMaster, error, stdout] = await this.git.checkout(
      masterBranch
    );
    if (checkoutMaster) {
      this.log.successMsgPush(
        "branchcheckoutMaster",
        this.config.name,
        `成功切换至${masterBranch}`
      );
    } else {
      this.log.errorMsgPush(
        "branchcheckoutMaster",
        this.config.name,
        `自动切换失败，${masterBranch}`
      );
      return {
        name: this.config.name,
        msg: `自动切换失败，请手动切换至${masterBranch}`,
        error,
        stdout,
      };
    }
  }
  async mergeToMaster() {
    const [mergeFlag, error, stdout] = await this.git.merge();
    if (mergeFlag) {
      this.log.successMsgPush(
        "mergeFlag",
        this.config.name,
        `merge${this.config.branch}成功`
      );
    } else {
      this.log.errorMsgPush(
        "mergeFlag",
        this.config.name,
        `merge${this.config.branch}失败`
      );
      return {
        name: this.config.name,
        msg: `merge${this.config.branch}失败`,
        error,
        stdout,
      };
    }
  }
  async mergeToMaster() {
    const [mergeFlag, error, stdout] = await this.git.merge();
    if (mergeFlag) {
      this.log.successMsgPush(
        "mergeFlag",
        this.config.name,
        `merge${this.config.branch}成功`
      );
    } else {
      this.log.errorMsgPush(
        "mergeFlag",
        this.config.name,
        `merge${this.config.branch}失败`
      );
      return {
        name: this.config.name,
        msg: `merge${this.config.branch}失败`,
        error,
        stdout,
      };
    }
  }
  async pushMater(masterBranch) {
    const [pushMasterFlag, error, stdout] = await this.git.push(masterBranch);
    if (pushMasterFlag) {
      this.log.successMsgPush(
        "pushMasterFlag",
        this.config.name,
        `已合并至${masterBranch}`
      );
      return {
        name: this.config.name,
        msg: `${this.config.version}发布完成`,
      };
    } else {
      this.log.errorMsgPush(
        "pushMasterFlag",
        this.config.name,
        `push至${masterBranch}失败`
      );
      return {
        name: this.config.name,
        msg: `push至${masterBranch}失败`,
        error,
        stdout,
      };
    }
  }

  add(strategyName, args) {
    this.strategy.push({ strategyName, args });
  }
  async start() {
    for (let index = 0; index < this.strategy.length; index++) {
      const strategy = this.strategy[index];
      if (typeof this[strategy.strategyName] === "function") {
        const info = await this[strategy.strategyName](strategy.args);
        if (info) {
          this.info = info;
          break;
        }
      }
    }
    return this.info;
  }
}

module.exports.Validator = Validator;
