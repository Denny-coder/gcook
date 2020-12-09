#!/usr/bin/env node
const { program } = require("commander");
const path = require("path");
const shell = require("shelljs");
const res = (command) => path.resolve(__dirname, "commands", command);
var gcook = require("./utils/gcook.js");

// 定义当前版本
program
  .version(
    require("./package.json").version,
    "-v, --vers",
    "output the current version"
  )
  .arguments("<cmd> [env]")
  .action(function (cmd, env) {
    // const p = path.resolve(
    //   __dirname,
    //   "node_modules",
    //   "@choicefe/gagli",
    //   "bin",
    //   "cook"
    // );
    const args = program.args.join(" ");
    shell.exec(`cook ${args}`, function (code, stdout, stderr) {
      if (stderr) {
        throw stderr;
      }
    });
  });

program.usage("<command>");

program
  .command("batch")
  .requiredOption("-p, --path <string>", "Config.js Path")
  .option("-a, --all", "All message")
  .description("npm包批量发布。。。")
  .action(async (data) => {
    if (await gcook.intercept()) {
      require(res("batchPubilsh.js"))(data);
    }
  });
program
  .command("beta")
  .description("beta 版本发布。。。")
  .action(async (data) => {
    if (await gcook.intercept()) {
      require(res("gcook.js"))("beta");
    }
  });
program
  .command("publish")
  .description("publish 版本发布。。。")
  .action(async (data) => {
    if (await gcook.intercept()) {
      require(res("gcook.js"))("publish");
    }
  });
program.parse(process.argv);
