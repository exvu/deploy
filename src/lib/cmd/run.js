"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_bin_1 = __importDefault(require("common-bin"));
const deploy_1 = __importDefault(require("../deploy"));
class RunCommand extends common_bin_1.default {
    constructor(rawArgv) {
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
    run(context) {
        new deploy_1.default(context).start();
    }
}
exports.default = RunCommand;
