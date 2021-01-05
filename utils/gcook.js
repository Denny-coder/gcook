const { exec } = require("child_process");

const getLatestVersion = function (packageName) {
  return new Promise((resolve) => {
    exec(`npm view ${packageName} version`, (error, stdout) => {
      if (error) {
        throw error;
      }
      resolve(stdout.replace(/(\r|\n)/g, ""));
    });
  });
};

const getLocalVersion = function () {
  return require("../package.json").version;
};
const getCookVersion = function () {
  return new Promise((resolve) => {
    const cp = exec(`cook -v`, (error, stdout) => {
      if (error) {
        throw error;
      }
      resolve(stdout.match(/[0-9]*\.[0-9]*\.[0-9]*/));
    });
  });
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
  const latest = await getCookVersion();
  if (latest[0] < "1.4.0") {
    console.log(`Please install latest version: npm install -g cook-cli@1.4.0`);
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
    exec(`cd ${path} && gcook ${command} --no-master -b`, (error, stdout) => {
      if (error || !stdout.includes("发布成功")) {
        resolve([false, error, stdout]);
      }
      resolve([true]);
    });
  });
};
const hasCodeChanges = async function () {
  return new Promise((resolve) => {
    exec("git status", (error, stdout) => {
      if (!error) {
        if (
          stdout.includes("Changes not staged for commit") ||
          stdout.includes("Changes to be committed")
        ) {
          resolve(false);
        }
        resolve(true);
      }
      resolve(false);
    });
  });
};
const diff = function (branch) {
  return new Promise((resolve) => {
    // 通过本地到远程的变更统计来判断本地代码是否是最新代码
    exec(`git diff --stat origin/${branch}`, (error, stdout) => {
      if (error || stdout) {
        resolve([false, error, stdout]);
      }
      resolve([true]);
    });
  });
};
const pull = function (branch) {
  return new Promise((resolve) => {
    const commander = branch ? `git pull origin ${branch}` : `git pull`;
    exec(commander, (error, stdout) => {
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
    });
  });
};
const judgeChangeMaster = async function (branch) {
  const [noChangeMaster, error, stdout] = await diff(branch);
  if (!noChangeMaster) {
    const [pullFlag] = await pull(branch);
    if (!pullFlag) {
      console.error(`拉取远程${branch}失败`);
    }
    return pullFlag;
  }
  return noChangeMaster;
};
const intercept = async function ({ master, batch }) {
  // 是否需要更新gcook
  const gcookUpdateFlag = await gcookUpdate();
  // 是否需要更新cook
  const cookUpdateFlag = await cookUpdate();
  let hasCodeChangesFlag = true;
  let judgeChangeMasterFlag = true;
  let judgeChangeCurrentFlag = true;
  // 来自批量的不需要走以下流程
  if (!batch) {
    hasCodeChangesFlag = await hasCodeChanges();
    // 更新远程分支
    judgeChangeCurrentFlag = await pull();
    if (master) {
      // 更新远程master
      judgeChangeMasterFlag = await judgeChangeMaster("master");
      // judgeChangeMasterFlag = await judgeChangeMaster("master");
    }
  }
  console.log(
    gcookUpdateFlag,
    cookUpdateFlag,
    hasCodeChangesFlag,
    judgeChangeCurrentFlag,
    judgeChangeMasterFlag
  );
  return (
    gcookUpdateFlag &&
    cookUpdateFlag &&
    hasCodeChangesFlag &&
    judgeChangeCurrentFlag &&
    judgeChangeMasterFlag
  );
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
