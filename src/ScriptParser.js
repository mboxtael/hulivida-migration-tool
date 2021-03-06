const lebab = require('lebab');

const extractStyleFilename = source => {
  const styleMatch = new RegExp(
    /'(scss\/(?!(?:components\/cards\/card\.scss)).*?)'/,
    'm'
  ).exec(source);

  if (styleMatch && styleMatch[1]) {
    return styleMatch[1];
  }

  return null;
};

const removeDynamicImports = source => {
  return source.replace(new RegExp(/import\('/, 'g'), "noimport('");
};

const addDynamicImports = source => {
  return source.replace(new RegExp(/noimport\('/, 'g'), "import('");
};

const removeComponentDefinition = source => {
  const componentDefinition = /(?:(?:const\s\w+\s=)|(?:export\sdefault))\sVue.extend\(({(\s|\n|.)+})\);(?:\s*export\sdefault\s\w+;)?/;

  return source.replace(componentDefinition, 'export default $1;');
};

const removeUnusedCode = source => {
  return source
    .replace(/import\s(?:T|t)emplate\sfrom\s'.+';\s/, '')
    .replace(/import\sComponentLoader\sfrom\s'.+';\s/, '')
    .replace(/template(?:: Template)?,\s/, '')
    .replace(/import\s'scss\/(?!(?:components\/cards\/card\.scss)).*';/, '');
};

const toES6 = source => {
  const { code } = lebab.transform(source, [
    'arrow',
    'obj-shorthand',
    'obj-method',
    'no-strict',
    'let',
    'template'
  ]);

  return code;
};

const AMDtoES6 = source => {
  try {
    return addDynamicImports(toES6(removeDynamicImports(source)));
  } catch (error) {
    throw error;
  }
};

module.exports.parseComponent = source => {
  let parsedSource = source;

  // First we get the style filename because later it will be removed
  const styleFilename = extractStyleFilename(source);

  parsedSource = AMDtoES6(parsedSource);
  parsedSource = removeComponentDefinition(parsedSource);
  parsedSource = removeUnusedCode(parsedSource);

  return { styleFilename, output: parsedSource };
};

module.exports.parse = source => {
  let parsedSource = source;

  parsedSource = AMDtoES6(parsedSource);

  return { output: parsedSource };
};
