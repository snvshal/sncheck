# check - Project Quality Check Orchestrator

## Project Overview

**Project Name:** check  
**Type:** Node.js CLI Tool  
**Core Functionality:** A CLI tool that orchestrates common project quality checks (typecheck, lint, format, test, build) with interactive TUI for configuration and execution.  
**Target Users:** Node.js developers who want a unified interface for running multiple quality checks.

---

## Technical Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js >=18
- **CLI Framework:** Commander
- **Task Orchestration:** listr2
- **Interactive Prompts:** @inquirer/prompts
- **Process Execution:** execa
- **File Operations:** fs-extra
- **Terminal Colors:** chalk
- **File Watching:** chokidar

---

## CLI Commands

### 1. Initialize Project

```bash
check init
```

**Behavior:**

1. Scan project directory for common config files
2. Display detected tools with checkboxes
3. Allow user to select which tasks to include
4. Generate `check.config.ts` in project root

**Auto-detection Mapping:**
| File Found | Suggested Task |
|------------|----------------|
| `tsconfig.json` | TypeScript typecheck |
| `eslint.config.js` / `.eslintrc` / `.eslintrc.json` | ESLint |
| `prettier.config.js` / `.prettierrc` | Prettier |
| `vitest.config.ts` / `vitest.config.js` | Vitest |
| `jest.config.js` / `jest.config.ts` | Jest |
| `vite.config.ts` / `vite.config.js` | Vite build |
| `next.config.js` / `next.config.ts` | Next.js build |

---

### 2. Run All Checks

```bash
check
```

**Behavior:**

- Load tasks from `check.config.ts`
- Execute tasks sequentially using listr2
- Display progress with clean TUI
- Stop execution on first failure
- Show success/failure status for each task

**Output Example (success):**

```
✔ typecheck
✔ lint
✔ format
✔ test
✔ build
```

**Output Example (failure):**

```
✔ typecheck
✖ lint
  src/app.ts:23 unexpected any
```

---

### 3. Run Specific Tasks

```bash
check run <task1> <task2> ...
```

**Behavior:**

- Run only specified tasks from config
- Tasks run sequentially
- Stop on first failure

**Example:**

```bash
check run lint test
```

---

### 4. Add Task

```bash
check add
```

**Behavior:**

- Interactive prompt for task name
- Interactive prompt for command
- Optional description
- Appends to `check.config.ts`

**Prompt Example:**

```
Task name: lint
Command: eslint .
Description (optional): Run ESLint on project
```

---

### 5. Edit Task

```bash
check edit
```

**Behavior:**

- Display list of existing tasks
- User selects task to edit
- Edit name, command, or description
- Update `check.config.ts`

---

### 6. Remove Task

```bash
check remove
```

**Behavior:**

- Display list of tasks
- User selects task to remove
- Removes from `check.config.ts`

---

### 7. Watch Mode

```bash
check watch
```

**Behavior:**

- Watch for file changes in project
- Re-run tasks when files change
- Debounce changes (500ms)
- Show file that triggered re-run

---

## Configuration File

**Filename:** `check.config.ts`

**Structure:**

```typescript
export interface Task {
  name: string;
  cmd: string;
  description?: string;
}

export const tasks: Task[] = [
  {
    name: 'typecheck',
    cmd: 'tsc --noEmit',
    description: 'TypeScript type checking',
  },
  {
    name: 'lint',
    cmd: 'eslint .',
    description: 'Run ESLint',
  },
];
```

---

## Built-in Providers

### TypeScript

- **Command:** `tsc --noEmit`
- **Description:** TypeScript type checking

### ESLint

- **Command:** `eslint .`
- **Description:** ESLint linting

### Prettier

- **Command:** `prettier --check .`
- **Description:** Check code formatting

### Vitest

- **Command:** `vitest run`
- **Description:** Run Vitest tests

### Jest

- **Command:** `jest`
- **Description:** Run Jest tests

### Vite Build

- **Command:** `vite build`
- **Description:** Build with Vite

### Next.js Build

- **Command:** `next build`
- **Description:** Build with Next.js

---

## File Structure

```
src/
├── cli.ts                    # Main CLI entry point
├── commands/
│   ├── init.ts              # Initialize command
│   ├── run.ts               # Run tasks command
│   ├── add.ts               # Add task command
│   ├── edit.ts              # Edit task command
│   ├── remove.ts            # Remove task command
│   └── watch.ts             # Watch mode command
├── providers/
│   └── builtin.ts           # Built-in task providers
├── runner/
│   └── runTasks.ts          # Task execution logic
├── config/
│   ├── loadConfig.ts        # Config loading
│   └── writeConfig.ts       # Config writing
├── types/
│   └── index.ts             # TypeScript types
└── utils/
    └── detectTools.ts       # Tool detection
```

---

## Acceptance Criteria

1. **Initialization:** `check init` correctly detects tools and generates config
2. **Running Tasks:** All tasks execute sequentially with proper output
3. **Task Failure:** Execution stops on first failure with clear error message
4. **Specific Tasks:** `check run lint test` runs only specified tasks
5. **Add Task:** Interactive prompts work and update config file
6. **Edit Task:** Can modify existing task properties
7. **Remove Task:** Can delete tasks from config
8. **Watch Mode:** File changes trigger task re-execution
9. **Clean TUI:** Output is readable with proper colors and formatting
10. **TypeScript Support:** Project uses strict TypeScript
11. **ESLint/Prettier:** Project itself is linted and formatted
