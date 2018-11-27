
import fs from 'fs';
import path from 'path';
import Progress from 'progress';
import filesize from 'filesize';
import Pack from './util/pack';
import SSH from './util/ssh';
import Loading from './util/loading';
import chalk from 'chalk';

export default class Deploy {

    private loading: Loading;
    private configs: { [index: string]: any };
    private configPath: string;
    private sshClient: any;
    constructor(context: any) {
        const {
            cwd, argv: { config: configPath = cwd + '/deploy.config.js' },
        } = context;
        this.configPath = path.normalize(path.isAbsolute(configPath) ? configPath : cwd + '/' + configPath);
        this.configs = {};
        this.loading = new Loading();
    }
    /**
     * 加载配置文件
     */
    initConfigFile() {
        this.loading.start('加载配置文件中')
        if (!fs.existsSync(this.configPath)) {
            this.loading.fail(`配置文件不存在(${chalk.red(this.configPath)})`);
        }
        this.configs = require(this.configPath);
        //读取配置文件
        this.loading.succeed(`加载配置文件成功 \n\t${this.configPath}`);
    }
    /**
     * 打包文件
     */
    async packFiles() {
        this.loading.next('打包文件中');
        let bar: any = null;
        //打包文件
        const file: any = await (new Pack({
            rootDir: this.configs.rootDir,
            output: this.configs.output,
            rules: this.configs.rules,
        })).on('init', ({ counts, }: { counts: number }) => {
            bar = new Progress('packing [:bar] :current/:total :percent :etas', {
                complete: '#',
                incomplete: ' ',
                 total: counts, width: 80,
                 })
        }).on('progress', ({ entries: { total, processed, }}:{ entries: any }) => {
            if (bar) {
                bar.tick({
                    current: processed,
                    total: total,
                });
            }
        }).zip();
        this.loading.succeed(`打包文件成功
        \n${file.path} ${chalk.green(file.size)}(${file.counts}个文件)`);
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
        while (true) {
            try {
                await this.sshClient.entryPassword(`请输入服务器密码`);
                this.loading[repeat ? 'start' : 'next'](`连接远程服务器 ${chalk.green(host)}`);
                await this.sshClient.connect();
                this.loading.succeed(`成功连接远程服务器 ${chalk.green(host)}`);
                break;
            } catch (e) {
                this.loading.fail('服务器链接失败,请检查账号或密码是否正确');
                repeat = true;
            }
        }
    }
    /**
     * 上传文件
     */
    async uploadFile(filePath: string) {
        const host = `${this.configs.server.username}@${this.configs.server.host}`;
        this.loading.next(`上传打包文件到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
        let bar:any =null;
        await this.sshClient.on('progress',({ total,processed,}:any)=>{
            const scale = parseInt((processed/total).toFixed(2));
            if(!bar){
                bar = new Progress('uploading [:bar] :cSize/:tSize :percent :etas', { 
                    complete: '#',
                    incomplete: ' ',
                    total:100, width: 80, 
                })
            }else{
                bar.tick(scale,{
                    cSize:filesize(processed),
                    tSize:filesize(total),
                });
            }
        }).uploadFile(filePath, this.configs.server.path);
        this.loading.succeed(`文件已上传到服务器 ${chalk.green(host + ':' + this.configs.server.path)}`);
    }
    /**
     * 执行远程命令
     */
    async shell() {
        this.loading.next('执行远程命令');
        await this.sshClient.shell(this.configs.shell.map((item: string) => item + '\n').join(''));
        this.loading.succeed('删除压缩文件,并退出程序');
        this.loading.stop();
    }
    async start() {
        try {
            this.initConfigFile();
            const { path: filePath } = await this.packFiles();
            await this.connectServer();
            await this.uploadFile(filePath);
            await this.shell();

        } catch (e) {
            this.loading.fail(e.message);
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
        this.loading.stop();
        process.exit(0);
    }
}