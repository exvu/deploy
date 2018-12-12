"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Pack {
    constructor(_option) {
        this.files = [];
        let { rootDir, output: { path: outputPath, filename }, rules, } = _option;
        const filePath = path_1.default.normalize(outputPath + '/' + filename);
        if (!fs_1.default.existsSync(outputPath)) {
            fs_1.default.mkdirSync(outputPath);
        }
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        for (let { test, } of rules) {
            if (Object.prototype.toString.call(test) !== '[object RegExp]') {
                if (typeof test !== 'string') {
                    throw new Error('rules.test必须是正则或字符串');
                }
                test = new RegExp(test);
            }
        }
        this.options = {
            rootDir: path_1.default.normalize(rootDir),
            rules,
            output: {
                path: outputPath, filename,
            },
            filePath
        };
        this.matchFile();
    }
    /**
     * 压缩文件
     */
    zip() {
        const zip = archiver_1.default('zip');
        return new Promise((resolve, reject) => {
            const { filePath } = this.options;
            //创建文件流
            const outputStream = fs_1.default.createWriteStream(filePath);
            outputStream.on('close', () => {
                resolve(filePath);
            }).on('error', (err) => {
                reject(err);
            });
            //输出文件
            zip.pipe(outputStream);
            this.files.forEach((file) => {
                zip.file(file, {
                    name: file
                });
            });
            zip.finalize();
        });
    }
    matchFile(_path = this.options.rootDir) {
        const { rules, } = this.options;
        const files = fs_1.default.readdirSync(_path);
        files.forEach((file) => {
            const filePath = path_1.default.normalize(_path + '/' + file);
            const info = fs_1.default.statSync(filePath);
            if (info.isDirectory()) {
                this.matchFile(filePath);
            }
            else {
                rules.every(({ test: regex, }) => {
                    if (regex.test(filePath)) {
                        this.files.push(filePath.replace(this.options.rootDir, ''));
                        return false;
                    }
                    return true;
                });
            }
        });
        return this.files;
    }
}
exports.default = Pack;
