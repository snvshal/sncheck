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

program.command('init').description('Initialize sncheck configuration').option('-y, --yes', 'Use all detected tools automatically').option('-f, --force', 'Overwrite existing configuration').action((options: { yes?: boolean; force?: boolean }) => {
  initCommand(options);
});

program
  .command('run')
  .description('Run specific tasks')
  .option('--parallel', 'Run tasks in parallel')
  .option('--continue', 'Run all tasks even if one fails')
  .option('--verbose', 'Show full command output')
  .argument('[tasks...]', 'Tasks to run')
  .action((taskNames: string[] | undefined, options: { parallel?: boolean; continue?: boolean; verbose?: boolean }) => {
    runCommand(taskNames, options);
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
