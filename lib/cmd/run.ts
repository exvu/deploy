import CommandBin from "common-bin";
import Deploy from "../deploy";
export default class RunCommand extends CommandBin {
  constructor(rawArgv?: any) {
    super(rawArgv);
    this.usage = "使用说明: 部署代码文档 ";
    this.options = {
      config: {
        description: "配置文件",
        type: "string",
        alias: "c",
      },
    };
  }
  get description() {
    return "发布项目";
  }
  run(context: any) {
    new Deploy(context).start();
  }
}
