#!/usr/bin/env node
const { exec } = require("child_process");
const path = require("path");
const { connect } = require("socket.io-client");

const command = process.argv.slice(2);

(async function cook() {
  const hasChanges = await hasCodeChanges();
  if (hasChanges) {
    console.log("Please git commit your changes!");
    return;
  }

  const latest = await getLatestVersion();
  const local = getLocalVersion();

  if (latest !== local) {
    console.log(`Please install latest version: npm install -g gcook@${latest} --registry=http://registry.npmjs.org`);
    return;
  }

  const outs = [];

  const p = path.resolve(__dirname, "node_modules", "gagli", "bin", "cook");

  const cp = exec(`cd ${process.cwd()} && node ${p} ${command}`);

  cp.stdout.on("data", (data) => {
    outs.push(data);
    console.log(data);
  });

  cp.stdout.on("end", async () => {
    if (outs.length === 0) {
      console.log("Try again!");
      return;
    }

    if (outs[outs.length - 1].indexOf("发布成功") === -1) {
      return;
    }
    const info = await getGitInfo();
    const branch = await getBranch();
    const [author, commit] = info.split("#");

    const out = outs[outs.length - 2];
    const [name, version] = out.replace("+ ", "").split(/@(?=\d)/);

    const io = connect("http://office.choicesaas.cn/choicefe");
    io.emit("update", `${author}#${name}#${version}#${branch}#${commit}`);

    setTimeout(() => {
      io.close();
    }, 1000);
  });
})();

async function getGitInfo() {
  return new Promise((resolve) => {
    const cp = exec(`git log --pretty=format:"%an#%s" -1`);
    cp.stdout.on("data", (data) => {
      resolve(data);
    });
  });
}

async function getBranch() {
  return new Promise((resolve) => {
    const cp = exec("git branch");
    cp.stdout.on("data", (data) => {
      const branch = data
        .split("\n")
        .filter((b) => b.startsWith("*"))
        .join("")
        .replace("* ", "");
      resolve(branch);
    });
  });
}

async function getLatestVersion() {
  return new Promise((resolve) => {
    const cp = exec("npm view gcook version");
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
}

function getLocalVersion() {
  return require("./package.json").version;
}

async function hasCodeChanges() {
  return new Promise((resolve) => {
    exec("git status", (error, stdout) => {
      if (!error) {
        if (stdout.includes("Changes not staged for commit") || stdout.includes("Changes to be committed")) {
          resolve(true);
        }
        resolve(false);
      }
      resolve(true);
    });
  });
}

async function installGagli() {
  return new Promise((resolve) => {
    console.log("npm install -g cook");
    const cp = exec("npm install -g gagli");

    cp.stdout.on("data", (data) => {
      console.log(data);
    });

    cp.stdout.on("error", (data) => {
      resolve(false);
    });

    cp.stdout.on("end", async () => {
      resolve(true);
    });
  });
}
