import chalk from 'chalk';
import { checkbox, confirm } from '@inquirer/prompts';
import { detectTools } from '../utils/detectTools.js';
import { writeConfig } from '../config/writeConfig.js';
import type { Task } from '../types/index.js';

export async function initCommand(): Promise<void> {
  console.log(chalk.blue('Initializing sncheck configuration...\n'));

  const detectedProviders = detectTools();

  if (detectedProviders.length === 0) {
    console.log(chalk.yellow('No common tools detected. You can add tasks manually.'));
  } else {
    console.log(chalk.green('Detected the following tools:'));
    detectedProviders.forEach((p) => {
      console.log(`  - ${p.name}: ${p.description}`);
    });
  }

  const defaultTasks: Task[] = detectedProviders.map((p) => ({
    name: p.name,
    cmd: p.cmd,
    description: p.description,
  }));

  const shouldAutoSelect = await confirm({
    message: 'Add all detected tasks to config?',
    default: true,
  });

  let selectedTasks: Task[] = [];

  if (shouldAutoSelect) {
    selectedTasks = defaultTasks;
  } else {
    const choices = defaultTasks.map((t) => ({
      name: `${t.name} (${t.cmd})`,
      value: t,
      checked: true,
    }));

    const selected = await checkbox({
      message: 'Select tasks to add:',
      choices,
    });

    selectedTasks = selected as Task[];
  }

  if (selectedTasks.length > 0) {
    writeConfig(selectedTasks);
    console.log(chalk.green(`\nConfiguration written to sncheck.config.ts`));
    console.log(chalk.blue("Run 'sncheck' to execute all tasks"));
  } else {
    console.log(chalk.yellow('\nNo tasks selected. Configuration not created.'));
  }
}
