import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      // packages (Node 环境)
      'packages/*/vitest.config.ts',
      // apps/desktop (DOM 环境)
      'apps/desktop/vitest.config.ts',
    ],
  },
});
