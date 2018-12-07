import Dashboard from "./Dashboard";
import chalk from 'chalk';

export default class Logger extends Dashboard {
    private steps: Array<{ [index: string]: any }> = [];
    private loggerType: number = 0;
    log(text: string) {

        if (this.steps[this.loggerType]) {
            this.steps[this.loggerType]['loggers'].push(text);
        }
        this.setData([{
            type: 'logger',
            value: text,
        }]);
    }
    fail(text: string) {
        this.log(chalk.red(text));
    }
    succees(text: string) {
        this.log(chalk.green(text));
    }
    initSteps(data: any) {
        this.steps = data.map((item: any) => {
            return {
                loggers: [],
                ...item
            };
        });
        this.setSteps(data.map(({ label }: { label: string }, index: string) => `${index + 1}.${label}`));
    }
    async run() {
        for (const index in this.steps) {
            const { func, ...data } = this.steps[index];
            if (this._steps && this._logger && this._loggerText) {
                this._steps.select(parseInt(index, 10));
                this._logger.setLabel(`Log(${parseInt(index, 10) + 1}.${data.label})`);
                this._loggerText.setContent('');
            }
            await func(data);
        }
        this.log(chalk.cyan('发布成功,请按esc退出程序'));
    }
    entrypassword(text: string) {
        this.layoutModal({
            label: text,
            content: '',
        });
    }
    progress(percent: number) {
        this.setData([{
            type: 'progress',
            value: percent,
        }]);
    }
}