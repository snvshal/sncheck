import { execa } from 'execa';
import chalk from 'chalk';
import type { Task } from '../types/index.js';

function padEnd(str: string, length: number): string {
  return str + ' '.repeat(Math.max(0, length - str.length));
}

export async function runTasks(tasks: Task[]): Promise<boolean> {
  let allPassed = true;

  const nameWidth = Math.max(...tasks.map((t) => t.name.length));
  const cmdWidth = Math.max(...tasks.map((t) => t.cmd.length));

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const title = task.name.charAt(0).toUpperCase() + task.name.slice(1);
    const paddedName = padEnd(title, nameWidth);
    const paddedCmd = padEnd(task.cmd, cmdWidth);

    const taskLine = paddedName + '    ' + paddedCmd + '    ';
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;

    const spinnerInterval = setInterval(() => {
      process.stdout.write('\r' + chalk.yellow(spinnerChars[spinnerIndex % 10]) + ' ' + taskLine);
      spinnerIndex++;
    }, 100);

    const startTime = Date.now();

    try {
      const [command, ...args] = task.cmd.split(' ');
      const result = await execa(command, args, {
        shell: true,
        stdio: 'pipe',
        reject: false,
      });

      clearInterval(spinnerInterval);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      if (result.failed) {
        process.stdout.write('\r' + chalk.red('✗') + ' ' + taskLine + '  ' + duration + '\n');
        if (result.shortMessage) {
          process.stdout.write('  ' + result.shortMessage.split('\n')[0] + '\n');
        }
        allPassed = false;
        break;
      } else {
        process.stdout.write('\r' + chalk.green('✓') + ' ' + taskLine + '  ' + duration + '\n');
      }
    } catch {
      clearInterval(spinnerInterval);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      process.stdout.write('\r' + chalk.red('✗') + ' ' + taskLine + '  ' + duration + '\n');
      allPassed = false;
      break;
    }
  }

  return allPassed;
}
