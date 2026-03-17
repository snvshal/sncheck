import chalk from 'chalk';
import { checkbox } from '@inquirer/prompts';
import type { Status } from '@inquirer/core';
import fs from 'fs';
import { detectTools } from '../utils/detectTools.js';
import { writeConfig } from '../config/writeConfig.js';
import type { Task } from '../types/index.js';

const CONFIG_FILE = 'sncheck.config.js';

interface InitOptions {
  yes?: boolean;
  force?: boolean;
}

export async function initCommand(options?: InitOptions): Promise<void> {
  const configExists = fs.existsSync(CONFIG_FILE);

  if (configExists && !options?.force) {
    console.log(chalk.yellow(`Config file "${CONFIG_FILE}" already exists.`));
    console.log(chalk.blue('Use --force to overwrite.'));
    return;
  }

  if (configExists && options?.force) {
    console.log(chalk.yellow(`Overwriting existing "${CONFIG_FILE}"...\n`));
  } else {
    console.log(chalk.blue('Initializing sncheck configuration...\n'));
  }

  const detectedProviders = detectTools();

  if (detectedProviders.length === 0) {
    console.log(chalk.yellow('No common tools detected. You can add tasks manually.'));
    return;
  }

  console.log(chalk.green(`Found ${detectedProviders.length} tool(s):\n`));

  const defaultTasks: Task[] = detectedProviders.map((p) => ({
    name: p.name,
    cmd: p.cmd,
    description: p.description,
  }));

  let selectedTasks: Task[] = [];

  if (options?.yes) {
    selectedTasks = defaultTasks;
    console.log(chalk.blue('Using all detected tools automatically...\n'));
  } else {
    const maxNameLen = Math.max(...defaultTasks.map((t) => t.name.length));
    const choices = defaultTasks.map((t) => ({
      name: t.name,
      value: t,
      checked: true,
      description: t.cmd,
    }));

    const accent = chalk.hex('#7dd3fc'); // sky
    const success = chalk.hex('#34d399'); // emerald
    const muted = chalk.hex('#94a3b8'); // slate
    const dim = chalk.hex('#64748b'); // slate dark
    const cursor = accent('▸');

    try {
      const selected = await checkbox({
        message: 'Select tools to include:',
        choices,
        theme: {
          icon: {
            checked: accent('●'),
            unchecked: muted('○'),
            cursor,
            disabledChecked: dim('●'),
            disabledUnchecked: dim('○'),
          },
          prefix: {
            idle: accent('›'),
            done: success('✔'),
            canceled: dim('✖'),
          },
          style: {
            message: (text: string, status: Status) =>
              status === 'done' ? chalk.bold(text) : chalk.bold(accent(text)),
            answer: (text: string) => chalk.hex('#e2e8f0')(text),
            highlight: (text: string) => chalk.bold(accent(text)),
            description: (text: string) => muted(`  ${text}`),
            disabled: (text: string) => dim(text),
            keysHelpTip: (keys: [string, string][]) =>
              muted(keys.map(([key, action]) => `${chalk.bold(key)} ${action}`).join(' · ')),
          },
        },
      });

      console.log('\n');

      selectedTasks = selected as Task[];

      console.log(chalk.blue('Selected tools:'));
      for (const task of selectedTasks) {
        console.log(`  ${chalk.green('✓')} ${task.name.padEnd(maxNameLen)}   ${task.cmd}`);
      }
      console.log('');
    } catch {
      console.log(chalk.yellow('\nCancelled. Configuration not created.'));
      return;
    }
  }

  if (selectedTasks.length > 0) {
    writeConfig(selectedTasks);
    console.log(chalk.green(`Configuration written to sncheck.config.js`));
    console.log(chalk.blue("Run 'sncheck' to execute all tasks"));
  } else {
    console.log(chalk.yellow('\nNo tasks selected. Configuration not created.'));
  }
}
