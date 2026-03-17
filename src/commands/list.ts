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

  const accent = chalk.hex('#7dd3fc');
  const muted = chalk.hex('#94a3b8');
  const dim = chalk.hex('#64748b');

  const truncate = (value: string, width: number): string => {
    if (value.length <= width) return value;
    if (width <= 3) return value.slice(0, width);
    return `${value.slice(0, width - 3)}...`;
  };

  const nameWidth = Math.min(22, Math.max(4, ...tasks.map((t) => t.name.length)));
  const cmdWidth = Math.min(44, Math.max(7, ...tasks.map((t) => t.cmd.length)));
  const descWidth = Math.min(
    40,
    Math.max(11, ...tasks.map((t) => (t.description ? t.description.length : 1))),
  );
  const gap = '   ';

  console.log(chalk.bold('\nConfigured tasks\n'));
  console.log(
    `  ${accent('Name'.padEnd(nameWidth))}${gap}${accent(
      'Command'.padEnd(cmdWidth),
    )}${gap}${accent(
      'Description'.padEnd(descWidth),
    )}`,
  );
  console.log(
    muted(
      `  ${'-'.repeat(nameWidth)}${gap}${'-'.repeat(cmdWidth)}${gap}${'-'.repeat(descWidth)}`,
    ),
  );

  for (const task of tasks) {
    const name = truncate(task.name, nameWidth).padEnd(nameWidth);
    const cmd = truncate(task.cmd, cmdWidth).padEnd(cmdWidth);
    const description = truncate(task.description || '-', descWidth).padEnd(descWidth);
    console.log(
      `  ${chalk.bold(name)}${gap}${muted(cmd)}${gap}${
        task.description ? description : dim(description)
      }`,
    );
  }

  console.log('');
}
