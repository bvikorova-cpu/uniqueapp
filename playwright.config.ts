import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — E2E smoke tests against a running dev server or a deployed URL.
 *
 * Run locally:
 *   bun run e2e          # uses webServer below
 *   PLAYWRIGHT_BASE_URL=https://uniqueapp.fun bun run e2e   # against prod
 *
 * Browsers must be installed once: `bunx playwright install --with-deps chromium`
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "on-first-retry",
    video: "retain-on-failure",
    storageState: "e2e/.auth/storage-state.json",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:8080",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
