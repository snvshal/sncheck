import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import type { Config, Task } from '../types/index.js';

const CONFIG_FILES = ['sncheck.config.ts', 'sncheck.config.js'];

export interface ValidationError {
  message: string;
  field?: string;
}

export function validateConfig(config: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config || typeof config !== 'object') {
    errors.push({ message: 'Config must be an object' });
    return errors;
  }

  const configObj = config as Record<string, unknown>;

  if (!configObj.tasks) {
    errors.push({ message: "Missing 'tasks' export", field: 'tasks' });
    return errors;
  }

  if (!Array.isArray(configObj.tasks)) {
    errors.push({ message: "'tasks' must be an array", field: 'tasks' });
    return errors;
  }

  if (configObj.tasks.length === 0) {
    errors.push({ message: "'tasks' array is empty", field: 'tasks' });
  }

  configObj.tasks.forEach((task: unknown, index: number) => {
    if (!task || typeof task !== 'object') {
      errors.push({ message: `Task at index ${index} must be an object` });
      return;
    }

    const taskObj = task as Record<string, unknown>;

    if (!taskObj.name || typeof taskObj.name !== 'string') {
      errors.push({ message: `Task at index ${index} missing required field: 'name'` });
    }

    if (!taskObj.cmd || typeof taskObj.cmd !== 'string') {
      errors.push({ message: `Task at index ${index} missing required field: 'cmd'` });
    }
  });

  return errors;
}

export function getConfigPath(): string | undefined {
  for (const file of CONFIG_FILES) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      return path;
    }
  }
  return undefined;
}

export function configExists(): boolean {
  return getConfigPath() !== undefined;
}

export async function loadConfig(): Promise<Task[]> {
  const configPath = getConfigPath();

  if (!configPath) {
    return [];
  }

  try {
    const configUrl = pathToFileURL(configPath).href;
    const config = (await import(configUrl)) as Config;

    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.log(chalk.red(`\nConfig file is invalid:\n`));
      errors.forEach((err) => console.log(`  - ${err.message}`));
      console.log(chalk.blue(`\nRun 'sncheck init' to create a valid config.\n`));
      process.exit(1);
    }

    return config.tasks || [];
  } catch (error) {
    console.log(chalk.red(`\nFailed to load config file: ${configPath}`));
    console.log(chalk.gray(`  ${error instanceof Error ? error.message : error}`));
    console.log(chalk.blue(`\nRun 'sncheck init' to create a valid config.\n`));
    process.exit(1);
  }
}

export function getTaskNames(tasks: Task[]): string[] {
  return tasks.map((t) => t.name);
}

export function findTaskByName(tasks: Task[], name: string): Task | undefined {
  return tasks.find((t) => t.name === name);
}
