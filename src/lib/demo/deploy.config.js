"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_1 = require("@exvu/deploy");
exports.default = deploy_1.defineConfig({
    host: "59.110.167.48",
    localRoot: __dirname + '/deploy.config.ts',
    remoteRoot: '',
    auth: {
        username: 'tuancanadmin',
        password: 'Ze7xMAHfY7ZwkHb6'
    }
});
