import { existsSync } from 'fs';
import { resolve } from 'path';
import type { Provider } from '../types/index.js';

const toolDetectionMap: Array<{
  files: string[];
  provider: Omit<Provider, 'description'>;
  description: string;
}> = [
  {
    files: ['tsconfig.json'],
    provider: { name: 'typecheck', cmd: 'npx tsc --noEmit' },
    description: 'TypeScript type checking',
  },
  {
    files: ['eslint.config.js', '.eslintrc.js', '.eslintrc.json', '.eslintrc'],
    provider: { name: 'lint', cmd: 'npx eslint .' },
    description: 'ESLint linting',
  },
  {
    files: ['prettier.config.js', '.prettierrc', '.prettierrc.json'],
    provider: { name: 'format', cmd: 'npx prettier --check .' },
    description: 'Check code formatting',
  },
  {
    files: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mts'],
    provider: { name: 'test', cmd: 'npx vitest run' },
    description: 'Run Vitest tests',
  },
  {
    files: ['jest.config.js', 'jest.config.ts', 'jest.config.json'],
    provider: { name: 'test', cmd: 'npx jest' },
    description: 'Run Jest tests',
  },
  {
    files: ['vite.config.ts', 'vite.config.js', 'vite.config.mts'],
    provider: { name: 'build', cmd: 'npx vite build' },
    description: 'Build with Vite',
  },
  {
    files: ['next.config.js', 'next.config.ts', 'next.config.mjs'],
    provider: { name: 'build', cmd: 'npx next build' },
    description: 'Build with Next.js',
  },
];

export function detectTools(): Provider[] {
  const detected: Provider[] = [];

  for (const { files, provider, description } of toolDetectionMap) {
    for (const file of files) {
      if (existsSync(resolve(process.cwd(), file))) {
        detected.push({ ...provider, description });
        break;
      }
    }
  }

  return detected;
}
