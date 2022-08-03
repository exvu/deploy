import CommandBin from 'common-bin';
import path from 'path';
import fs from 'fs';

export default class InitCommand extends CommandBin {
  constructor(rawArgv?: any) {
    super(rawArgv);
    this.usage = '使用说明: 部署代码文档 ';
    this.options = {
      config: {
        description: '生成的配置文件目标存放路径',
        type: 'string',
        alias:'c'
      },
    }
  }
  get description() {
    return '初始化项目，生成配置文件';
  }
  run(context: any) {
    const {cwd,
      argv:{
        config='deploy.config.ts'
      }
    } = context;
    if(path.extname(config)!='.ts'){
      return console.error('文件必须以.ts结尾');
    }
    const configPath = path.normalize( cwd + '/' + config);
    
    if(fs.existsSync(configPath)){
      console.warn('文件已存在');
    }else{
      fs.writeFileSync(configPath,fs.readFileSync(__dirname+'/../demo/deploy.config.ts'));
      console.warn('初始化成功');
    }
  }
}