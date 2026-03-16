/** @type {import('sncheck').Task[]} */
export const tasks = [
  {
    name: "typecheck",
    cmd: "npx tsc --noEmit",
    description: "TypeScript type checking",
  },
  {
    name: "lint",
    cmd: "npx eslint .",
    description: "ESLint linting",
  },
  {
    name: "format",
    cmd: "npx prettier --check .",
    description: "Check code formatting",
  }
]
