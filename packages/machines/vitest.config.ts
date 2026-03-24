import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'machines',
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: { lines: 100, functions: 100, branches: 80 },
    },
  },
});
