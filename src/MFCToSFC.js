const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));
const mkdirp = util.promisify(require('mkdirp'));
const SFCGenerator = require('./SFCGenerator');
const ScriptParser = require('./ScriptParser');
const StyleParser = require('./StyleParser');
const Formatter = require('./Formatter');

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

const processComponents = async () => {
  const files = await glob('**/*_component.js');
  const resourceDir = await searchResourceDir(process.cwd());

  console.log(`Components found: ${files.length}`);

  for (const scriptFile of files) {
    try {
      const templateFilename = scriptFile.replace(
        '_component.js',
        '_template.html'
      );
      const scriptContent = await readFile(scriptFile, 'utf-8');
      const templateContent = await readFile(templateFilename, 'utf-8');
      const {
        output: scriptParsed,
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
      let SFCContent = SFCGenerator.generate(
        scriptParsed,
        templateContent,
        StyleParser.parse(styleContent).output
      );

      try {
        SFCContent = Formatter.formatComponent(SFCContent);
      } catch (error) {
        console.log(
          `*** Formatting error ${scriptFile}`,
          '\n',
          error.toString()
        );
      }

      await writeToApp(SFCFilename, SFCContent);
    } catch (error) {
      console.log(`*** Error ${scriptFile}`, '\n', error.toString());
    }
  }

  console.log('Components processed!');
};

const processScripts = async () => {
  const files = await glob('**/!(*_component).js');

  console.log(`Scripts found: ${files.length}`);

  for (const scriptFilename of files) {
    try {
      const scriptContent = await readFile(scriptFilename, 'utf-8');
      let { output: scriptParsed } = ScriptParser.parse(scriptContent);

      try {
        scriptParsed = Formatter.format(scriptParsed);
      } catch (error) {
        console.log(
          `*** Formatting error ${scriptFilename}`,
          '\n',
          error.toString()
        );
      }

      await writeToApp(scriptFilename, scriptParsed);
    } catch (error) {
      console.log(`*** Error ${scriptFilename}`, '\n', error.toString());
    }
  }

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

const writeToApp = async (filename, content) => {
  const fileAppPath = path.resolve(filename).replace('/js', '/app');
  await mkdirp(path.dirname(fileAppPath));
  await writeFile(fileAppPath, content);
};

module.exports.process = async () => {
  await processComponents();
  await processScripts();
};
