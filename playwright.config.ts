import { defineConfig, devices } from '@playwright/test';

const PORT = 3200;
const isCI = Boolean(process.env.CI);

/**
 * Smoke tests against the production build (`npm run build` first).
 * Locally, PW_CHANNEL=chrome reuses an installed Chrome instead of
 * downloading Playwright's browsers.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Each worker runs a Chrome with software WebGL, which is CPU-heavy.
  workers: 2,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PW_CHANNEL,
    trace: 'retain-on-failure',
    launchOptions: {
      // Software WebGL, so the Three.js scenes render on GPU-less CI machines.
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
