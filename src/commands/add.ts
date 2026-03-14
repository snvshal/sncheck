import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { loadConfig, configExists } from '../config/loadConfig.js';
import { addTaskToConfig } from '../config/writeConfig.js';
import type { Task } from '../types/index.js';

export async function addCommand(): Promise<void> {
  if (!configExists()) {
    console.log(chalk.yellow("No configuration found. Run 'check init' first."));
    process.exit(1);
  }

  const tasks = await loadConfig();

  const name = await input({
    message: 'Task name:',
    validate: (value) => {
      if (!value.trim()) {
        return 'Task name is required';
      }
      if (tasks.some((t) => t.name === value)) {
        return 'Task name already exists';
      }
      return true;
    },
  });

  const cmd = await input({
    message: 'Command:',
    validate: (value) => {
      if (!value.trim()) {
        return 'Command is required';
      }
      return true;
    },
  });

  const description = await input({
    message: 'Description (optional):',
  });

  const task: Task = {
    name: name.trim(),
    cmd: cmd.trim(),
    description: description.trim() || undefined,
  };

  addTaskToConfig(task);

  console.log(chalk.green(`\nTask '${name}' added successfully!`));
}
