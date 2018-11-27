import CommandBin from 'common-bin';
import Deploy from './deploy';


export default class Command extends CommandBin {

  private usage: string;
  constructor(rawArgv?: any) {
    super(rawArgv);
    this.usage = 'Usage: deploy <command> [options]';
  }
  run(context: any) {
    new Deploy(context).start();
  }
}