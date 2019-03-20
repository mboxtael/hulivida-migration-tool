const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));
const mkdirp = util.promisify(require('mkdirp'));
const SFCGenerator = require('./SFCGenerator');
const ScriptParser = require('./ScriptParser');
const StyleParser = require('./StyleParser');

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

const processComponents = async () => {
  const files = await glob('**/*_component.js');
  const resourceDir = await searchResourceDir(process.cwd());

  console.log(`Components found: ${files.length}`);

  await Promise.all(
    files.map(async scriptFile => {
      const templateFilename = scriptFile.replace(
        '_component.js',
        '_template.html'
      );
      const scriptContent = await readFile(scriptFile, 'utf-8');
      const templateContent = await readFile(templateFilename, 'utf-8');
      const {
        source: scriptParsed,
        styleFilename
      } = ScriptParser.parseComponent(scriptContent);
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
        StyleParser.parse(styleContent).source
      );

      const appSFCPath = path.resolve(SFCFilename).replace('/js', '/app');
      await mkdirp(path.dirname(appSFCPath));
      await writeFile(appSFCPath, SFCContent);
    })
  );

  console.log('Components processed!');
};

const processScripts = async () => {
  const files = await glob('**/!(*_component).js');

  console.log(`Scripts found: ${files.length}`);

  await Promise.all(
    files.map(async scriptFilename => {
      const scriptContent = await readFile(scriptFilename, 'utf-8');
      const { source: scriptParsed } = ScriptParser.parse(scriptContent);

      const appScriptPath = path.resolve(scriptFilename).replace('/js', '/app');
      await mkdirp(path.dirname(appScriptPath));
      await writeFile(appScriptPath, scriptParsed);
    })
  );

  console.log('Scripts processed!');
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

module.exports.process = async () => {
  await processComponents();
  await processScripts();
};
