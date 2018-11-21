import { Client, ConnectConfig, } from 'ssh2';
import Readline from 'readline';
import chalk from 'chalk';
import path from 'path';

export default class SSH {

  private client: Client;
  /**
   * 后缀
   */
  constructor(private optionos: ConnectConfig) {
    this.client = new Client();
  }

  /**
   * 连接服务器
   */
  public connect() {
    return new Promise((resolve, reject) => {
      //连接ssh
      this.client.on('ready', () => {
        resolve(true);
      }).on('error', (err) => {
        reject(err);
      }).connect(this.optionos);
    });

  }
  /**
   * 执行命令
   */
  public shell(cmd: string) {
    return new Promise((resolve, reject) => {
      this.client.shell((err, stream) => {
        if (err) reject(err);
        let buffer = '';
        stream.on('close', () => {
          this.client.end();
          resolve(buffer);
        }).on('data', (data: string) => {
          buffer += data;
        }).stderr.on('data', (data: string) => {
          reject(data);
        });
        stream.end(cmd);
      });
    });
  }
  /**
   * 输入密码
   */
  public entryPassword(text: string) {
    const readline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve, reject) => {
      readline.question(chalk.green(text), (password) => {
        if (password !== null) {
          this.optionos.password = password;
          resolve();
        }
      })
    })
  }
  /**
   * 上传文件
   */
  public uploadFile(source: string, remoteTarget: string) {
    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err);
        }
        sftp.fastPut(source, remoteTarget + '/' + path.basename(source), (err: any) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    });
  }
}