const baseConfig = {
  parser: 'babel',
  printWidth: 100,
  tabWidth: 4,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid'
};

const vueConfig = { ...baseConfig };
vueConfig.parser = 'vue';

module.exports.base = baseConfig;
module.exports.vue = vueConfig;
