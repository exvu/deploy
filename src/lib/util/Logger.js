"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
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
        this.stepIndex = 0;
        this.loggerType = 0;
    }
    log(text) {
        if (this.steps[this.loggerType]) {
            this.steps[this.loggerType]["loggers"].push(text);
        }
        this.setData([
            {
                type: "logger",
                value: text.replace(/[{]/gi, "【").replace(/[}]/gi, "】"),
            },
        ]);
    }
    fail(text) {
        this.log(chalk_1.default.red(text));
    }
    success(text) {
        this.log(chalk_1.default.green(text));
    }
    initSteps(data) {
        this.steps = data.map((item) => {
            return Object.assign({ loggers: [] }, item);
        });
        this.setSteps(data.map(({ label }, index) => `${index + 1}.${label}`));
    }
    async next() {
        this.stepIndex++;
        if (!this.steps[this.stepIndex]) {
            return;
        }
        const _a = this.steps[this.stepIndex], { func } = _a, data = __rest(_a, ["func"]);
        if (this._steps && this._logger && this._loggerText) {
            this._steps.select(this.stepIndex);
            this._logger.setLabel(`Log(${this.stepIndex + 1}.${data.label})`);
            // this._loggerText.setContent('');
        }
        await func.call(this, data);
    }
    async run() {
        this.stepIndex = -1;
        this.next();
    }
    entrypassword(text) {
        this.layoutModal({
            label: text,
            content: "",
        });
    }
    progress(percent) {
        this.setData([
            {
                type: "progress",
                value: percent,
            },
        ]);
    }
}
exports.default = Logger;
