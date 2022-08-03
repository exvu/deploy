"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_bin_1 = __importDefault(require("common-bin"));
class RunCommand extends common_bin_1.default {
    constructor(rawArgv) {
        super(rawArgv);
        this.usage = '使用说明: 部署代码文档 ';
        this.options = {
            baseDir: {
                description: 'directory of application, default to `process.cwd()`',
                type: 'string',
            },
        };
    }
}
exports.default = RunCommand;
