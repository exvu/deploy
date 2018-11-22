import CommandBin from 'common-bin';
import fs from 'fs';
import path from 'path';
import Pack from './pack';
import SSH from './ssh';
import Loading from './loading';
import chalk from 'chalk';
import Ora from 'ora';

export default class Command extends CommandBin {

  private usage: string;
  private loading: Loading;
  constructor(rawArgv?: any) {
    super(rawArgv);
    this.usage = 'Usage: deploy <command> [options]';
    this.loading = new Loading();
  }
  * run(context: any) {
    const {
      cwd, argv: { config = cwd + '/deploy.config.js' },
    } = context;
    const configPath = path.normalize(path.isAbsolute(config) ? config : cwd + '/' + config);
    this.loading.start('加载配置文件中')
    if (!fs.existsSync(configPath)) {
      this.loading.fail(`配置文件不存在(${chalk.red(configPath)})`);
    }
    const configs = require(configPath);
    //读取配置文件
    this.loading.succeed('加载配置文件成功1');
    this.loading.next('打包文件中');
    try {
      //打包文件
      const filePath = yield (new Pack({
        rootDir: configs.rootDir,
        output: configs.output,
        rules: configs.rules,
      })).zip();
      this.loading.succeed(`打包文件成功,压缩包位置 ${chalk.green(filePath)}`);
      //设置ssh参数
      const ssh = new SSH(configs.server);
      const host = `${configs.server.username}@${configs.server.host}`;
      let repeat = false;
      while (true) {
        try {
          yield ssh.entryPassword(`请输入服务器密码`);
          this.loading[repeat ? 'start' : 'next'](`连接远程服务器 ${chalk.green(host)}`);
          yield ssh.connect();
          this.loading.succeed(`成功连接远程服务器 ${chalk.green(host)}`);
          break;
        } catch (e) {
          this.loading.fail('服务器链接失败,请检查账号或密码是否正确');
          repeat = true;
        }
      }
      this.loading.next(`上传打包文件到服务器 ${chalk.green(host + ':' + configs.server.path)}`);
      yield ssh.uploadFile(filePath, configs.server.path);
      this.loading.succeed(`文件已上传到服务器 ${chalk.green(host + ':' + configs.server.path)}`);

      this.loading.next('执行远程命令');
      yield ssh.shell(configs.shell.map((item: string) => item + '\n').join(''));
      this.loading.succeed('删除压缩文件,并退出程序');
      this.loading.stop();
      // 删除文件
    } catch (e) {
      this.loading.fail(e.message);
      throw e;
    } finally {
      const {
        output: { path: _path, filename, }
      } = configs;
      const filePath = path.normalize(_path + filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    this.loading.stop();
    process.exit(0);
  }
}