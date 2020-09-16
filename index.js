#!/usr/bin/env node
const { fork } = require("child_process");

const command = process.argv.slice(2);

const cp = fork(`${__dirname}/start.js`, command);

cp.on("message", (data) => {
  if (data === "restart") {
    cp.kill();
    fork(`${__dirname}/start.js`, command);
  }
});
