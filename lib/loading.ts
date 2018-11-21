import ora from 'ora';

export default class Loading {

  private _loading: any;
  private step: number = 0;

  start(text: string) {
    this.step++;
    this._loading = ora(`${this.step}.${text}\n`).start();
    return this;
  }
  text(text: string) {
    this._loading.text = `${this.step}.${text}\n`;
    return this;
  }
  fail(text: string) {
    console.log('\t');
    this._loading.fail(`\t${text}\n`);
    return this;
  }
  succeed(text: string) {
    this._loading.succeed(`${this.step}.${text}\n`);
    return this;
  }
  stop() {
    if (this._loading) {
      this._loading.stop();
    }
    this._loading = null;
    return this;
  }
}