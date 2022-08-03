"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../lib/Config");
exports.default = (0, Config_1.defineConfig)({
    host: "59.110.167.48",
    localRoot: __dirname + '/deploy.config.ts',
    remoteRoot: '',
    auth: {
        username: 'tuancanadmin',
        password: 'Ze7xMAHfY7ZwkHb6'
    }
});
