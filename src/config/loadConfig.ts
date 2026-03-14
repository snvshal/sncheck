import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Config, Task } from '../types/index.js';

const CONFIG_FILES = ['sncheck.config.ts', 'sncheck.config.js'];

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
