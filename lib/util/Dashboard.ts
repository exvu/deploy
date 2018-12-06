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
    protected _modal: Widgets.BoxElement | null = null;
    protected _loggerText: Widgets.Log | null = null;
    protected _steps: Widgets.BoxElement | null = null;
    protected _stepsText: Widgets.Log | null = null;
    protected _assets: Widgets.BoxElement | null = null;
    protected _progress: Widgets.BoxElement | null = null;
    protected _progressBar: Widgets.ProgressBarElement | null = null;
    private assetTable: Widgets.TableElement | null = null;
    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
            dockBorders: true,
            fullUnicode: true,
            autoPadding: true,
        });
        this.actionForMessageType = {
            progress: this.setProgress.bind(this),
            logger: this.setLogger.bind(this),
            assets: this.setAssest.bind(this),
            steps: this.setSteps.bind(this),
        };
        this.screen.key(['escape','C-c'], function () {
            return process.exit(0);
        });
        this.color = 'green';
        this.layoutLog();
        this.layoutAssets();
        this.layoutSteps();
        this.layoutProgress();
        this.screen.render();
    }
    protected layoutModal(options: any) {
        this._modal = blessed.box(Object.assign({
            label: "Modal",
            padding: 1,
            top: 'center',
            left: 'center',
            detached: true,
            content: '',
            width: '40%',
            height: '40%',
            border: {
                type: 'line',
            },
            tags: true,
            style: {
                fg: 'white',
                bold: true,
                border: {
                    fg: 'red',
                },
                hover: {
                    bg: 'green'
                }
            }
        }, options));
        // this._modal.readInput('Input: ','2',(data)=>{
        //    console.log(data);
        // });
        this.screen.append(this._modal);
    }
    private layoutProgress() {
        this._progress = blessed.box({
            label: "Progress",
            padding: 1,
            width: '35%',
            height: '20%',
            right: 0,
            top: 0,
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
            width: '100%',
            height: '40%',
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
        this._steps = blessed.box({
            label: "Steps",
            padding: 1,
            width: '35%',
            height: '40%',
            top: '20%',
            right: 0,
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
        this._stepsText = blessed.log(
            Object.assign({}, DEFAULT_SCROLL_OPTIONS, {
                parent: this._steps,
                tags: true,
                width: "100%-5"
            })
        );

        this.screen.append(this._steps);
    }
    private layoutAssets() {
        this._assets = blessed.box({
            label: "Assets",
            padding: 1,
            width: '65%',
            height: '60%',
            left: 0,
            top: 0,
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
        this.assetTable = blessed.table(
            Object.assign({}, DEFAULT_SCROLL_OPTIONS, {
                parent: this._assets,
                height: "100%",
                width: "100%-5",
                align: "left",
                padding: 1,
                data: [["Name", "Size"]]
            })
        );
        this.screen.append(this._assets);
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
    private setSteps(data: any) {
        if (this._stepsText) {
            this._stepsText.log(data.value.replace(/[{}]/g, ""));
        }
    }
    private setAssest(data: any) {
        const { _assets } = data.value;
        if (this.assetTable) {
            this.assetTable.setData(helper.formatAssets(_assets));
        }
        this.screen.render();
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