const lebab = require('lebab');
const AMDToESM = require('amd-to-es6');

const getStyleFilename = source => {
  const styleMatch = new RegExp(
    "'(scss/(?!(components/cards/card.scss)).*?)'",
    'm'
  ).exec(source);

  if (styleMatch && styleMatch[1]) {
    return styleMatch[1];
  }

  return null;
};

const removeDynamicImports = source => {
  return source.replace(
    new RegExp(/import(\((\w|\/|-|_|')+\)?)/, 'g'),
    'noimport$1'
  );
};

const addDynamicImports = source => {
  return source.replace(
    new RegExp(/noimport(\((\w|\/|-|_|')+\)?)/, 'g'),
    'import$1'
  );
};

const removeUnusedCode = source => {
  return source
    .replace('Vue.extend(', '')
    .replace(/}\);$/, '};')
    .replace(/import\sVue\sfrom\s'vue';\n/, '')
    .replace(/import\s(T|t)emplate\sfrom\s'.+';\n/, '')
    .replace(/import\sComponentLoader\sfrom\s'.+';\n/, '')
    .replace(/template(: Template)?,\n\n/, '')
    .replace(
      new RegExp("import 'scss/(?!(components/cards/card.scss)).*';"),
      ''
    );
};

const toES6 = source => {
  const { code } = lebab.transform(source, [
    'arrow',
    'arrow-return',
    'obj-shorthand',
    'obj-method',
    'no-strict',
    'let',
    'template'
  ]);

  return code;
};

const toESM = source => {
  return AMDToESM(source);
};

module.exports.parse = source => {
  let parsedSource = source;

  // First we get the style filename because later it will be removed
  const styleFilename = getStyleFilename(source);

  parsedSource = removeDynamicImports(parsedSource);
  parsedSource = toESM(parsedSource);
  parsedSource = toES6(parsedSource);
  parsedSource = addDynamicImports(parsedSource);
  parsedSource = removeUnusedCode(parsedSource);

  return { styleFilename, source: parsedSource };
};
