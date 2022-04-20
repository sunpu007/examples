const program = require('commander');
const path = require('path');

// 配置指令命令
const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: [
      'td-cli create <project-name>',
    ],
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'td-cli config set <k><v>',
      'td-cli config get <k>',
    ],
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: [],
  },
};

// 配置命令
Reflect.ownKeys(mapActions).forEach(action => {
  program
    .command(action)  // 配置命令的名字
    .alias(mapActions[action].alias)  // 命令的别名
    .description(mapActions[action].description)  // 命令对应的描述
    .action(_ => {
      if (action === '*') {
        console.log(mapActions[action].description);
      } else {
        // console.log(action);
        require(path.resolve(__dirname, action))(...process.argv.slice(3))
      }
    });
});

program.on('--help', _ => {
  console.log('\nExample:');
  Reflect.ownKeys(mapActions).forEach(actions => {
    mapActions[actions].examples.forEach(example => {
      console.log(example);
    });
  });
});


const { version } = require('./constants');
program.version(version).parse(process.argv);