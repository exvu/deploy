import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export default class Pack {
  constructor(private options: any) {
  }
  /**
   * 压缩文件
   */
  zip() {
    const zip = archiver('zip');

    return new Promise((resolve, reject) => {
      const {
        rootDir, output: { path: outputPath, filename, }
      } = this.options;
      if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath);
      }
      const filePath = path.normalize(outputPath + '/' + filename);
      //创建文件流
      const outputStream = fs.createWriteStream(filePath);
      outputStream.on('close', () => {
        resolve(filePath);
      }).on('error', (err) => {
        reject(err);
      });
      //输出文件
      zip.pipe(outputStream);
      zip.directory(rootDir, path.basename(path.normalize(rootDir)))
      zip.finalize();
    })
  }
}