import chalk from 'chalk';
import { loadConfig, getTaskNames, findTaskByName } from '../config/loadConfig.js';
import { runTasks } from '../runner/runTasks.js';
import type { Task } from '../types/index.js';

export async function runCommand(taskNames?: string[], options?: { parallel?: boolean; continue?: boolean; verbose?: boolean }): Promise<void> {
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

  const parallel = options?.parallel ?? false;
  const continueOnError = options?.continue ?? false;
  const verbose = options?.verbose ?? false;
  console.log(chalk.blue(`Running ${tasksToRun.length} task(s)${parallel ? ' in parallel' : ''}...\n`));

  const result = await runTasks(tasksToRun, { parallel, continue: continueOnError, verbose });

  process.exit(result.allPassed ? 0 : 1);
}
