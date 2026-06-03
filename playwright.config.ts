import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — three projects:
 *   1. setup        — logs in once, persists session to e2e/.auth/authed-state.json
 *   2. chromium     — anonymous (no auth) over e2e/*.spec.ts EXCEPT e2e/authed/**
 *   3. chromium-authed — uses the persisted session, runs e2e/authed/**.spec.ts
 *
 * Run locally:
 *   bun run e2e
 *   PLAYWRIGHT_BASE_URL=https://uniqueapp.fun bun run e2e
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
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts$/,
      use: {
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
    {
      name: "chromium",
      testIgnore: [/auth\.setup\.ts$/, /authed\//],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/storage-state.json",
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
    {
      name: "chromium-authed",
      testMatch: /authed\/.*\.spec\.ts$/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/authed-state.json",
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },
    // Cross-browser projekty pre špecifické testy (autoplay, audio policy).
    // Aktivujú sa nastavením PLAYWRIGHT_ENABLE_CROSS_BROWSER=1
    // a vyžadujú `bunx playwright install firefox webkit`.
    ...(process.env.PLAYWRIGHT_ENABLE_CROSS_BROWSER
      ? [
          {
            name: "firefox-authed",
            testMatch: /authed\/.*\.spec\.ts$/,
            dependencies: ["setup"],
            use: {
              ...devices["Desktop Firefox"],
              storageState: "e2e/.auth/authed-state.json",
            },
          },
          {
            name: "webkit-authed",
            testMatch: /authed\/.*\.spec\.ts$/,
            dependencies: ["setup"],
            use: {
              ...devices["Desktop Safari"],
              storageState: "e2e/.auth/authed-state.json",
            },
          },
        ]
      : []),
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
