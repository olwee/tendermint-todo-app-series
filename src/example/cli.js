const yargs = require('yargs');
const TodoApp = require('./todo');

const todoApp = TodoApp({ cache: { appData: { todoList: [] } } });

yargs
  .command('add-todo [todo]', 'Create a new Todo', (args) => {
    args.positional('todo', {
      describe: 'Name of the todo',
    });
  }, (argv) => {
    const { todo } = argv;
    todoApp
      .broadcastTx('add', todo)
      .then(() => {
        //
      })
      .catch((err) => {
        if (err) console.log(err);
      });
  })
  .command('list', 'List all Todo(s)', (args) => {
    args
      .options('height', {
        demandOption: false,
      })
      .options('data', {
        alias: 'd',
        demandOption: false,
      })
      .options('path', {
        alias: 'p',
        demandOption: false,
      });
  },
  (argv) => {
    const { path, height, data } = argv;
    todoApp
      .queryCLI({ path, height, data })
      .then(() => {
        //
      })
      .catch((err) => {
        if (err) console.log(err);
      });
  })
  .help('h')
  .argv;
