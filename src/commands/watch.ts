import chalk from 'chalk';
import chokidar from 'chokidar';
import { loadConfig, configExists } from '../config/loadConfig.js';
import { runTasks } from '../runner/runTasks.js';

export async function watchCommand(): Promise<void> {
  if (!configExists()) {
    console.log(chalk.yellow("No configuration found. Run 'check init' first."));
    process.exit(1);
  }

  const tasks = await loadConfig();

  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks configured.'));
    process.exit(0);
  }

  console.log(chalk.blue('Starting watch mode...\n'));
  console.log(chalk.green('Watching for file changes...'));
  console.log(chalk.blue('Press Ctrl+C to exit\n'));

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  const runAllTasks = async () => {
    if (isRunning) return;
    isRunning = true;

    console.log(chalk.blue('\n--- Running tasks ---\n'));

    const success = await runTasks(tasks);

    if (success) {
      console.log(chalk.green('\n✓ All tasks passed'));
    } else {
      console.log(chalk.red('\n✗ Some tasks failed'));
    }

    console.log(chalk.blue('\n--- Watching for changes ---\n'));
    isRunning = false;
  };

  const watcher = chokidar.watch('**/*', {
    ignored: [/(^|[\/\\])\../, 'node_modules', 'dist', 'build', '.git'],
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('all', (event, path) => {
    console.log(chalk.gray(`  ${event}: ${path}`));

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      runAllTasks();
    }, 500);
  });

  await runAllTasks();

  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nStopping watch mode...'));
    watcher.close();
    process.exit(0);
  });
}
