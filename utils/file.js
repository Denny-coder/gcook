var fs = require("fs");
const { exec } = require("child_process");

module.exports.read = (path) => {
  console.log(path);
  var _packageJson = fs.readFileSync(path);
  console.log(_packageJson);
  return JSON.parse(_packageJson);
};
module.exports.write = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) return resolve(false);
      resolve(true);
    });
  });
};
module.exports.getVersions = (name) => {
  return new Promise((resolve) => {
    const cp = exec(`npm view ${name} versions -json`, (error, stdout) => {
      if (error) {
        console.error(error);
      }
      resolve(JSON.parse(stdout));
    });
  });
};
