# deploy 使用文档

deploy 是一款将本地代码进行打包通过 ssh 协议发布到服务器的工具.

1. 工具支持对指定文件进行打包.
2. 工具支持远程命令
3. 工具提供命令执行打包.

# 用法

不指定文件  
配置文件默认是当前命令下的 deploy.config.js 文件,工具同时也支持命令行配置文件路

```linux
deploy --config dev.config.js
```

yarn global add file:/Users/exvu/code/yungeeks/deploy/
