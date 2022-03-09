'use strict';
import * as webpack from 'webpack';

module.exports = (config: webpack.Configuration) => {
  //  do something..
  const item = {
    alias: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    name: 'vscode',
  };

  if (config.resolve) {
    config.resolve.alias = [];
    config.resolve.alias.push(item);
  }

  // if (config.resolve) {
  //   config.resolve.alias = {
  //     vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
  //   };
  // }

  console.log(config);
  return config;
};
