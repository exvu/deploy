"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_bin_1 = __importDefault(require("common-bin"));
const deploy_1 = __importDefault(require("./deploy"));
class Command extends common_bin_1.default {
    constructor(rawArgv) {
        super(rawArgv);
        this.usage = 'Usage: deploy <command> [options]';
    }
    run(context) {
        new deploy_1.default(context).start();
    }
}
exports.default = Command;
