var fs = require("fs");
const { exec } = require("child_process");

module.exports.read = (path) => {
  var _packageJson = fs.readFileSync(path);
  return JSON.parse(_packageJson);
};
module.exports.getVersions = (name) => {
  return new Promise((resolve) => {
    const cp = exec(`npm view ${name} versions`);
    cp.stdout.on("data", (version) => {
      resolve(version.replace(/(\r|\n)/g, ""));
    });
  });
};
