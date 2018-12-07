import blessed, { Widgets } from 'blessed';
import helper from './helper';

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
export default class Dashboard {
    private screen: Widgets.Screen;
    private color: string;
    private actionForMessageType: any;
    protected _logger: Widgets.BoxElement | null = null;
    protected _modal: Widgets.PromptElement | null = null;
    protected _loggerText: Widgets.Log | null = null;
    protected _steps: Widgets.ListElement | null = null;
    protected _progress: Widgets.BoxElement | null = null;
    protected _progressBar: Widgets.ProgressBarElement | null = null;
    private assetTable: Widgets.TableElement | null = null;
    constructor() {
        const options: any = {
            resizeTimeout: 300,
            dockBorders: true,
            cursor: {
                artificial: true,
                shape: 'line',
                blink: true,
                color: null
            },
            debug: true,
            warnings: true,
            smartCSR: true,
            fullUnicode: true,
            autoPadding: true,
        };
        this.screen = blessed.screen(options);
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
    protected layoutModal(options: any) {
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
    private layoutProgress() {
        this._progress = blessed.box({
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
        this._progressBar = blessed.progressbar({
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
    private layoutLog() {
        this._logger = blessed.box({
            label: "Log",
            padding: 1,
            width: '80%',
            height: '100%',
            top:0,
            right:0,
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
        this._loggerText = blessed.log(
            Object.assign({}, DEFAULT_SCROLL_OPTIONS, {
                parent: this._logger,
                tags: true,
                width: "100%-5"
            })
        );

        this.screen.append(this._logger);
    }
    private layoutSteps() {

        const option: any = {
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
        }

        this._steps = blessed.list(option);
        this._steps.on('select', (item, select) => {
            if (this._steps) {
                console.log(1);
                this._steps.select(select);
                this._steps.focus();
            }
        });
        this.screen.append(this._steps);
    }
    private setProgress(data: any) {
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
    private setLogger(data: any) {
        if (this._loggerText) {
            this._loggerText.log(data.value.replace(/[{}]/g, ""));
        }
    }
    protected setSteps(data: any) {
        if (this._steps) {
            data.forEach(this._steps.addItem.bind(this._steps))
            this._steps.select(0);
        }
      
    }
    setData(dataArray: Array<{ [index: string]: any }>) {
        dataArray.map(data => {
            return data.error
                ? Object.assign({}, data, {
                    value: helper.deserializeError(data.value)
                })
                : data;
        }).forEach(data => {
            this.actionForMessageType[data.type](data);
        });

        this.screen.render();
    }

}