import { defineConfig, devices } from '@playwright/test';

// Os três motores de navegador: o ADR 0009 só pode ser aceito sabendo que CSSOM passa na CSP nos três.
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4572' },
  webServer: {
    command: 'node packages/theme/e2e/server.mjs',
    url: 'http://127.0.0.1:4572/',
    reuseExistingServer: false,
    timeout: 30_000,
    cwd: '../../..',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
