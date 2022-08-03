"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib/");
exports.default = (0, lib_1.defineConfig)({
    host: "59.110.167.48",
    localRoot: __dirname + "/../lib",
    remoteRoot: "",
    deleteRemote: true,
    includes: ["*", "**/*"],
    excludes: ["test/*"],
    auth: {
        username: "tuancanadmin",
        password: "Ze7xMAHfY7ZwkHb6",
    },
});
