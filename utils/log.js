class MsgFunc {
  constructor(configArray) {
    this.len = configArray.length;
    this.configArray = configArray;
    this.msgMap = {};
  }
  red(msg) {
    console.log("\x1B[31m%s\x1B[0m", msg);
  }
  green(msg) {
    console.log("\x1B[32m%s\x1B[0m", msg);
  }
  white(msg) {
    console.log("\x1B[37m%s\x1B[0m", msg);
  }
  successMsgPush(type, name, msg) {
    if (this.msgMap.hasOwnProperty(type)) {
      this.msgMap[type].push({
        type: "green",
        msg,
        name,
      });
    } else {
      this.msgMap[type] = [
        {
          type: "green",
          msg,
          name,
        },
      ];
    }
    this.printMsg(type);
  }
  infoMsgPush(type, name, msg) {
    if (this.msgMap.hasOwnProperty(type)) {
      this.msgMap[type].push({
        type: "white",
        msg,
        name,
      });
    } else {
      this.msgMap[type] = [
        {
          type: "white",
          msg,
          name,
        },
      ];
    }
    this.printMsg(type);
  }

  errorMsgPush(type, name, msg) {
    if (this.msgMap.hasOwnProperty(type)) {
      this.msgMap[type].push({
        type: "red",
        msg,
        name,
      });
    } else {
      this.msgMap[type] = [
        {
          type: "red",
          msg,
          name,
        },
      ];
    }
    this.printMsg(type);
  }

  printMsg(type) {
    if (this.msgMap[type].length >= this.len) {
      if (this.msgMap[type].some((item) => item.type === "red")) {
        this.len = this.len - 1;
      }
      for (let index = 0; index < this.msgMap[type].length; index++) {
        const element = this.msgMap[type][index];
        let msg = element.name + " " + element.msg;
        if (index === 0) {
          msg = "\n" + element.name + " " + element.msg;
        } else if (index === this.msgMap[type].length) {
          msg = element.name + " " + element.msg + "\n";
        }

        this[element.type](msg);
      }
    }
  }
  configCheck() {
    if (!Array.isArray(this.configArray)) {
      console.error(
        `Please complete the publishing configuration at the ${program.path}`
      );
      return false;
    } else if (
      !this.configArray.every(
        (item) =>
          item.hasOwnProperty("filePath") &&
          item.hasOwnProperty("branch") &&
          item.hasOwnProperty("version") &&
          item.hasOwnProperty("name")
      )
    ) {
      console.log(
        "Please complete the publishing configuration like this: \n",
        JSON.stringify(
          [
            {
              filePath: "scm-merchants-works/npm/scm-components",
              branch: "feat-0919",
              version: "1.8.0",
              name: "@choicefe/scm-components",
            },
          ],
          "",
          "\t"
        )
      );
      return false;
    }
    return true;
  }
}
module.exports.MsgFunc = MsgFunc;
