const { exec } = require("child_process");

module.exports.commit = async function (path, version) {
  return new Promise((resolve) => {
    exec(
      `cd ${path} && git add ./package.json && git commit -m 上线封版${version}`,
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
    exec(
      `cd ${path} && git diff ${branch}..origin/${branch}`,
      (error, stdout) => {
        console.log(`cd ${path} && git diff ${branch}..origin/${branch}`);
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
module.exports.getBranchName = async function (path) {
  return new Promise((resolve, reject) => {
    const projectPath = exec(
      `cd ${path} && git branch --show-current`,
      function (error, stdout, stderr) {
        if (error) {
          reject(error);
        }
        resolve(stdout.replace(/(\r|\n)/g, ""));
      }
    );
  });
};
