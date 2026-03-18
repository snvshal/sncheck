# sncheck

A CLI tool that orchestrates common project quality checks (typecheck, lint, format, test, build). Run multiple checks from a single command with a clean TUI.

## Installation

```bash
npm install -D sncheck
```

Or link globally:

```bash
npm link
```

## Usage

### Initialize

```bash
sncheck init
```

Detects common tools in your project and generates a configuration file.

### Run All Checks

```bash
sncheck
```

Runs all configured tasks sequentially with progress display.

### Run Specific Tasks

```bash
sncheck run lint test
```

Run only selected tasks.

### Add Task

```bash
sncheck add
```

Interactive prompt to add a new task.

### Edit Task

```bash
sncheck edit
```

Edit an existing task.

### Remove Task

```bash
sncheck remove
```

Remove a task from configuration.

### Watch Mode

```bash
sncheck watch
```

Re-run tasks when files change.

## Configuration

Generates `sncheck.config.ts`:

```typescript
import type { Task } from "sncheck"

export const tasks: Task[] = [
  {
    name: "typecheck",
    cmd: "tsc --noEmit",
    description: "TypeScript type checking"
  },
  {
    name: "lint",
    cmd: "eslint .",
    description: "ESLint linting"
  },
  {
    name: "format",
    cmd: "prettier --check .",
    description: "Check code formatting"
  },
  {
    name: "test",
    cmd: "vitest run",
    description: "Run Vitest tests"
  }
]
```

## Auto-detected Tools

`sncheck init` automatically detects:

- `tsconfig.json` → TypeScript (`tsc --noEmit`)
- `eslint.config.js` / `.eslintrc` → ESLint (`eslint .`)
- `prettier.config.js` → Prettier (`prettier --check .`)
- `vitest.config.ts` → Vitest (`vitest run`)
- `jest.config.js` → Jest (`jest`)
- `vite.config.ts` → Vite (`vite build`)
- `next.config.js` → Next.js (`next build`)
