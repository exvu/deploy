"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pack_1 = __importDefault(require("./util/pack"));
const ssh_1 = __importDefault(require("./util/ssh"));
const chalk_1 = __importDefault(require("chalk"));
const Logger_1 = __importDefault(require("./util/Logger"));
const json_format_1 = __importDefault(require("json-format"));
class Deploy extends Logger_1.default {
    constructor(context) {
        super();
        const { cwd, argv: { config: configPath = cwd + '/deploy.config.js' }, } = context;
        this.configPath = path_1.default.normalize(path_1.default.isAbsolute(configPath) ? configPath : cwd + '/' + configPath);
        this.configs = {};
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
    initConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs_1.default.existsSync(this.configPath)) {
                this.fail(`配置文件不存在(${chalk_1.default.red(this.configPath)})`);
            }
            this.configs = require(this.configPath);
            this.configs.output.filename = this.configs.output.filename + '.' + this.configs.output.format;
            //读取配置文件
            this.succees(`加载配置文件成功`);
            yield this.sleep();
            this.log(`\t${this.configPath}`);
            this.log(json_format_1.default(this.configs));
        });
    }
    /**
     * 打包文件
     */
    packFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            //打包文件
            const file = yield (new pack_1.default({
                rootPath: this.configs.rootPath,
                output: this.configs.output,
                rules: this.configs.rules,
            })).on('progress', ({ entries: { total, processed, } }) => {
                this.progress(processed / total * 100);
            }).zip();
            this.succees('打包文件成功');
            this.log(`\t${file.path} ${chalk_1.default.green(file.size)}(${file.counts}个文件)`);
            return file;
        });
    }
    /**
     * 链接远程服务器
     */
    connectServer() {
        return __awaiter(this, void 0, void 0, function* () {
            //设置sshClient参数
            this.sshClient = new ssh_1.default(this.configs.server);
            const host = `${this.configs.server.username}@${this.configs.server.host}`;
            let repeat = false;
            // while (true) {
            try {
                yield this.entrypassword(`请输入服务器密码`);
                yield this.sshClient.connect();
                this.succees(`成功连接远程服务器 ${chalk_1.default.green(host)}`);
                // break;
            }
            catch (e) {
                throw new Error('服务器链接失败,请检查账号或密码是否正确');
                repeat = true;
            }
            // }
        });
    }
    /**
     * 上传文件
     */
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const host = `${this.configs.server.username}@${this.configs.server.host}`;
            this.log(`打包文件地址：${chalk_1.default.green(filePath)}`);
            this.log(`上传到服务器：${chalk_1.default.green(host + ':' + this.configs.server.path)}`);
            yield this.sshClient.on('progress', ({ total, processed, }) => {
                const scale = parseInt((processed / total) * 100 + '');
                this.progress(scale);
            }).uploadFile(filePath, this.configs.server.path);
            this.log(`文件已上传到服务器 ${chalk_1.default.green(host + ':' + this.configs.server.path)}`);
        });
    }
    /**
     * 执行远程命令
     */
    shells() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.sshClient.shells(this.configs.shells.map((item) => item + '\n').join(''));
            this.log(data);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath;
                this.initSteps([
                    {
                        key: 'initConfig',
                        label: '加载配置文件',
                        func: () => __awaiter(this, void 0, void 0, function* () {
                            yield this.initConfigFile();
                        })
                    },
                    {
                        key: 'pack',
                        label: '打包文件',
                        func: () => __awaiter(this, void 0, void 0, function* () {
                            const { path } = yield this.packFiles();
                            filePath = path;
                        })
                    },
                    {
                        key: 'connect',
                        label: '连接到服务器',
                        func: () => __awaiter(this, void 0, void 0, function* () {
                            yield this.connectServer();
                        })
                    },
                    {
                        key: 'upload',
                        label: '上传文件到服务器',
                        func: () => __awaiter(this, void 0, void 0, function* () {
                            yield this.uploadFile(filePath);
                        })
                    },
                    {
                        key: 'upload',
                        label: '执行远程命令',
                        func: () => __awaiter(this, void 0, void 0, function* () {
                            yield this.shells();
                        })
                    }
                ]);
                yield this.run();
            }
            catch (e) {
                this.fail(e.message);
            }
            finally {
                const { output: { path: _path, filename } } = this.configs;
                const filePath = path_1.default.normalize(_path + filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
        });
    }
}
exports.default = Deploy;
