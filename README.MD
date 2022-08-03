# deploy 使用文档

deploy 是一款将本地代码进行打包通过 ftp、sftp 协议发布到服务器的工具.

1. 工具支持对指定文件进行打包.
2. 工具支持远程命令
3. 工具提供命令执行打包.

# 用法

查看使用文档

```linux
deploy -h
```

初始化配置，会在当前目录生成配置文件

```linux

deploy init

deploy init -c config.js //-c指定配置文件名称
```

一键发布

```linux

deploy run

deploy run -c config.js //-c指定配置文件名称
```

yarn global add file:/Users/exvu/code/yungeeks/deploy/
