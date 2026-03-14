import { writeFileSync } from 'fs';
import { getConfigPath } from './loadConfig.js';
import type { Task } from '../types/index.js';

export function writeConfig(tasks: Task[]): void {
  const configPath = getConfigPath();

  const tasksContent = tasks
    .map((task) => {
      const description = task.description ? `  description: "${task.description}",` : '';
      return `  {
    name: "${task.name}",
    cmd: "${task.cmd}",${description}
  }`;
    })
    .join(',\n');

  const configContent = `import type { Task } from "check-cli";

export const tasks: Task[] = [
${tasksContent}
]
`;

  writeFileSync(configPath, configContent, 'utf-8');
}

export function addTaskToConfig(task: Task): void {
  const configPath = getConfigPath();
  const content = `{
    name: "${task.name}",
    cmd: "${task.cmd}",${task.description ? `\n    description: "${task.description}",` : ''}
  }`;

  if (!require('fs').existsSync(configPath)) {
    writeConfig([task]);
    return;
  }

  const existingContent = require('fs').readFileSync(configPath, 'utf-8');
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
  } else {
    writeConfig([task]);
  }
}
