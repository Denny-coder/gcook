const { exec } = require("child_process");

const getLatestVersion = function () {
  return new Promise((resolve) => {
    const cp = exec("npm view @choicefe/gcook version");
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
};

const getLocalVersion = function () {
  return require("../package.json").version;
};
const needUpdate = async function () {
  const latest = await getLatestVersion();
  const local = getLocalVersion();
  if (latest !== local) {
    console.log(
      `Please install latest version: npm install -g @choicefe/gcook@${latest}`
    );
    return true;
  }
  return false;
};

const updateToLatestVersion = async function () {
  const cp = exec(`npx --ignore-existing gcook ${command.join(" ")}`);
  cp.stdout.on("data", (data) => {
    console.log(data);
  });
  cp.stdout.on("end", () => {
    //
  });
};
const publish = async function (path, command, name) {
  return new Promise((resolve) => {
    exec(`cd ${path} && gcook ${command}`, (error, stdout) => {
      if (error || !stdout.includes("发布成功")) {
        resolve(false);
      }
      resolve(true);
    });
  });
};
module.exports = {
  getLatestVersion,
  getLocalVersion,
  needUpdate,
  updateToLatestVersion,
  publish,
};
