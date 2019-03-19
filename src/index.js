const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));
const { Command, flags } = require('@oclif/command');
const lebab = require('lebab');
const AMDToESM = require('amd-to-es6');

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
    .replace(/template(: Template)?,\n\n/, '');
};

const removeStyleImport = source => {
  return source.replace(
    new RegExp("import 'scss/(?!(components/cards/card.scss)).*';"),
    ''
  );
};

const ES5ToES6 = source => {
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

const searchResourceDir = async currentPath => {
  const items = await fs.readdir(currentPath);

  if (items.some(item => item === 'resource')) {
    return path.join(currentPath, 'resource');
  } else if (!items.some(item => item === 'src')) {
    return searchResourceDir(path.join(currentPath, '..'));
  }

  throw new Error('Resource folder not found');
};

class MfcToSfcCommand extends Command {
  async run() {
    const { flags } = this.parse(MfcToSfcCommand);
    const resourceDir = await searchResourceDir(process.cwd());

    try {
      const files = await glob('**/*_component.js');

      this.log(`Files found: ${files.length}`);

      await Promise.all(
        files.map(async scriptFile => {
          const templateFilename = scriptFile.replace(
            '_component.js',
            '_template.html'
          );
          const singleFilename = scriptFile.replace(
            '_component.js',
            '_component.vue'
          );
          const scriptContent = await fs.readFile(scriptFile, 'utf-8');
          const templateContent = await fs.readFile(templateFilename, 'utf-8');

          let script = removeUnusedCode(
            addDynamicImports(
              ES5ToES6(AMDToESM(removeDynamicImports(scriptContent)))
            ).trim()
          );

          const styleMatch = new RegExp(
            "import '(scss/(?!(components/cards/card.scss)).*?)';",
            'm'
          ).exec(script);

          let singleContent = '';

          if (styleMatch && styleMatch[1]) {
            script = removeStyleImport(script);
            const styleFilename = styleMatch[1];
            const styleContent = await fs.readFile(
              path.join(resourceDir, styleFilename)
            );

            singleContent = `
          <script>
          ${script}
          </script>
  
          <template>
          ${templateContent}
          </template>
  
          <style lang="scss">
          ${styleContent}
          </style>
          `;
          } else {
            singleContent = `
          <script>
          ${script}
          </script>
  
          <template>
          ${templateContent}
          </template>
          `;
          }

          await fs.writeFile(singleFilename, singleContent);
        })
      );

      this.log('Done!');
    } catch (error) {
      console.log(error);
    }
  }
}

MfcToSfcCommand.description = `Utility to help the migration process of Vue's SFC
...
This utility migrates an structure of vue components defined in multiple files and produces
the equivalent Vue single file components, for example, take this structure:
|- hello-worl 
  |- hello-worl_component.js
  |- hello-worl_template.html

the result will be
|- hello-worl
  |- hello-worl_component.js
  |- hello-worl_template.html
  |- hello-worl_component.vue
`;

MfcToSfcCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' }),
};

module.exports = MfcToSfcCommand;
