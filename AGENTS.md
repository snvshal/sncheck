# sncheck - Agent Instructions

## Overview

`sncheck` is a CLI tool that orchestrates common project quality checks (linting, testing, formatting). It manages tasks defined in a configuration file and provides commands to run, add, edit, remove, and watch these tasks.

## About

This CLI favors clean, modern TUI output. Keep list/table output compact and readable, prefer truncation with `...` over wrapping, and use consistent accent/muted colors where theming is supported.

## Commands

| Command | Description |
|---------|-------------|
| `sncheck` | Run all tasks (default) |
| `sncheck init` | Initialize sncheck configuration |
| `sncheck run [tasks...]` | Run specific tasks |
| `sncheck add` | Add a new task interactively |
| `sncheck edit` | Edit an existing task |
| `sncheck remove` | Remove a task |
| `sncheck watch` | Run tasks in watch mode |

### Run Options

- `--parallel` - Run tasks in parallel
- `--continue` - Run all tasks even if one fails
- `--verbose` - Show full command output
- `--timeout <seconds>` - Timeout for each task

## Configuration

Tasks are defined in `sncheck.config.js` or `sncheck.config.ts`:

```js
/** @type {import('sncheck').Task[]} */
export const tasks = [
  {
    name: "lint",
    cmd: "npm run lint",
    description: "Run ESLint",
  },
  {
    name: "test",
    cmd: "npm test",
  },
]
```

## TypeScript Usage

```ts
import type { Task } from 'sncheck';

export const tasks: Task[] = [
  { name: 'lint', cmd: 'npm run lint' },
];
```

## Development

```bash
npm run build     # Build TypeScript
npm run dev       # Watch mode for development
npm run lint      # Run ESLint
npm run format    # Run Prettier
```

## Important Notes

- The project uses ES modules (`"type": "module"` in package.json)
- Always use ES module imports (`import { foo } from 'fs'`) instead of CommonJS (`require('fs')`)
- Do not use `require()` anywhere in the codebase
- Commands are defined in `src/commands/*.ts`
- Config handling is in `src/config/*.ts`
