"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ora_1 = __importDefault(require("ora"));
class Loading {
    constructor() {
        this.step = 1;
        this._loading = ora_1.default();
    }
    start(text) {
        this._loading.start(`${this.step}.${text}\n`);
        return this;
    }
    next(text) {
        this.step++;
        this._loading.start(`${this.step}.${text}\n`);
        return this;
    }
    fail(text) {
        this._loading.fail(`\t${text}\n`);
        return this;
    }
    succeed(text) {
        this._loading.succeed(`${this.step}.${text}\n`);
        return this;
    }
    stop() {
        this._loading.stop();
        return this;
    }
    info(text) {
        this._loading.info(text);
        return this;
    }
}
exports.default = Loading;
