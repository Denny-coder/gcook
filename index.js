#!/usr/bin/env node
const { exec } = require("child_process");
const { connect } = require("socket.io-client");

(async function cook() {
  const outs = [];

  const command = process.argv.slice(2).join(" ").replace("g", "");

  const cp = exec(command);
  cp.stdout.on("data", async (data) => {
    if (data === "发布完成") {
      const name = await getGitUserName();
      // const branch = await getBranch();

      const io = connect("http://office.choicesaas.cn/choicefe");
      io.emit("update", `${name}#${outs[outs.length - 1]}`);
      io.close();
    } else {
      outs.push(data);
    }
    console.log(data);
  });
})();

async function getGitUserName() {
  return new Promise((resolve) => {
    // const cp = exec(`git log --pretty=format:"作者:%an 更新内容:%s" -1`);
    const cp = exec(`git config user.name`);
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
