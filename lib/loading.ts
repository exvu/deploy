import ora from 'ora';

export default class Loading {

  private _loading: any;
  private step: number = 1;
  constructor() {
    this._loading = ora();
  }
  start(text: string) {
    this._loading.start(`${this.step}.${text}\n`)
    return this;
  }
  next(text: string) {
    this.step++;
    this._loading.start(`${this.step}.${text}\n`)
    return this;
  }
  fail(text: string) {
    this._loading.fail(`\t${text}\n`)
    return this;
  }
  succeed(text: string) {
    this._loading.succeed(`${this.step}.${text}\n`);
    return this;
  }
  stop() {
    this._loading.stop();
    return this;
  }
  info(text: string) {
    this._loading.info(text);
    return this;
  }
} 