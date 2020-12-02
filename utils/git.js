const { exec } = require("child_process");
class Git {
  constructor(config) {
    this.config = config;
  }
  commit() {
    const commit = this.config.commit
      ? `${this.config.commit}${this.config.version}`
      : `上线封版${this.config.version}`;
    return new Promise((resolve) => {
      exec(
        `cd ${this.config.path} && git add ./package.json && git commit -m ${commit}`,
        (error, stdout) => {
          if (error) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }
  diff(branch) {
    return new Promise((resolve) => {
      const target = branch || this.config.branch;
      // 通过本地到远程的变更统计来判断本地代码是否是最新代码
      exec(
        `cd ${this.config.path} && git diff --stat ${this.config.branch}...origin/${target}`,
        (error, stdout) => {
          if (error || stdout) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }
  pull(branch) {
    return new Promise((resolve) => {
      // 拉去远程代码
      const target = branch || this.config.branch;
      exec(
        `cd ${this.config.path} && git pull origin ${target}`,
        (error, stdout) => {
          console.log(error);
          console.log(stdout);
          if (!error) {
            if (
              stdout.includes("Already up to date") ||
              stdout.includes("Fast-forward") ||
              stdout.includes("Merge made by the 'recursive' strategy")
            ) {
              resolve(true);
            }
            resolve(false);
          }
          resolve(false);
        }
      );
    });
  }
  push(branch) {
    return new Promise((resolve) => {
      // 拉取远程代码
      const target = branch || this.config.branch;
      exec(
        `cd ${this.config.path} && git push origin ${target}`,
        (error, stdout) => {
          console.log(error);
          console.log(stdout);
          if (error || stdout) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }
  merge(branch) {
    return new Promise((resolve) => {
      // 拉取远程代码
      const target = branch || this.config.branch;
      exec(`cd ${this.config.path} && git merge ${target}`, (error, stdout) => {
        console.log(error);
        console.log(stdout);
        if (!error) {
          if (
            stdout.includes("Fast-forward") ||
            stdout.includes("Already up to date.")
          ) {
            resolve(true);
          }
          resolve(false);
        }
        resolve(false);
      });
    });
  }
  hasCodeChanges() {
    return new Promise((resolve) => {
      exec(`cd ${this.config.path} && git status`, (error, stdout) => {
        if (!error) {
          if (
            stdout.includes("Changes not staged for commit") ||
            stdout.includes("Changes to be committed")
          ) {
            resolve(true);
          }
          resolve(false);
        }
        resolve(true);
      });
    });
  }
  checkout(branch) {
    return new Promise((resolve) => {
      // 拉取远程代码
      const target = branch || this.config.branch;
      exec(
        `cd ${this.config.path} && git checkout ${target}`,
        (error, stdout) => {
          console.log(error);
          console.log(stdout);
          if (!error) {
            if (
              stdout.includes("Already on") ||
              stdout.includes("Your branch is behind") ||
              stdout.includes("Your branch is ahead of") ||
              stdout.includes("Your branch is up to date with")
            ) {
              resolve(true);
            }
            resolve(false);
          }
          resolve(false);
        }
      );
    });
  }
  getBranchName() {
    return new Promise((resolve, reject) => {
      exec(
        `cd ${this.config.path} && git branch --show-current`,
        function (error, stdout, stderr) {
          if (error) {
            reject(error);
          }
          resolve(stdout.replace(/(\r|\n)/g, ""));
        }
      );
    });
  }
}
module.exports.Git = Git;
