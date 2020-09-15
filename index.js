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
