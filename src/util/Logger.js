"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Dashboard_1 = __importDefault(require("./Dashboard"));
const chalk_1 = __importDefault(require("chalk"));
class Logger extends Dashboard_1.default {
    constructor() {
        super(...arguments);
        this.steps = [];
        this.loggerType = 0;
    }
    log(text) {
        if (this.steps[this.loggerType]) {
            this.steps[this.loggerType]['loggers'].push(text);
        }
        this.setData([{
                type: 'logger',
                value: text,
            }]);
    }
    fail(text) {
        this.log(chalk_1.default.red(text));
    }
    succees(text) {
        this.log(chalk_1.default.green(text));
    }
    initSteps(data) {
        this.steps = data.map((item) => {
            return Object.assign({ loggers: [] }, item);
        });
        this.setSteps(data.map(({ label }, index) => `${index + 1}.${label}`));
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const index in this.steps) {
                const _a = this.steps[index], { func } = _a, data = __rest(_a, ["func"]);
                if (this._steps && this._logger && this._loggerText) {
                    this._steps.select(parseInt(index, 10));
                    this._logger.setLabel(`Log(${parseInt(index, 10) + 1}.${data.label})`);
                    this._loggerText.setContent('');
                }
                yield func(data);
            }
            this.log(chalk_1.default.cyan('发布成功,请按esc退出程序'));
        });
    }
    entrypassword(text) {
        this.layoutModal({
            label: text,
            content: '',
        });
    }
    progress(percent) {
        this.setData([{
                type: 'progress',
                value: percent,
            }]);
    }
}
exports.default = Logger;
