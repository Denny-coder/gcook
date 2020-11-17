#!/usr/bin/env node
const { program } = require("commander");
const { resolve,normalize } = require("path");
const res = (command) => resolve(__dirname, "commands", command);

// 定义当前版本
program.version(
  require("./package.json").version,
  "-v, --vers",
  "output the current version"
);

program.usage("<command>");

program
  .command("batch")
  .requiredOption("-p, --path <string>", "Config.js Path")
  .option("-a, --all", "All message")
  .description("组件开发调试。。。")
  .action((data) => {
    require(res("batchPubilsh.js"))(data);
  });
program
  .command("beta")
  .description("beta 版本发布。。。")
  .action((data) => {
    require(res("gcook.js"))("beta");
  });
program
  .command("publish")
  .description("publish 版本发布。。。")
  .action((data) => {
    require(res("gcook.js"))("publish");
  });
  // console.log(process.argv)
program.parse(process.argv);
