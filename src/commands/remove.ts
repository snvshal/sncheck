import chalk from 'chalk';
import { input, confirm } from '@inquirer/prompts';
import { loadConfig, configExists } from '../config/loadConfig.js';
import { writeConfig } from '../config/writeConfig.js';

export async function removeCommand(): Promise<void> {
  if (!configExists()) {
    console.log(chalk.yellow("No configuration found. Run 'check init' first."));
    process.exit(1);
  }

  const tasks = await loadConfig();

  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks to remove.'));
    process.exit(0);
  }

  const taskNames = tasks.map((t) => t.name);

  const selectedName = await input({
    message: 'Enter task name to remove:',
    validate: (value) => {
      if (!taskNames.includes(value)) {
        return `Task '${value}' not found. Available: ${taskNames.join(', ')}`;
      }
      return true;
    },
  });

  tasks.find((t) => t.name === selectedName);

  const confirmed = await confirm({
    message: `Remove task '${selectedName}'?`,
    default: false,
  });

  if (!confirmed) {
    console.log(chalk.yellow('Cancelled.'));
    process.exit(0);
  }

  const newTasks = tasks.filter((t) => t.name !== selectedName);
  writeConfig(newTasks);

  console.log(chalk.green(`\nTask '${selectedName}' removed successfully!`));
}
