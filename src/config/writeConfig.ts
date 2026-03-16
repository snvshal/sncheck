import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Task } from '../types/index.js';

const CONFIG_FILES = ['sncheck.config.ts', 'sncheck.config.js'];

export function getConfigPath(): string | undefined {
  for (const file of CONFIG_FILES) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      return path;
    }
  }
  return resolve(process.cwd(), 'sncheck.config.js');
}

export function getConfigPathExisting(): string | undefined {
  for (const file of CONFIG_FILES) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      return path;
    }
  }
  return undefined;
}

export function writeConfig(tasks: Task[]): void {
  const configPath = getConfigPath()!;
  const isJs = configPath.endsWith('.js');

  const tasksContent = tasks
    .map((task) => {
      const description = task.description
        ? `\n    description: "${task.description}",`
        : '';
      return `  {
    name: "${task.name}",
    cmd: "${task.cmd}",${description}
  }`;
    })
    .join(',\n');

  let configContent: string;
  if (isJs) {
    configContent = `/** @type {import('sncheck').Task[]} */
export const tasks = [
${tasksContent}
]
`;
  } else {
    configContent = `import type { Task } from "sncheck";

export const tasks: Task[] = [
${tasksContent}
]
`;
  }

  writeFileSync(configPath, configContent, 'utf-8');
}

export function addTaskToConfig(task: Task): void {
  const configPath = getConfigPathExisting();
  const content = `{
    name: "${task.name}",
    cmd: "${task.cmd}",${task.description ? `\n    description: "${task.description}",` : ''}
  }`;

  if (!configPath) {
    writeConfig([task]);
    return;
  }

  const existingContent = require('fs').readFileSync(configPath, 'utf-8');
  const isJs = configPath.endsWith('.js');

  if (isJs) {
    const match = existingContent.match(/export const tasks = \[([\s\S]*?)\]/);
    if (match) {
      const tasksContent = match[1].trim();
      if (tasksContent === '') {
        const newContent = `export const tasks = [\n  ${content}\n]`;
        const finalContent = existingContent.replace(
          /export const tasks = \[[\s\S]*?\]/,
          newContent
        );
        require('fs').writeFileSync(configPath, finalContent, 'utf-8');
      } else {
        const newContent = existingContent.replace(
          /export const tasks = \[/,
          `export const tasks = [\n  ${content},`
        );
        require('fs').writeFileSync(configPath, newContent, 'utf-8');
      }
      return;
    }
  } else {
    const match = existingContent.match(/export const tasks: Task\[\] = \[([\s\S]*?)\]/);
    if (match) {
      const tasksContent = match[1].trim();
      if (tasksContent === '') {
        const newContent = `export const tasks: Task[] = [\n  ${content}\n]`;
        const finalContent = existingContent.replace(
          /export const tasks: Task\[\] = \[[\s\S]*?\]/,
          newContent
        );
        require('fs').writeFileSync(configPath, finalContent, 'utf-8');
      } else {
        const newContent = existingContent.replace(
          /export const tasks: Task\[\] = \[/,
          `export const tasks: Task[] = [\n  ${content},`
        );
        require('fs').writeFileSync(configPath, newContent, 'utf-8');
      }
      return;
    }
  }

  writeConfig([task]);
}
