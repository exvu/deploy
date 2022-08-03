import Dashboard from "./Dashboard";
import chalk from "chalk";

export default class Logger extends Dashboard {
  private steps: Array<{ [index: string]: any }> = [];
  private stepIndex: number = 0;
  private loggerType: number = 0;
  log(text: string) {
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
  fail(text: string) {
    this.log(chalk.red(text));
  }
  success(text: string) {
    this.log(chalk.green(text));
  }
  initSteps(data: any) {
    this.steps = data.map((item: any) => {
      return {
        loggers: [],
        ...item,
      };
    });
    this.setSteps(
      data.map(
        ({ label }: { label: string }, index: string) => `${index + 1}.${label}`
      )
    );
  }
  public async next() {
    this.stepIndex++;
    if (!this.steps[this.stepIndex]) {
      return;
    }
    const { func, ...data } = this.steps[this.stepIndex];
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
  entrypassword(text: string) {
    this.layoutModal({
      label: text,
      content: "",
    });
  }
  progress(percent: number) {
    this.setData([
      {
        type: "progress",
        value: percent,
      },
    ]);
  }
}
