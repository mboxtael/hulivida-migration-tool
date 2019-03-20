const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));
const SFCGenerator = require('./SFCGenerator');
const ScriptParser = require('./ScriptParser');
const styleParser = require('./styleParser');

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

const getFiles = async globPattern => {
  return await glob(globPattern);
};

const processFiles = async files => {
  const resourceDir = await searchResourceDir(process.cwd());

  return Promise.all(
    files.map(async scriptFile => {
      const templateFilename = scriptFile.replace(
        '_component.js',
        '_template.html'
      );
      const scriptContent = await readFile(scriptFile, 'utf-8');
      const templateContent = await readFile(templateFilename, 'utf-8');
      const { source: scriptParsed, styleFilename } = ScriptParser.parse(
        scriptContent
      );
      let styleContent = '';

      if (styleFilename) {
        styleContent = await readFile(
          path.join(resourceDir, styleFilename),
          'utf-8'
        );
      }

      const SFCFilename = scriptFile.replace('_component.js', '_component.vue');
      const SFCContent = SFCGenerator.generate(
        scriptParsed,
        templateContent,
        styleParser.parse(styleContent).source
      );

      await writeFile(SFCFilename, SFCContent);
    })
  );
};

const searchResourceDir = async currentPath => {
  const items = await readdir(currentPath);

  if (items.some(item => item === 'resource')) {
    return path.join(currentPath, 'resource');
  } else if (!items.some(item => item === 'src')) {
    return searchResourceDir(path.join(currentPath, '..'));
  }

  throw new Error('Resource folder not found');
};

module.exports.process = async globPattern => {
  try {
    const files = await getFiles(globPattern);

    console.log(`Files found: ${files.length}`);

    await processFiles(files);

    console.log('Done!');
  } catch (error) {
    throw error;
  }
};
