import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const isCI = Boolean(process.env.CI)

/**
 * End-to-end tests run against the production build served by `vite preview`,
 * which also runs the Worker, so the service worker and /api are real.
 *
 * The target device is an iPhone. Locally the tests use Chromium with the
 * iPhone viewport; CI adds WebKit, the engine Safari actually runs.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium-iphone',
      use: { ...devices['iPhone 15'], browserName: 'chromium' },
    },
    ...(isCI
      ? [
          {
            name: 'webkit-iphone',
            use: { ...devices['iPhone 15'] },
          },
        ]
      : []),
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
