import type { Provider } from "../types/index.js"

export const builtinProviders: Provider[] = [
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
  },
  {
    name: "build",
    cmd: "vite build",
    description: "Build with Vite"
  }
]

export function getProviderByName(name: string): Provider | undefined {
  return builtinProviders.find((p) => p.name === name)
}
