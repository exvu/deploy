import { Config } from "./Config";
import path from "path";
import PromiseBlue from "bluebird";
import fs from "fs";
import upath from "upath";
import minimatch from "minimatch";
import PromiseFtp from "promise-ftp";
import PromiseSftp from "ssh2-sftp-client";
export default class Client {
  private registerList: { [index: string]: Function } = {};
  private configs!: Config;
  private ftpClient!: PromiseFtp;
  private sftpClient!: PromiseSftp;
  public async connect(configs: Config): Promise<string> {
    this.configs = configs;
    if (this.configs.protocol == "ftp") {
      this.ftpClient = new PromiseFtp();
      const serverMessage: string = await this.ftpClient.connect({
        password: this.configs.auth.password,
        user: this.configs.auth.username,
        port: this.configs.port,
        host: this.configs.host,
      });
      return serverMessage;
    } else {
      this.sftpClient = new PromiseSftp();
      this.sftpClient.connect({
        password: this.configs.auth.password,
        username: this.configs.auth.username,
        port: this.configs.port,
        host: this.configs.host,
      });
      return "";
    }
  }
  public getClient(): PromiseFtp {
    return (this.ftpClient || this.sftpClient) as PromiseFtp;
  }
  public async deleteDir(dir: string): Promise<any> {
    const client = this.getClient();
    return client.list(dir).then((lst: any[]) => {
      let dirNames = lst
        .filter((f) => f.type == "d" && f.name != ".." && f.name != ".")
        .map((f) => path.posix.join(dir, f.name));

      let fnames = lst
        .filter((f) => f.type != "d")
        .map((f) => path.posix.join(dir, f.name));

      // delete sub-directories and then all files
      return PromiseBlue.mapSeries(dirNames, (dirName) => {
        // deletes everything in sub-directory, and then itself
        return this.deleteDir(dirName).then(() => client.rmdir(dirName));
      }).then(() =>
        PromiseBlue.mapSeries(fnames, (fname) => client.delete(fname))
      );
    });
  }
  public async deleteRemote() {
    return this.deleteDir(this.configs.remoteRoot);
  }
  register(name: "upload-file-end", func: Function) {
    this.registerList[name] = func;
  }
  parseLocal(
    includes: string[],
    excludes: string[],
    localRootDir: string,
    relDir: string
  ): { [index: string]: string[] } {
    // reducer
    let handleItem: any = (
      acc: { [index: string]: string[] },
      item: string
    ) => {
      const currItem = path.join(fullDir, item);
      const newRelDir = path.relative(localRootDir, currItem);

      if (fs.lstatSync(currItem).isDirectory()) {
        // currItem is a directory. Recurse and attach to accumulator
        let tmp = this.parseLocal(includes, excludes, localRootDir, newRelDir);
        for (let key in tmp) {
          if (tmp[key].length == 0) {
            delete tmp[key];
          }
        }
        return Object.assign(acc, tmp);
      } else {
        // currItem is a file
        // acc[relDir] is always created at previous iteration
        if (this.canIncludePath(includes, excludes, newRelDir)) {
          // console.log("including", currItem);
          if (!acc[relDir]) {
            acc[relDir] = [];
          }
          acc[relDir].push(item);
          return acc;
        }
      }
      return acc;
    };

    const fullDir = path.join(localRootDir, relDir);
    // Check if `startDir` is a valid location
    if (!fs.existsSync(fullDir)) {
      throw new Error(fullDir + " is not an existing location");
    }

    // Iterate through the contents of the `fullDir` of the current iteration
    const files = fs.readdirSync(fullDir);
    // Add empty array, which may get overwritten by subsequent iterations
    let acc = {};
    const res = files.reduce(handleItem, acc);
    return res;
  }
  canIncludePath(includes: string[], excludes: string[], filePath: string) {
    let go = (acc: boolean, item: string) =>
      acc || minimatch(filePath, item, { matchBase: true });
    let canInclude = includes.reduce(go, false);

    // Now check whether the file should in fact be specifically excluded
    if (canInclude) {
      // if any excludes match return false
      if (excludes) {
        let go2 = (acc: boolean, item: string) =>
          acc && !minimatch(filePath, item, { matchBase: true });
        canInclude = excludes.reduce(go2, true);
      }
    }
    // console.log("canIncludePath", include, filePath, res);
    return canInclude;
  }

  makeAllAndUpload(filemap: { [index: string]: string[] }) {
    let keys = Object.keys(filemap);
    return PromiseBlue.mapSeries(keys, (key: string) => {
      // console.log("Processing", key, filemap[key]);
      return this.makeAndUpload(key, filemap[key]);
    });
  }
  async makeDir(newDirectory: string): Promise<string> {
    if (newDirectory === "/") {
      return "unused";
    } else {
      await this.getClient().mkdir(newDirectory, true);
      return "yes";
    }
  }
  makeAndUpload(relDir: string, fnames: string[]) {
    let newDirectory = upath.join(this.configs.remoteRoot, relDir);
    return this.makeDir(newDirectory).then(() => {
      // console.log("newDirectory", newDirectory);
      return PromiseBlue.mapSeries(fnames, (fname) => {
        let tmpFileName = upath.join(this.configs.localRoot, relDir, fname);
        let tmp = fs.readFileSync(tmpFileName);

        const client = this.getClient();
        return client
          .put(tmp, upath.join(this.configs.remoteRoot, relDir, fname))
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
  checkIncludes(config: Config) {
    config.excludes = config.excludes || [];
    if (!config.includes || !config.includes.length) {
      throw new Error(
        "You need to specify files to upload - e.g. ['*', '**/*']"
      );
    }
  }
  countFiles(filemap: { [index: string]: string[] }) {
    return Object.values(filemap).reduce((acc, item) => acc.concat(item))
      .length;
  }
}
