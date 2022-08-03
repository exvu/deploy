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
const Client_1 = __importDefault(require("./util/Client"));
class Deploy extends Logger_1.default {
    constructor(context) {
        super();
        this.client = new Client_1.default();
        const { cwd, argv: { config: configPath = cwd + "/deploy.config.ts" }, } = context;
        this.configPath = path_1.default.normalize(path_1.default.isAbsolute(configPath) ? configPath : cwd + "/" + configPath);
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
        this.success(`===============配置文件： ${this.configPath}==============`);
        this.success((0, json_format_1.default)(this.configs));
        await this.client.checkIncludes(this.configs);
        await this.sleep();
        this.next();
    }
    /**
     * 链接远程服务器
     */
    async connectServer() {
        try {
            //设置sshClient参数
            const serverMessage = await this.client.connect(this.configs);
            this.success("===============成功连接远程服务器 ${chalk.green(this.configs.host)}==============");
            this.success(serverMessage + "\n\n\n");
            this.next();
        }
        catch (e) {
            this.fail("===============登录失败==============");
            this.fail("服务器链接失败,请检查账号或密码是否正确");
            this.fail(e.message);
        }
    }
    checkLocalAndUpload(config) {
        var _a, _b;
        try {
            this.client.register("upload-file-end", (file) => {
                this.success(`上传成功:${file}`);
            });
            let filemap = this.client.parseLocal((_a = config.includes) !== null && _a !== void 0 ? _a : [], (_b = config.excludes) !== null && _b !== void 0 ? _b : [], config.localRoot, "/");
            // console.log(filemap);
            this.success("需要上传的文件数量: " + this.client.countFiles(filemap));
            return this.client.makeAllAndUpload(filemap);
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * 上传文件
     */
    async uploadFile() {
        try {
            if (this.configs.deleteRemote) {
                await this.client.deleteRemote();
                this.success("删除文件成功");
            }
        }
        catch (e) {
            this.fail("删除文件失败");
        }
        this.checkLocalAndUpload(this.configs);
        this.next();
    }
    /**
     * 执行远程命令
     */
    async shells() {
        // const data = await this.sshClient.shells(this.configs.shells.map((item: string) => item + '\n').join(''));
        // this.log(data);
    }
    async start() {
        process.on("unhandledRejection", (reason, p) => {
            //   console.log("Promise: ", p, "Reason: ", reason);
            p.catch((e) => {
                this.fail(e.stack);
            });
        });
        process.on("uncaughtException", (err) => {
            this.fail(err.messsage);
        });
        try {
            this.initSteps([
                {
                    key: "initConfig",
                    label: "加载配置文件",
                    func: this.initConfigFile,
                },
                {
                    key: "connect",
                    label: "连接到服务器",
                    func: async () => {
                        await this.connectServer();
                    },
                },
                {
                    key: "upload",
                    label: "上传文件到服务器",
                    func: async () => {
                        await this.uploadFile();
                    },
                },
                {
                    key: "upload",
                    label: "上传成功",
                    func: async () => {
                        this.success("文件上传成功");
                    },
                },
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
