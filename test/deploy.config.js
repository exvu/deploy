
module.exports = {
  rootDir: __dirname + '/../lib/',
  output: {
    path: __dirname + '/zip',
    filename: `build.zip`,
  },
  server: {
    host: '127.0.0.1',
    username: 'exvu',
    port: 22,
    password:'exvu8023YUN',
    path: __dirname + '/test/',
  },
  shell: [
    'ls',
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