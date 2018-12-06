import Dashboard from "./Dashboard";
import chalk from 'chalk';

export default class Logger extends Dashboard {
    private step:number = 1;
    log(text: string) {
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
    steps(text: string) {
        this.setData([{
            type: 'steps',
            value: chalk.green(`${this.step++}.${text}`),
        }]);
    }
    entrypassword(text:string){
        this.layoutModal({
            label:text,
            content:'',
        });
    }
    assets(assets: string) {
        this.setData([{
            type: 'assets',
            value: assets,
        }]);
    }
    progress(percent: number) {
        this.setData([{
            type: 'progress',
            value: percent,
        }]);
    }
}