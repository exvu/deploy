import minimatch from "minimatch";

console.log([
  minimatch("app/*", "app/**", { matchBase: true }),
  minimatch("app/a", "app/**", { matchBase: true }),
  minimatch("app/a/a", "app/**", { matchBase: true }),
  minimatch("/a/app/a11/a", "**app/**", { matchBase: true }),
  minimatch("/a/app/a11/a.png", "a.png", { matchBase: true }),
  minimatch("/a/app/a11/a.png", "**/a11/a.png", { matchBase: true }),
]);
