import { Listr, ListrTask } from 'listr2';
import { execa } from 'execa';
import type { Task, TaskContext } from '../types/index.js';

export async function runTasks(
  tasks: Task[],
  options: { concurrent?: boolean; silent?: boolean } = {}
): Promise<boolean> {
  const ctx: TaskContext = {
    tasks,
    failed: false,
  };

  const taskList: ListrTask<TaskContext>[] = tasks.map((task) => ({
    title: task.name,
    task: async (): Promise<void> => {
      const [command, ...args] = task.cmd.split(' ');
      const result = await execa(command, args, {
        shell: true,
        stdio: 'pipe',
        reject: false,
      });

      if (result.failed) {
        throw new Error(result.shortMessage || result.message || 'Task failed');
      }
    },
  }));

  const listr = new Listr(taskList, {
    concurrent: options.concurrent ?? false,
    exitOnError: true,
  });

  try {
    await listr.run(ctx);
    return true;
  } catch {
    return false;
  }
}
