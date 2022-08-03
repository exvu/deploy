"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const Logger_1 = __importDefault(require("./util/Logger"));
const json_format_1 = __importDefault(require("json-format"));
const promise_ftp_1 = __importDefault(require("promise-ftp"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
class Deploy extends Logger_1.default {
    constructor(context) {
        super();
        const { cwd, argv: { config: configPath = cwd + '/deploy.config.ts' }, } = context;
        this.configPath = path_1.default.normalize(path_1.default.isAbsolute(configPath) ? configPath : cwd + '/' + configPath);
    }
    sleep(second = 1) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, second * 1000);
        });
    }
    /**
     * 加载配置文件
     */
    async initConfigFile(data) {
        if (!fs_1.default.existsSync(this.configPath)) {
            this.fail(`配置文件不存在(${chalk_1.default.red(this.configPath)})`);
        }
        this.configs = require(this.configPath).default;
        //读取配置文件
        this.success(`加载配置文件成功${this.configPath}`);
        this.success((0, json_format_1.default)(this.configs));
        await this.sleep();
        this.next();
    }
    /**
     * 链接远程服务器
     */
    async connectServer() {
        //设置sshClient参数
        if (this.configs.protocol == 'ftp') {
            this.ftpClient = new promise_ftp_1.default();
            this.ftpClient.connect({
                password: this.configs.auth.password,
                user: this.configs.auth.username,
                port: this.configs.port,
                host: this.configs.host,
            }).then((serverMessage) => {
                // console.log(serverMessage);
            });
        }
        else {
            this.sftpClient = new ssh2_sftp_client_1.default();
            this.sftpClient.connect({
                password: this.configs.auth.password,
                username: this.configs.auth.username,
                port: this.configs.port,
                host: this.configs.host,
            });
        }
        // // while (true) {
        // try {
        //     await this.entrypassword(`请输入服务器密码`);
        //     await this.sshClient.connect();
        //     this.success(`成功连接远程服务器 ${chalk.green(host)}`);
        //     // break;
        // } catch (e) {
        //     throw new Error('服务器链接失败,请检查账号或密码是否正确');
        //     repeat = true;
        // }
        // }
    }
    /**
     * 上传文件
     */
    async uploadFile(filePath) {
        // const host = `${this.configs.server.username}@${this.configs.server.host}`;
        // this.log(`打包文件地址：${chalk.green(filePath)}`);
        // this.log(`上传到服务器：${chalk.green(host + ':' + this.configs.server.path)}`);
        // await this.sshClient.on('progress', ({ total, processed, }: any) => {
        //     const scale = parseInt((processed / total) * 100 + '');
        //     this.progress(scale);
        // }).uploadFile(filePath, this.configs.server.path);
        // this.log(`文件已上传到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
    }
    /**
     * 执行远程命令
     */
    async shells() {
        // const data = await this.sshClient.shells(this.configs.shells.map((item: string) => item + '\n').join(''));
        // this.log(data);
    }
    async start() {
        process.on('unhandledRejection', (reason, p) => {
            console.log('Promise: ', p, 'Reason: ', reason);
            p.catch(e => {
                this.fail(e.stack);
            });
        });
        try {
            let filePath;
            this.initSteps([
                {
                    key: 'initConfig',
                    label: '加载配置文件',
                    func: this.initConfigFile
                },
                {
                    key: 'connect',
                    label: '连接到服务器',
                    func: async () => {
                        await this.connectServer();
                    }
                },
                {
                    key: 'upload',
                    label: '上传文件到服务器',
                    func: async () => {
                        await this.uploadFile(filePath);
                    }
                },
                {
                    key: 'upload',
                    label: '执行远程命令',
                    func: async () => {
                        await this.shells();
                    }
                }
            ]);
            await this.run();
        }
        catch (e) {
            // this.fail(e.message);
        }
        finally {
        }
    }
}
exports.default = Deploy;
