import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  "https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app";

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
