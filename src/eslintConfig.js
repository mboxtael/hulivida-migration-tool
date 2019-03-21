const baseConfig = {
  baseConfig: {
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          tabWidth: 4,
          useTabs: false,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          bracketSpacing: true,
          arrowParens: 'avoid'
        }
      ],
      'no-redeclare': 0,
      'no-useless-escape': 1
    },
    parserOptions: {
      parser: 'babel-eslint',
      ecmaVersion: 2018
    },
    env: {
      es6: true,
      amd: true
    },
    globals: {
      document: true,
      window: true,
      setTimeout: true,
      setInterval: true,
      clearTimeout: true,
      clearInterval: true,
      alert: true,
      HH: true,
      log: true,
      Logger: true,
      $: true,
      jQuery: true,
      navigator: true
    }
  },
  fix: true,
  envs: ['browser', 'mocha'],
  useEslintrc: false
};

const vueConfig = JSON.parse(JSON.stringify(baseConfig));
vueConfig.baseConfig.extends.push('plugin:vue/essential');
vueConfig.baseConfig.rules['vue/html-closing-bracket-newline'] = [
  'error',
  {
    singleline: 'never',
    multiline: 'never'
  }
];

module.exports.base = baseConfig;
module.exports.vue = vueConfig;
