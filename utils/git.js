const { exec } = require("child_process");

module.exports.commit = async function (config) {
  const commit = config.commit
    ? `${config.commit}${config.version}`
    : `上线封版${config.version}`;
  return new Promise((resolve) => {
    exec(
      `cd ${config.path} && git add ./package.json && git commit -m ${commit}`,
      (error, stdout) => {
        if (error) {
          resolve(false);
        }
        resolve(true);
      }
    );
  });
};
module.exports.diff = async function (path, branch) {
  return new Promise((resolve) => {
    // 通过本地到远程的变更统计来判断本地代码是否是最新代码
    exec(
      `cd ${path} && git diff --stat ${branch}...origin/${branch}`,
      (error, stdout) => {
        if (error || stdout) {
          resolve(false);
        }
        resolve(true);
      }
    );
  });
};
module.exports.hasCodeChanges = async function (path) {
  return new Promise((resolve) => {
    exec(`cd ${path} && git status`, (error, stdout) => {
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
};
module.exports.checkout = async function (config) {
  return new Promise((resolve) => {
    exec(
      `cd ${config.path} && git checkout ${config.branch}`,
      (error, stdout) => {
        if (!error) {
          if (
            stdout.includes("Your branch is up to date with") ||
            stdout.includes("Your branch is ahead of")
          ) {
            resolve(true);
          }
          resolve(false);
        }
        resolve(true);
      }
    );
  });
};
module.exports.getBranchName = async function (path) {
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && git branch --show-current`, function (
      error,
      stdout,
      stderr
    ) {
      if (error) {
        reject(error);
      }
      resolve(stdout.replace(/(\r|\n)/g, ""));
    });
  });
};
