"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_bin_1 = __importDefault(require("common-bin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class InitCommand extends common_bin_1.default {
    constructor(rawArgv) {
        super(rawArgv);
        this.usage = "使用说明: 部署代码文档 ";
        this.options = {
            config: {
                description: "生成的配置文件目标存放路径",
                type: "string",
                alias: "c",
            },
        };
    }
    get description() {
        return "初始化项目，生成配置文件";
    }
    run(context) {
        const { cwd, argv: { config = "deploy.config.ts" }, } = context;
        if (path_1.default.extname(config) != ".js") {
            return console.error("文件必须以.js结尾");
        }
        const configPath = path_1.default.normalize(cwd + "/" + config);
        if (fs_1.default.existsSync(configPath)) {
            console.warn("文件已存在");
        }
        else {
            fs_1.default.writeFileSync(configPath, fs_1.default.readFileSync(__dirname + "/../../demo/deploy.config.js"));
            console.warn("初始化成功");
        }
    }
}
exports.default = InitCommand;
