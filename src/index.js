const { Command, flags } = require('@oclif/command');
const MFCToSFC = require('./MFCToSFC');

class MFCToSFCCommand extends Command {
  async run() {
    const { flags } = this.parse(MFCToSFCCommand);

    await MFCToSFC.process('**/*_component.js');
  }
}

MFCToSFCCommand.description = `Utility to help the migration process of Vue's SFC
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

MFCToSFCCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' })
};

module.exports = MFCToSFCCommand;
