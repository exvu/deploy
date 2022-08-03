import CommandBin from "common-bin";
import path from "path";

export default class Command extends CommandBin {
  constructor(rawArgv?: any) {
    super(rawArgv);
    this.usage = "使用说明: 工具文档 ";
    if (process.env.ENV == "dev") {
      this.add("run", path.join(__dirname, "/cmd/run.ts"));
      this.add("init", path.join(__dirname, "/cmd/init.ts"));
    } else {
      this.load(path.join(__dirname, "/cmd"));
    }

    this.version = "2.0";
  }
  run(context: any) {}
}
