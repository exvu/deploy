"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const bluebird_1 = __importDefault(require("bluebird"));
const fs_1 = __importDefault(require("fs"));
const upath_1 = __importDefault(require("upath"));
const minimatch_1 = __importDefault(require("minimatch"));
const promise_ftp_1 = __importDefault(require("promise-ftp"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
class Client {
    constructor() {
        this.registerList = {};
    }
    async connect(configs) {
        this.configs = configs;
        if (this.configs.protocol == "ftp") {
            this.ftpClient = new promise_ftp_1.default();
            const serverMessage = await this.ftpClient.connect({
                password: this.configs.auth.password,
                user: this.configs.auth.username,
                port: this.configs.port,
                host: this.configs.host,
            });
            return serverMessage;
        }
        else {
            this.sftpClient = new ssh2_sftp_client_1.default();
            this.sftpClient.connect({
                password: this.configs.auth.password,
                username: this.configs.auth.username,
                port: this.configs.port,
                host: this.configs.host,
            });
            return "";
        }
    }
    getClient() {
        return (this.ftpClient || this.sftpClient);
    }
    async deleteDir(dir) {
        const client = this.getClient();
        return client.list(dir).then((lst) => {
            let dirNames = lst
                .filter((f) => f.type == "d" && f.name != ".." && f.name != ".")
                .map((f) => path_1.default.posix.join(dir, f.name));
            let fnames = lst
                .filter((f) => f.type != "d")
                .map((f) => path_1.default.posix.join(dir, f.name));
            // delete sub-directories and then all files
            return bluebird_1.default.mapSeries(dirNames, (dirName) => {
                // deletes everything in sub-directory, and then itself
                return this.deleteDir(dirName).then(() => client.rmdir(dirName));
            }).then(() => bluebird_1.default.mapSeries(fnames, (fname) => client.delete(fname)));
        });
    }
    async deleteRemote() {
        return this.deleteDir(this.configs.remoteRoot);
    }
    register(name, func) {
        this.registerList[name] = func;
    }
    log(text) {
        if (this.registerList["log"]) {
            this.registerList["log"](text);
        }
    }
    parseLocal(includes, excludes, localRootDir, relDir) {
        // reducer
        let handleItem = (acc, item) => {
            const currItem = path_1.default.join(fullDir, item);
            const newRelDir = path_1.default.relative(localRootDir, currItem);
            const filePath = currItem.replace(localRootDir, "");
            //是目录
            if (fs_1.default.lstatSync(currItem).isDirectory()) {
                //目录就加/*匹配目录
                if (this.canIncludePath(includes, excludes, filePath + "/*")) {
                    let tmp = this.parseLocal(includes, excludes, localRootDir, newRelDir);
                    acc = Object.assign(acc, tmp);
                }
                //解析下面所有的文件
            }
            else {
                //单文件
                if (this.canIncludePath(includes, excludes, newRelDir)) {
                    if (!acc[relDir]) {
                        acc[relDir] = [];
                    }
                    acc[relDir].push(item);
                }
            }
            return acc;
        };
        const fullDir = path_1.default.join(localRootDir, relDir);
        // Check if `startDir` is a valid location
        if (!fs_1.default.existsSync(fullDir)) {
            throw new Error(fullDir + " is not an existing location");
        }
        // Iterate through the contents of the `fullDir` of the current iteration
        const files = fs_1.default.readdirSync(fullDir);
        // Add empty array, which may get overwritten by subsequent iterations
        let acc = {};
        const res = files.reduce(handleItem, acc);
        return res;
    }
    canIncludePath(includes, excludes, filePath) {
        let go = (acc, item) => acc || minimatch_1.default(filePath, item, { matchBase: true });
        let canInclude = includes.reduce(go, false);
        // Now check whether the file should in fact be specifically excluded
        if (canInclude) {
            // if any excludes match return false
            if (excludes) {
                let go2 = (acc, item) => {
                    const res = minimatch_1.default(filePath, item, { matchBase: true });
                    return acc || res;
                };
                const canEnclude = excludes.reduce(go2, false);
                return canEnclude ? false : canInclude;
            }
        }
        // console.log("canIncludePath", include, filePath, res);
        return canInclude;
    }
    makeAllAndUpload(filemap) {
        let keys = Object.keys(filemap);
        return bluebird_1.default.mapSeries(keys, (key) => {
            // console.log("Processing", key, filemap[key]);
            return this.makeAndUpload(key, filemap[key]);
        });
    }
    async makeDir(newDirectory) {
        if (newDirectory === "/") {
            return "unused";
        }
        else {
            await this.getClient().mkdir(newDirectory, true);
            return "yes";
        }
    }
    makeAndUpload(relDir, fnames) {
        let newDirectory = upath_1.default.join(this.configs.remoteRoot, relDir);
        return this.makeDir(newDirectory).then(() => {
            // console.log("newDirectory", newDirectory);
            return bluebird_1.default.mapSeries(fnames, (fname) => {
                let tmpFileName = upath_1.default.join(this.configs.localRoot, relDir, fname);
                let tmp = fs_1.default.readFileSync(tmpFileName);
                const client = this.getClient();
                return client
                    .put(tmp, upath_1.default.join(this.configs.remoteRoot, relDir, fname))
                    .then(() => {
                    if (this.registerList["upload-file-end"]) {
                        this.registerList["upload-file-end"](tmpFileName);
                    }
                })
                    .catch((err) => {
                    return Promise.reject(err);
                });
            });
        });
    }
    checkIncludes(config) {
        config.excludes = config.excludes || [];
        if (!config.includes || !config.includes.length) {
            throw new Error("You need to specify files to upload - e.g. ['*', '**/*']");
        }
    }
    countFiles(filemap) {
        return Object.values(filemap).reduce((acc, item) => acc.concat(item))
            .length;
    }
}
exports.default = Client;
