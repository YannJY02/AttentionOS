import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // packages (Node 环境)
  'packages/*/vitest.config.ts',
  // apps/desktop (DOM 环境)
  'apps/desktop/vitest.config.ts',
]);
