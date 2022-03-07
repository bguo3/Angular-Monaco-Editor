"use strict";

const path = require("path");
const dist = path.resolve(__dirname, "dist/angular-monaco-editor");

module.exports = (env, argv) => ({
  entry: {
    "main": "./src/main.ts",
    "editor.worker": "monaco-editor-core/esm/vs/editor/editor.worker.js",
  },
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    path: dist,
  },
  resolve: {
    alias: {
      vscode: require.resolve("monaco-languageclient/lib/vscode-compatibility"),
    },
  },
  stats: {
    colors: true,
  },
});
