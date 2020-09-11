#!/usr/bin/env node
const { exec } = require("child_process");
const { connect } = require("socket.io-client");

(async function cook() {
  const outs = [];

  const command = process.argv.slice(2);

  const cp = exec(`cd ${process.cwd()} && cook ${command}`);

  cp.stdout.on("data", (data) => {
    outs.push(data);
    console.log(data);
  });

  cp.stdout.on("end", async () => {
    const name = await getGitUserName();

    const io = connect("http://office.choicesaas.cn/choicefe");
    io.emit("update", `${name} #${outs[outs.length - 2]}`);

    setTimeout(() => {
      io.close();
    }, 1000);
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
