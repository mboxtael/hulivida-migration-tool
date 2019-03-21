const prettier = require('prettier');
const CLIEngine = require('eslint').CLIEngine;
const eslintConfig = require('./eslintConfig');
const prettierConfig = require('./prettierConfig');

const format = (source, configKey) => {
  const eslintCli = new CLIEngine(eslintConfig[configKey]);
  const output = prettier.format(source, prettierConfig[configKey]);
  eslintResults = eslintCli.executeOnText(output).results[0];

  // if eslint makes fixes, the code will be in output
  return eslintResults.source ? eslintResults.source : eslintResults.output;
};

module.exports.formatComponent = source => {
  return format(source, 'vue');
};

module.exports.format = source => {
  return format(source, 'base');
};
