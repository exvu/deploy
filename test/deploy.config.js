
module.exports = {
  //部署目录
  rootPath: __dirname + '/../',
  //压缩配置
  output: {
    format: 'zip',
    path: __dirname + '/zip',
    filename: `build`,
  },
  server: {
    host: '127.0.0.1',
    username: 'test',
    port: 22,
    password: 'test',
    path: '/home/web/test',
  },
  shells: [
    'cd /home/web/test',
    'unzip -d ./build build.zip',
    'exit',
  ],
  rules: [
    {
      test: /\.ts$/,
    },
    {
      //不包含json结尾的文件
      test: /((?<!\.json))$/,
    },
  ]
}