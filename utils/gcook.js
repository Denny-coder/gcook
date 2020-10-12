const { exec } = require("child_process");

module.exports.getLatestVersion = async function () {
  return new Promise((resolve) => {
    const cp = exec("npm view gcook version");
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
};

module.exports.getLocalVersion = function () {
  return require("./package.json").version;
};

module.exports.updateToLatestVersion = async function () {
  const cp = exec(`npx --ignore-existing gcook ${command.join(" ")}`);
  cp.stdout.on("data", (data) => {
    console.log(data);
  });
  cp.stdout.on("end", () => {
    //
  });
};
module.exports.publish = async function (path, command, name) {
  return new Promise((resolve) => {
    exec(`cd ${path} && gcook ${command}`, (error, stdout) => {
      if (error || !stdout.includes("发布成功")) {
        resolve(false);
      }
      resolve(true);
    });
  });
};
