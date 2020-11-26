class MsgFunc {
  constructor(configObject, allMsg) {
    this.configObject = configObject;
    this.allMsg = allMsg;
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
  cyan(msg) {
    console.log("\x1B[36m%s\x1B[0m", msg);
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
  warnMsgPush(type, name, msg) {
    if (this.msgMap.hasOwnProperty(type)) {
      this.msgMap[type].push({
        type: "cyan",
        msg,
        name,
      });
    } else {
      this.msgMap[type] = [
        {
          type: "cyan",
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
        if (this.allMsg || element.type === "red" || element.type === "cyan") {
          this[element.type](msg);
        }
      }
    }
  }
  configCheck(path) {
    if (
      Object.prototype.toString.call(this.configObject) !== "[object Object]" ||
      !Array.isArray(this.configObject.gcook)
    ) {
      console.error(
        `Please complete the publishing configuration at the ${path}`
      );
      return false;
    } else if (
      !this.configObject.gcook.every(
        (item) =>
          item.hasOwnProperty("path") &&
          item.hasOwnProperty("branch") &&
          item.hasOwnProperty("version") &&
          item.hasOwnProperty("name")
      )
    ) {
      console.log(
        "Please complete the publishing configuration like this: \n",
        JSON.stringify(
          {
            root: "E:/works/chenSen/scm-merchants-works/npm",
            gcook: [
              {
                path: "scm-permission",
                branch: "feat-0919",
                version: "1.9.0",
                name: "@choicefe/scm-permission",
              },
            ],
          },
          "",
          "\t"
        )
      );
      return false;
    }
    this.len = this.configObject.gcook.length;
    return true;
  }
}
module.exports.MsgFunc = MsgFunc;
