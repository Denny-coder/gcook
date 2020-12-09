const { exec } = require("child_process");

const getLatestVersion = function (packageName) {
  return new Promise((resolve) => {
    const cp = exec(`npm view ${packageName} version`);
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
};

const getLocalVersion = function () {
  return require("../package.json").version;
};

const gcookUpdate = async function () {
  const latest = await getLatestVersion("@choicefe/gcook");
  const local = getLocalVersion();
  if (latest !== local) {
    console.log(
      `Please install latest version: npm install -g @choicefe/gcook@${latest}`
    );
    return false;
  }
  return true;
};

const cookUpdate = async function () {
  const latest = await getLatestVersion("cook-cli");
  if (latest < "1.4.0") {
    console.log(
      `Please install latest version: npm install -g cook-cli@${latest}`
    );
    return false;
  }
  return true;
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
        resolve([false, error, stdout]);
      }
      resolve([true]);
    });
  });
};
const intercept = async function () {
  const gcookUpdateFlag = await gcookUpdate();
  const cookUpdateFlag = await cookUpdate();
  return gcookUpdateFlag && cookUpdateFlag;
};
module.exports = {
  getLatestVersion,
  getLocalVersion,
  cookUpdate,
  gcookUpdate,
  intercept,
  updateToLatestVersion,
  publish,
};
