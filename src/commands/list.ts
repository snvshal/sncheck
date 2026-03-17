import chalk from 'chalk';
import { loadConfig, configExists } from '../config/loadConfig.js';

export async function listCommand(): Promise<void> {
  if (!configExists()) {
    console.log(chalk.yellow("No configuration found. Run 'sncheck init' first."));
    process.exit(1);
  }

  const tasks = await loadConfig();

  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks configured. Add a task with "sncheck add".'));
    return;
  }

  console.log(chalk.bold('\nConfigured tasks:\n'));
  console.log('  Name      Command               Description');
  console.log('  --------  --------------------  -------------------');

  for (const task of tasks) {
    const name = task.name.padEnd(8);
    const cmd = task.cmd.substring(0, 20).padEnd(20);
    const description = task.description || '-';
    console.log(`  ${name}  ${cmd}  ${description}`);
  }

  console.log('');
}
