#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { runCommand } from './commands/run.js';
import { addCommand } from './commands/add.js';
import { editCommand } from './commands/edit.js';
import { removeCommand } from './commands/remove.js';
import { watchCommand } from './commands/watch.js';

const program = new Command();

program
  .name('sncheck')
  .description('A CLI tool that orchestrates common project quality checks')
  .version('1.0.0');

program.command('init').description('Initialize sncheck configuration').action(initCommand);

program
  .command('run')
  .description('Run specific tasks')
  .argument('[tasks...]', 'Tasks to run')
  .action((taskNames: string[] | undefined) => {
    runCommand(taskNames);
  });

program.command('add').description('Add a new task').action(addCommand);

program.command('edit').description('Edit an existing task').action(editCommand);

program.command('remove').description('Remove a task').action(removeCommand);

program.command('watch').description('Run tasks in watch mode').action(watchCommand);

const args = process.argv.slice(2);
if (args.length === 0) {
  runCommand();
} else {
  program.parse();
}
