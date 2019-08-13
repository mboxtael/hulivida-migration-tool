[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mfc-to-sfc.svg)](https://www.npmjs.com/package/@mboxtael/hulivida-migration-tool)
[![Downloads/week](https://img.shields.io/npm/dw/mfc-to-sfc.svg)](https://www.npmjs.com/package/@mboxtael/hulivida-migration-tool)
[![License](https://img.shields.io/npm/l/mfc-to-sfc.svg)](https://github.com/mboxtael/hulivida-migration-tool/blob/master/package.json)

hulivida-migration-tool
==========

Migrate a structure of vue components in multiple files to SFC

# How it works
The tool works as follows:
- will look for all the files with the `_component.js` postfix under the directory where the command was executed
- for each file found, it will look for the template that match with the component name without the `_component.js` postfix, also if the component imports a style file, it will look for that style in the `src/resource/scss` directory.
- the script is parsed, and then the template, style and script are joined in a SFC
- the resulting SFC will be placed in the same module path under the `src/public/app` directory.

# Installation
The tool can be installed via npm
```bash
npm i @mboxtael/hulivida-migration-tool
```

# Usage
Go to the directory where the components are to be migrated, the directory can also contain subdirectories, and run the following command
```bash
hulivida-migration-tool
```
