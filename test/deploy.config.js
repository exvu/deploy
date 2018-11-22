
module.exports = {
  rootDir: __dirname + '/../',
  output: {
    path: __dirname + '/zip',
    filename: `build.zip`,
  },
  server: {
    host: 'api.t.yyx-tech.com',
    username: 'web',
    port: 22,
    path: '/home/web/'
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