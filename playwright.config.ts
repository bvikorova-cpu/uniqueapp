import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  "https://www.uniqueapp.fun";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || "/bin/chromium",
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium-authed",
      testDir: "./e2e/authed",
      dependencies: ["setup"],
      use: {
        browserName: "chromium",
        storageState: "e2e/.auth/authed-state.json",
      },
    },
    {
      name: "chromium",
      testIgnore: [/auth\.setup\.ts/, /authed\//],
      use: { browserName: "chromium" },
    },
  ],
});
