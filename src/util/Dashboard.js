"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed_1 = __importDefault(require("blessed"));
const helper_1 = __importDefault(require("./helper"));
const DEFAULT_SCROLL_OPTIONS = {
    scrollable: true,
    input: true,
    alwaysScroll: true,
    scrollbar: {
        ch: " ",
        inverse: true
    },
    keys: true,
    vi: true,
    mouse: true
};
class Dashboard {
    constructor() {
        this._logger = null;
        this._modal = null;
        this._loggerText = null;
        this._steps = null;
        this._progress = null;
        this._progressBar = null;
        this.assetTable = null;
        const options = {
            resizeTimeout: 300,
            dockBorders: true,
            cursor: {
                artificial: true,
                shape: 'line',
                blink: true,
                color: null
            },
            mouse: true,
            debug: true,
            warnings: false,
            smartCSR: true,
            fullUnicode: true,
            autoPadding: true,
        };
        this.screen = blessed_1.default.screen(options);
        this.actionForMessageType = {
            progress: this.setProgress.bind(this),
            logger: this.setLogger.bind(this),
            steps: this.setSteps.bind(this),
        };
        this.screen.key(['escape', 'C-c'], function () {
            return process.exit(0);
        });
        this.color = 'green';
        this.layoutLog();
        this.layoutSteps();
        this.layoutProgress();
        this.screen.render();
    }
    layoutModal(options) {
        // this._modal = blessed.prompt(Object.assign({
        //     label: "Modal",
        //     padding: 1,
        //     top: 'center',
        //     left: 'center',
        //     width: '40%',
        //     height: '40%',
        //     censor: '*',
        //     mouse: true,
        //     inputOnFocus: true,
        //     border: {
        //       type: 'line',
        //     },
        // }, options));
        // this._modal.readInput('你好','',()=>{
        //     this.setSteps({
        //         value:1,
        //     })
        // });
        // this.screen.append(this._modal);
    }
    layoutProgress() {
        this._progress = blessed_1.default.box({
            label: "Progress",
            padding: 1,
            width: '20%',
            height: '20%',
            left: 0,
            bottom: 0,
            border: {
                type: 'line'
            },
            style: {
                fg: -1,
                border: {
                    fg: this.color,
                },
            }
        });
        this._progressBar = blessed_1.default.progressbar({
            parent: this._progress,
            height: 1,
            pch: '',
            filled: 0,
            value: 0,
            keys: false,
            mouse: false,
            width: "90%",
            top: "center",
            left: "center",
            orientation: "horizontal",
            style: {
                bar: {
                    bg: this.color
                }
            }
        });
        this.screen.append(this._progress);
    }
    layoutLog() {
        this._logger = blessed_1.default.box({
            label: "Log",
            padding: 1,
            width: '80%',
            height: '100%',
            top: 0,
            right: 0,
            border: {
                type: 'line'
            },
            style: {
                fg: -1,
                border: {
                    fg: this.color,
                },
            },
            scrollbar: {
                ch: ' ',
                track: {
                    bg: 'yellow'
                },
                style: {
                    inverse: true
                }
            }
        });
        this._loggerText = blessed_1.default.log(Object.assign({}, DEFAULT_SCROLL_OPTIONS, {
            parent: this._logger,
            tags: true,
            width: "100%-5"
        }));
        this.screen.append(this._logger);
    }
    layoutSteps() {
        const option = {
            label: "Steps",
            // mouse: true,
            padding: 1,
            width: '20%',
            height: '80%',
            top: '0',
            left: 0,
            tags: true,
            invertSelected: false,
            border: {
                type: 'line'
            },
            style: {
                fg: 'blue',
                bg: 'default',
                border: {
                    fg: this.color,
                    bg: 'default'
                },
                selected: {
                    bg: 'green'
                },
            },
            scrollbar: {
                ch: ' ',
                track: {
                    bg: 'yellow'
                },
                style: {
                    inverse: true
                }
            }
        };
        this._steps = blessed_1.default.list(option);
        this.screen.append(this._steps);
    }
    setProgress(data) {
        const percent = parseFloat(data.value) * 1;
        const formattedPercent = `${percent.toFixed(1).toString()}%`;
        if (this._progressBar) {
            if (!percent) {
                this._progressBar.setProgress(percent);
            }
            this._progressBar.setContent(formattedPercent);
            this._progressBar.setProgress(percent);
        }
    }
    setLogger(data) {
        if (this._loggerText) {
            this._loggerText.log(data.value.replace(/[{}]/g, ""));
        }
    }
    setSteps(data) {
        if (this._steps) {
            data.forEach(this._steps.addItem.bind(this._steps));
            this._steps.select(0);
        }
    }
    setData(dataArray) {
        dataArray.map(data => {
            return data.error
                ? Object.assign({}, data, {
                    value: helper_1.default.deserializeError(data.value)
                })
                : data;
        }).forEach(data => {
            this.actionForMessageType[data.type](data);
        });
        this.screen.render();
    }
}
exports.default = Dashboard;
