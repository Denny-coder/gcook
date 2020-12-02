const { exec } = require('child_process');
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
  pull() {
    return new Promise((resolve) => {
      // 通过本地到远程的变更统计来判断本地代码是否是最新代码
      exec(
        `cd ${this.config.path} && git pull origin ${this.config.branch}`,
        (error, stdout) => {
          if (error || stdout) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }
  hasCodeChanges() {
    return new Promise((resolve) => {
      exec(`cd ${this.config.path} && git status`, (error, stdout) => {
        if (!error) {
          if (
            stdout.includes('Changes not staged for commit') ||
            stdout.includes('Changes to be committed')
          ) {
            resolve(true);
          }
          resolve(false);
        }
        resolve(true);
      });
    });
  }
  checkout() {
    return new Promise((resolve) => {
      exec(
        `cd ${this.config.path} && git checkout ${this.config.branch}`,
        (error, stdout) => {
          if (!error) {
            if (
              stdout.includes('Your branch is up to date with') ||
              stdout.includes('Your branch is ahead of')
            ) {
              resolve(true);
            }
            resolve(false);
          }
          resolve(true);
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
          resolve(stdout.replace(/(\r|\n)/g, ''));
        }
      );
    });
  }
}
module.exports.Git = Git;
