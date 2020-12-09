#!/usr/bin/env node
const { exec } = require("child_process");
const path = require("path");
const { connect } = require("socket.io-client");


async function gcook(command) {
  const hasChanges = await hasCodeChanges();
  if (hasChanges) {
    console.log("Please git commit your changes!");
    return;
  }

  const outs = [];
  
  const cp = exec(`cd ${process.cwd()} && cook ${command}`);

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
}
module.exports = gcook;

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
    const cp = exec("npm view @choicefe/gcook version");
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
}

function getLocalVersion() {
  return require("../package.json").version;
}

async function hasCodeChanges() {
  return new Promise((resolve) => {
    exec("git status", (error, stdout) => {
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
