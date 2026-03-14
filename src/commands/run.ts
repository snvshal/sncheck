import chalk from 'chalk';
import { loadConfig, getTaskNames, findTaskByName } from '../config/loadConfig.js';
import { runTasks } from '../runner/runTasks.js';
import type { Task } from '../types/index.js';

export async function runCommand(taskNames?: string[]): Promise<void> {
  const tasks = await loadConfig();

  if (tasks.length === 0) {
    console.log(chalk.yellow("No tasks configured. Run 'sncheck init' to get started."));
    process.exit(0);
  }

  let tasksToRun: Task[];

  if (taskNames && taskNames.length > 0) {
    const availableNames = getTaskNames(tasks);
    const invalidNames = taskNames.filter((n) => !availableNames.includes(n));

    if (invalidNames.length > 0) {
      console.log(chalk.red(`Unknown task(s): ${invalidNames.join(', ')}`));
      console.log(chalk.blue(`Available tasks: ${availableNames.join(', ')}`));
      process.exit(1);
    }

    tasksToRun = taskNames.map((name) => findTaskByName(tasks, name)!).filter(Boolean);
  } else {
    tasksToRun = tasks;
  }

  console.log(chalk.blue(`Running ${tasksToRun.length} task(s)...\n`));

  const success = await runTasks(tasksToRun);

  if (success) {
    console.log(chalk.green('\n✓ All tasks passed'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n✗ Some tasks failed'));
    process.exit(1);
  }
}
