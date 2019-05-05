"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
class SSH {
    /**
     * 后缀
     */
    constructor(optionos) {
        this.optionos = optionos;
        this.listener = {};
        this.client = new ssh2_1.Client();
    }
    /**
     * 连接服务器
     */
    connect() {
        return new Promise((resolve, reject) => {
            //连接ssh
            this.client.on('ready', () => {
                resolve(true);
            }).on('error', (err) => {
                reject('服务器连接错误:' + err);
            }).connect(this.optionos);
        });
    }
    /**
     * 执行命令
     */
    shells(cmd) {
        return new Promise((resolve, reject) => {
            this.client.shell((err, stream) => {
                if (err)
                    reject(err);
                let buffer = '';
                stream.on('close', () => {
                    this.client.end();
                    resolve(buffer);
                }).on('data', (data) => {
                    buffer += data;
                }).stderr.on('data', (data) => {
                    reject(data);
                });
                stream.end(cmd);
            });
        });
    }
    /**
     * 输入密码
     */
    entryPassword(text) {
        return new Promise((resolve, reject) => {
            inquirer_1.default.prompt({
                type: 'password',
                name: 'type',
                message: text,
            }).then((result) => {
                if (result.type != null) {
                    this.optionos.password = result.type;
                    resolve(result.type);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
    on(name, callback) {
        this.listener[name] = callback;
        return this;
    }
    /**
     * 上传文件
     */
    uploadFile(source, remoteTarget) {
        const remotePath = remoteTarget + '/' + path_1.default.basename(source);
        return new Promise((resolve, reject) => {
            try {
                this.client.sftp((err, sftp) => {
                    if (err) {
                        reject(err);
                    }
                    sftp.fastPut(source, remotePath, {
                        step: (processed, chunk, total) => {
                            this.listener['progress']({
                                total,
                                processed,
                            });
                        }
                    }, (err) => {
                        if (err) {
                            return reject(new Error(err.errno == -4058 ? '本地:' + err.message : ('服务器SFTP错误:' + err.message + remotePath)));
                        }
                        this.listener = [];
                        resolve(true);
                    });
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.default = SSH;
