"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_bin_1 = __importDefault(require("common-bin"));
const path_1 = __importDefault(require("path"));
class Command extends common_bin_1.default {
    constructor(rawArgv) {
        super(rawArgv);
        this.usage = '使用说明: 工具文档 ';
        this.load(path_1.default.join(__dirname, '/cmd/'));
        this.version = '2.0';
    }
    run(context) {
        // console.log(context)
        // new Deploy(context).start();
    }
}
exports.default = Command;
