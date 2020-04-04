const yargs = require('yargs');
const TodoApp = require('./todo');

const todoApp = TodoApp({});

yargs
  .command('add-todo [todo]', 'Create a new Todo', (args) => {
    args.positional('todo', {
      describe: 'Name of the todo',
    });
  }, (argv) => {
    const { todo } = argv;
    todoApp
      .broadcastTx('todo/add', todo)
      .then(() => {
        //
      })
      .catch((err) => {
        if (err) console.log(err);
      });
  })
  .help('h')
  .argv;
