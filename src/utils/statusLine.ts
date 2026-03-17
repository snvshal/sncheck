import readline from 'readline';

const isTTY = Boolean(process.stdout.isTTY);
let active = false;

export const statusLine = {
  show(text: string): void {
    if (!isTTY) {
      console.log(text);
      return;
    }
    active = true;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(text);
  },
  clear(): void {
    if (!isTTY || !active) return;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    active = false;
  },
  replace(text: string): void {
    if (!isTTY) {
      console.log(text);
      return;
    }
    this.clear();
    process.stdout.write(text + '\n');
  },
} as const;
