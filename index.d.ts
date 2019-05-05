declare module 'common-bin' {
  export default class Command {
    constructor(options: any);
    start(): void;
  }
}
declare module 'json-format' {
  export default function jsonformatter(config:any): any;
}