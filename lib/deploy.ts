
import fs from 'fs';
import path from 'path';
import filesize from 'filesize';
import Pack from './util/pack';
import SSH from './util/ssh';
import chalk from 'chalk';
import Logger from './util/Logger';

export default class Deploy {

    private logger: Logger;
    private configs: { [index: string]: any };
    private configPath: string;
    private sshClient: any;
    constructor(context: any) {
        const {
            cwd, argv: { config: configPath = cwd + '/deploy.config.js' },
        } = context;
        this.configPath = path.normalize(path.isAbsolute(configPath) ? configPath : cwd + '/' + configPath);
        this.configs = {};
        this.logger = new Logger();
    }
    /**
     * 加载配置文件
     */
    initConfigFile() {
        this.logger.steps('加载配置文件')
        if (!fs.existsSync(this.configPath)) {
            this.logger.fail(`配置文件不存在(${chalk.red(this.configPath)})`);
        }
        this.configs = require(this.configPath);
        //读取配置文件
        this.logger.succees(`加载配置文件成功`);
        this.logger.log(`\t${this.configPath}`);
    }
    /**
     * 打包文件
     */
    async packFiles() {
        this.logger.steps('打包文件');
        //打包文件
        const file: any = await (new Pack({
            rootDir: this.configs.rootDir,
            output: this.configs.output,
            rules: this.configs.rules,
        })).on('progress', ({ entries: { total, processed, } }: { entries: any }) => {
            this.logger.progress(processed/total*100);
        }).zip();
        this.logger.succees('打包文件成功');
        this.logger.log(`\t${file.path} ${chalk.green(file.size)}(${file.counts}个文件)`);
        return file;
    }
    /**
     * 链接远程服务器
     */
    async connectServer() {
        //设置sshClient参数
        this.sshClient = new SSH(this.configs.server);
        const host = `${this.configs.server.username}@${this.configs.server.host}`;
        this.logger.steps('连接服务器');
        let repeat = false;
        // while (true) {
            try {
                // await this.logger.entrypassword(`请输入服务器密码`);
                await this.sshClient.connect();
                this.logger.succees(`成功连接远程服务器 ${chalk.green(host)}`);
                // break;
            } catch (e) {
                this.logger.fail('服务器链接失败,请检查账号或密码是否正确');
                repeat = true;
            }
        // }
    }
    /**
     * 上传文件
     */
    async uploadFile(filePath: string) {
        const host = `${this.configs.server.username}@${this.configs.server.host}`;
        this.logger.log(`上传打包文件到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
        let bar: any = null;
        await this.sshClient.on('progress', ({ total, processed, }: any) => {
            const scale = parseInt((processed / total).toFixed(2));
            this.logger.progress(scale);
        }).uploadFile(filePath, this.configs.server.path);
        this.logger.log(`文件已上传到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
    }
    /**
     * 执行远程命令
     */
    async shell() {
        this.logger.log('执行远程命令');
        await this.sshClient.shell(this.configs.shell.map((item: string) => item + '\n').join(''));
        this.logger.log('删除压缩文件,并退出程序');
    }
    async start() {
        try {
            this.initConfigFile();
            const { path: filePath } = await this.packFiles();
            await this.connectServer();
            await this.uploadFile(filePath);
            await this.shell();

        } catch (e) {
            this.logger.log(e.message);
            throw e;
        } finally {
            const {
                output: { path: _path, filename, }
            } = this.configs;
            const filePath = path.normalize(_path + filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        // process.exit(0);
    }
}