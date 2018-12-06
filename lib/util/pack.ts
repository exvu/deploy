import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import filesize from 'filesize';


interface Option {
  rootDir: string,
  output: { path: string, filename: string },
  rules: Array<{
    test: RegExp
  }>,
  filePath: string
}
export default class Pack {

  private options: Option;
  private files: Array<string> = [];
  private packUtil:any;
  private listener:Array<any>=[];
  constructor(_option: any) {
    let {
      rootDir, output: { path: outputPath, filename }
      , rules,
    } = _option;
    const filePath = path.normalize(outputPath + '/' + filename);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    for (let { test, } of rules) {
      if (Object.prototype.toString.call(test) !== '[object RegExp]') {
        if (typeof test !== 'string') {
          throw new Error('rules.test必须是正则或字符串')
        }
        test = new RegExp(test);
      }
    }
    this.packUtil = archiver('zip');
    this.options = {
      rootDir: path.normalize(rootDir),
      rules,
      output: {
        path: outputPath, filename,
      },
      filePath
    }
    this.matchFile();
  }
  on(name:string,callback: any){
    if(name=='init'){
      this.listener.push(callback);
    }
    this.packUtil.on(name,callback);
    return this;
  }
  /**
   * 压缩文件
   */
  zip() {
    return new Promise((resolve, reject) => {
      const {
        filePath,rootDir
      } = this.options;
      //创建文件流
      const outputStream = fs.createWriteStream(filePath);
      outputStream.on('close', () => {
        resolve({
          path: filePath,
          size: filesize(fs.statSync(filePath).size),
          counts: this.files.length,
        });
      }).on('error', (err) => {
        reject(err);
      });
      //输出文件
      this.packUtil.pipe(outputStream);
      this.files.forEach((file, index) => {
        console.log(rootDir+file);
        this.packUtil.file(file, {
          name: rootDir+file
        });
      })
      this.listener.forEach(callback=>{
         callback({
          path: filePath,
          counts: this.files.length,
        });
      });
      this.packUtil.finalize();
    })
  }
  matchFile(_path = this.options.rootDir) {
    const {
      rules,
    } = this.options;
    const files = fs.readdirSync(_path);
    files.forEach((file: string) => {
      const filePath = path.normalize(_path + '/' + file);
      const info = fs.statSync(filePath);
      if (info.isDirectory()) {
        this.matchFile(filePath);
      } else {
        rules.every(({ test: regex, }: { test: RegExp, }) => {
          if (regex.test(filePath)) {
            this.files.push(filePath.replace(this.options.rootDir, ''));
            return false;
          }
          return true;
        })
      }
    });
    return this.files
  }
}