import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { loadConfig, configExists } from '../config/loadConfig.js';
import { writeConfig } from '../config/writeConfig.js';

export async function editCommand(): Promise<void> {
  if (!configExists()) {
    console.log(chalk.yellow("No configuration found. Run 'sncheck init' first."));
    process.exit(1);
  }

  const tasks = await loadConfig();

  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks to edit.'));
    process.exit(0);
  }

  const taskNames = tasks.map((t) => t.name);

  const selectedName = await input({
    message: 'Enter task name to edit:',
    validate: (value) => {
      if (!taskNames.includes(value)) {
        return `Task '${value}' not found. Available: ${taskNames.join(', ')}`;
      }
      return true;
    },
  });

  const taskIndex = tasks.findIndex((t) => t.name === selectedName);
  const task = tasks[taskIndex];

  console.log(chalk.blue(`\nEditing task: ${task.name}`));
  console.log(`  Current command: ${task.cmd}`);
  if (task.description) {
    console.log(`  Current description: ${task.description}`);
  }

  const newName = await input({
    message: 'New name (or press Enter to keep current):',
    default: task.name,
    validate: (value) => {
      if (value && value !== task.name && tasks.some((t) => t.name === value)) {
        return 'Task name already exists';
      }
      return true;
    },
  });

  const newCmd = await input({
    message: 'New command (or press Enter to keep current):',
    default: task.cmd,
    validate: (value) => {
      if (!value.trim()) {
        return 'Command is required';
      }
      return true;
    },
  });

  const newDescription = await input({
    message: 'Description (or press Enter to keep current):',
    default: task.description || '',
  });

  tasks[taskIndex] = {
    name: newName.trim() || task.name,
    cmd: newCmd.trim() || task.cmd,
    description: newDescription.trim() || undefined,
  };

  writeConfig(tasks);

  console.log(chalk.green('\nTask updated successfully!'));
}
