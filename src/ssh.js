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
                reject(err);
            }).connect(this.optionos);
        });
    }
    /**
     * 执行命令
     */
    shell(cmd) {
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
    /**
     * 上传文件
     */
    uploadFile(source, remoteTarget) {
        return new Promise((resolve, reject) => {
            this.client.sftp((err, sftp) => {
                if (err) {
                    reject(err);
                }
                sftp.fastPut(source, remoteTarget + '/' + path_1.default.basename(source), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }
}
exports.default = SSH;
