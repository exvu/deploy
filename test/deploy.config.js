
module.exports = {
  rootDir: __dirname + '/../lib',
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
    'ls\n',
    'exit\n',
  ].join('')
}