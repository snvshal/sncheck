import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Config, Task } from '../types/index.js';

const CONFIG_FILE = 'sncheck.config.ts';

export function getConfigPath(): string {
  return resolve(process.cwd(), CONFIG_FILE);
}

export function configExists(): boolean {
  return existsSync(getConfigPath());
}

export async function loadConfig(): Promise<Task[]> {
  const configPath = getConfigPath();

  if (!configExists()) {
    return [];
  }

  try {
    const configUrl = pathToFileURL(configPath).href;
    const config = (await import(configUrl)) as Config;
    return config.tasks || [];
  } catch (error) {
    console.error('Failed to load config:', error);
    return [];
  }
}

export function getTaskNames(tasks: Task[]): string[] {
  return tasks.map((t) => t.name);
}

export function findTaskByName(tasks: Task[], name: string): Task | undefined {
  return tasks.find((t) => t.name === name);
}
