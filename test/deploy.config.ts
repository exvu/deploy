import { defineConfig } from "../lib/";
export default defineConfig({
  host: "59.110.167.48",
  localRoot: __dirname + "/../src",
  remoteRoot: "",
  deleteRemote: true,
  includes: ["*", "**/*"],
  excludes: ["test/*"],
  auth: {
    username: "tuancanadmin",
    password: "Ze7xMAHfY7ZwkHb6",
  },
});
