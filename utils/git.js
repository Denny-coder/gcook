const { exec } = require("child_process");

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
        resolve(stdout);
      }
    );
  });
};
