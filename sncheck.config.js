/** @type {import('sncheck').Task[]} */
export const tasks = [
  {
    name: "build",
    cmd: "npm run build",
    description: "build"
  },
  {
    name: "typecheck",
    cmd: "npx tsc --noEmit",
    description: "TypeScript type checking"
  },
  {
    name: "lint",
    cmd: "npx eslint .",
    description: "ESLint linting"
  },
  {
    name: "format:check",
    cmd: "npm run format:check",
    description: "Check code formatting"
  }
]
