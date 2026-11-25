import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.VERIFY_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: externalBaseUrl || 'http://127.0.0.1:1420',
    trace: 'on-first-retry',
  },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: 'pnpm --filter @attentionos/desktop dev --host 127.0.0.1',
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          url: 'http://127.0.0.1:1420',
        },
      }),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
