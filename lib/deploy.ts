
import fs from 'fs';
import path from 'path';
import Pack from './util/pack';
import SSH from './util/ssh';
import chalk from 'chalk';
import Logger from './util/Logger';
import jsonFormat  from 'json-format'

export default class Deploy extends Logger {

    private configs: { [index: string]: any };
    private configPath: string;
    private sshClient: any;
    constructor(context: any) {
        super();
        const {
            cwd, argv: { config: configPath = cwd + '/deploy.config.js' },
        } = context;
        this.configPath = path.normalize(path.isAbsolute(configPath) ? configPath : cwd + '/' + configPath);
        this.configs = {};
    }
    sleep(second: number = 1) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, second * 1000);
        });
    }
    /**
     * 加载配置文件
     */
    async initConfigFile() {
        if (!fs.existsSync(this.configPath)) {
            this.fail(`配置文件不存在(${chalk.red(this.configPath)})`);
        }
        this.configs = require(this.configPath);

        this.configs.output.filename =this.configs.output.filename+'.'+this.configs.output.format;
        //读取配置文件
        this.succees(`加载配置文件成功`);
        await this.sleep();
        this.log(`\t${this.configPath}`);
        this.log(jsonFormat (this.configs));
    }
    /**
     * 打包文件
     */
    async packFiles() {
        //打包文件
        const file: any = await (new Pack({
            rootPath: this.configs.rootPath,
            output: this.configs.output,
            rules: this.configs.rules,
        })).on('progress', ({ entries: { total, processed, } }: { entries: any }) => {
            this.progress(processed / total * 100);
        }).zip();
        this.succees('打包文件成功');
        this.log(`\t${file.path} ${chalk.green(file.size)}(${file.counts}个文件)`);
        return file;
    }
    /**
     * 链接远程服务器
     */
    async connectServer() {
        //设置sshClient参数
        this.sshClient = new SSH(this.configs.server);
        const host = `${this.configs.server.username}@${this.configs.server.host}`;

        let repeat = false;
        // while (true) {
        try {
            await this.entrypassword(`请输入服务器密码`);
            await this.sshClient.connect();
            this.succees(`成功连接远程服务器 ${chalk.green(host)}`);
            // break;
        } catch (e) {
            throw new Error('服务器链接失败,请检查账号或密码是否正确');
            repeat = true;
        }
        // }
    }
    /**
     * 上传文件
     */
    async uploadFile(filePath: string) {
        const host = `${this.configs.server.username}@${this.configs.server.host}`;
        this.log(`打包文件地址：${chalk.green(filePath)}`);
        this.log(`上传到服务器：${chalk.green(host + ':' + this.configs.server.path)}`);
        await this.sshClient.on('progress', ({ total, processed, }: any) => {
            const scale = parseInt((processed / total) * 100 + '');
            this.progress(scale);
        }).uploadFile(filePath, this.configs.server.path);
        this.log(`文件已上传到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
    }
    /**
     * 执行远程命令
     */
    async shells() {
        const data = await this.sshClient.shells(this.configs.shells.map((item: string) => item + '\n').join(''));
        this.log(data);
    }
    async start() {
        try {
            let filePath: string;
            this.initSteps([
                {
                    key: 'initConfig',
                    label: '加载配置文件',
                    func: async () => {
                        await this.initConfigFile();
                    }
                },
                {
                    key: 'pack',
                    label: '打包文件',
                    func: async () => {
                        const { path } = await this.packFiles();
                        filePath = path;
                    }
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

        } catch (e) {
            this.fail(e.message);
        } finally {
            const {
                output: { path: _path, filename }
            } = this.configs;
            const filePath = path.normalize(_path + filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}