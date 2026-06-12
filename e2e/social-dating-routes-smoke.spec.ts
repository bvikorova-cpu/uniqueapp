import { test, expect } from "@playwright/test";

/**
 * Smoke test for previously uncovered Social & Dating routes.
 * Verifies each route renders without runtime errors / blank screen.
 * Auth not required — public shells render gated content prompt instead of crashing.
 */
const ROUTES = [
  "/messenger",
  "/stories",
  "/close-friends",
  "/communities",
  "/profile",
  "/dating",
  "/anonymous-date",
];

for (const path of ROUTES) {
  test(`route ${path} renders without runtime error`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const resp = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(resp?.status() ?? 200).toBeLessThan(500);

    // App shell mounted
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(500);

    // Ignore noisy 3rd-party / dev-only errors
    const fatal = errors.filter(
      (e) =>
        !/ResizeObserver|Failed to fetch|NetworkError|chrome-extension|favicon|sentry|gtag|Hydration/i.test(e),
    );
    expect(fatal, `Fatal errors on ${path}:\n${fatal.join("\n")}`).toHaveLength(0);
  });
}
