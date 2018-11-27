import { Client, ConnectConfig, } from 'ssh2';
import path from 'path';
import inquirer from 'inquirer';

export default class SSH {

  private client: Client;
  private listener: { [index: string]: any } = {};

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
    return new Promise((resolve, reject) => {
      inquirer.prompt({
        type: 'password',
        name: 'type',
        message: text,
      }).then((result: any) => {
        if (result.type != null) {
          this.optionos.password = result.type;
          resolve(result.type);
        }
      }).catch(err => {
        reject(err);
      });
    })
  }
  on(name: string, callback: any) {
    this.listener[name] = callback;
    return this;
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
        sftp.fastPut(source, remoteTarget + '/' + path.basename(source),
          {
            step:  (processed, chunk, total)=> {
              this.listener['progress']({
                total,
                processed,
              });
            }
          }, (err: any) => {
            if (err) {
              return reject(err);
            }
            this.listener = [];
            resolve(true);
          });
      });
    });
  }
}