import { execa } from 'execa';
import chalk from 'chalk';
import readline from 'readline';
import type { Task, TaskError } from '../types/index.js';

interface RunnerOptions {
  parallel?: boolean;
}

interface RunResult {
  passed: number;
  failed: number;
  allPassed: boolean;
  errors: TaskError[];
}

function padEnd(str: string, length: number): string {
  return str + ' '.repeat(Math.max(0, length - str.length));
}

async function showErrorsPrompt(errors: TaskError[]): Promise<void> {
  if (errors.length === 0) return;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  process.stdout.write('\n');
  process.stdout.write(chalk.blue('═══════════════════════ Errors ═══════════════════════\n'));

  errors.forEach((err, idx) => {
    process.stdout.write(chalk.red(`\n[${idx + 1}] ${err.task}:\n`));
    process.stdout.write(err.output + '\n');
  });

  process.stdout.write(chalk.blue('\n═══════════════════════════════════════════════════════\n'));

  rl.close();
}

async function runSingleTask(task: Task, nameWidth: number, cmdWidth: number): Promise<{ success: boolean; output: string }> {
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
      return { success: false, output: result.stderr || result.stdout || result.shortMessage || '' };
    } else {
      process.stdout.write('\r' + chalk.green('✓') + ' ' + taskLine + '  ' + duration + '\n');
      return { success: true, output: '' };
    }
  } catch (error) {
    clearInterval(spinnerInterval);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    process.stdout.write('\r' + chalk.red('✗') + ' ' + taskLine + '  ' + duration + '\n');
    return { success: false, output: String(error) };
  }
}

export async function runTasks(tasks: Task[], options: RunnerOptions = {}): Promise<RunResult> {
  const { parallel = false } = options;
  const nameWidth = Math.max(...tasks.map((t) => t.name.length));
  const cmdWidth = Math.max(...tasks.map((t) => t.cmd.length));

  if (parallel) {
    return runTasksParallel(tasks, nameWidth, cmdWidth);
  }

  return runTasksSequential(tasks, nameWidth, cmdWidth);
}

async function runTasksSequential(tasks: Task[], nameWidth: number, cmdWidth: number): Promise<RunResult> {
  const startTime = Date.now();
  let passed = 0;
  let failed = 0;
  const errors: TaskError[] = [];

  for (const task of tasks) {
    const result = await runSingleTask(task, nameWidth, cmdWidth);
    if (result.success) {
      passed++;
    } else {
      failed++;
      errors.push({ task: task.name, output: result.output });
      break;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

  process.stdout.write('\n');
  if (failed === 0) {
    process.stdout.write(chalk.green(`✓ ${passed} passed`) + `  (${totalTime})` + '\n');
  } else {
    process.stdout.write(chalk.green(`✓ ${passed} passed`) + '  ' + chalk.red(`✗ ${failed} failed`) + `  (${totalTime})` + '\n');
  }

  if (errors.length > 0) {
    await showErrorsPrompt(errors);
  }

  return { passed, failed, allPassed: failed === 0, errors };
}

async function runTasksParallel(tasks: Task[], nameWidth: number, cmdWidth: number): Promise<RunResult> {
  const startTime = Date.now();

  interface TaskState {
    task: Task;
    title: string;
    paddedName: string;
    paddedCmd: string;
    status: 'running' | 'success' | 'failed';
    duration?: string;
    output?: string;
  }

  const taskStates: TaskState[] = tasks.map((task) => {
    const title = task.name.charAt(0).toUpperCase() + task.name.slice(1);
    const paddedName = padEnd(title, nameWidth);
    const paddedCmd = padEnd(task.cmd, cmdWidth);

    return {
      task,
      title,
      paddedName,
      paddedCmd,
      status: 'running' as const,
    };
  });

  process.stdout.write('\n');
  for (const state of taskStates) {
    process.stdout.write('○ ' + state.paddedName + '    ' + state.paddedCmd + '\n');
  }
  process.stdout.write(chalk.blue('\nRunning in parallel...\n'));

  const runningPromises = taskStates.map((state) => {
    const [command, ...args] = state.task.cmd.split(' ');
    const taskStartTime = Date.now();

    return (async () => {
      try {
        const result = await execa(command, args, {
          shell: true,
          stdio: 'pipe',
          reject: false,
        });

        const duration = ((Date.now() - taskStartTime) / 1000).toFixed(1) + 's';
        state.duration = duration;
        state.status = result.failed ? 'failed' : 'success';
        state.output = result.stderr || result.stdout || result.shortMessage || '';
      } catch (error) {
        const duration = ((Date.now() - taskStartTime) / 1000).toFixed(1) + 's';
        state.duration = duration;
        state.status = 'failed';
        state.output = String(error);
      }
    })();
  });

  await Promise.all(runningPromises);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

  process.stdout.write('\n');
  for (const state of taskStates) {
    if (state.status === 'success') {
      process.stdout.write(chalk.green('✓') + ' ' + state.paddedName + '    ' + state.paddedCmd + '  ' + state.duration + '\n');
    } else {
      process.stdout.write(chalk.red('✗') + ' ' + state.paddedName + '    ' + state.paddedCmd + '  ' + state.duration + '\n');
      if (state.output) {
        process.stdout.write('  ' + state.output.split('\n')[0] + '\n');
      }
    }
  }

  const passed = taskStates.filter(s => s.status === 'success').length;
  const failed = taskStates.filter(s => s.status === 'failed').length;
  const errors: TaskError[] = taskStates
    .filter(s => s.status === 'failed')
    .map(s => ({ task: s.task.name, output: s.output || '' }));

  process.stdout.write('\n');
  if (failed === 0) {
    process.stdout.write(chalk.green(`✓ ${passed} passed`) + `  (${totalTime})` + '\n');
  } else {
    process.stdout.write(chalk.green(`✓ ${passed} passed`) + '  ' + chalk.red(`✗ ${failed} failed`) + `  (${totalTime})` + '\n');
  }

  if (errors.length > 0) {
    await showErrorsPrompt(errors);
  }

  return { passed, failed, allPassed: failed === 0, errors };
}
