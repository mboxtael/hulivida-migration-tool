const fs = require('fs');
const glob = require('glob');
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

class MfcToSfcCommand extends Command {
  async run() {
    const { flags } = this.parse(MfcToSfcCommand);

    glob('**/*_component.js', (err, files) => {
      this.log(`Files found: ${files.length}`);

      files.forEach(scriptFile => {
        fs.readFile(scriptFile, 'utf-8', (err, content) => {
          if (err) throw err;

          const templateFilename = scriptFile.replace(
            '_component.js',
            '_template.html'
          );

          fs.readFile(templateFilename, 'utf-8', (err, templateContent) => {
            if (err) throw err;

            const singleFilename = scriptFile.replace(
              '_component.js',
              '_component.vue'
            );

            const script = removeUnusedCode(
              addDynamicImports(
                ES5ToES6(AMDToESM(removeDynamicImports(content)))
              ).trim()
            );

            const singleContent = `
              <script>
              ${script}
              </script>
    
              <template>
              ${templateContent}
              </template>
            `;

            fs.writeFile(singleFilename, singleContent, err => {
              if (err) throw err;

              this.log('Done!');
            });
          });
        });
      });
    });
  }
}

MfcToSfcCommand.description = `Describe the command here
...
Extra documentation goes here
`;

MfcToSfcCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' }),
  name: flags.string({ char: 'n', description: 'name to print' })
};

module.exports = MfcToSfcCommand;
