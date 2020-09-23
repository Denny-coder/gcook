module.exports.red = async function (msg) {
  console.log("\x1B[31m%s\x1B[0m", msg);
};
module.exports.green = async function (msg) {
  console.log("\x1B[32m%s\x1B[0m", msg);
};
