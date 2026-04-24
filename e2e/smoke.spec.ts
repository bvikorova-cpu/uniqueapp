import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the public landing page renders, key navigation links exist,
 * and the auth route is reachable. These flows do not require login or paid features
 * so they can run against any environment (local, preview, or production).
 */

test.describe("Landing page smoke", () => {
  test("homepage loads and shows main hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/unique/i);
    // Body should be non-empty
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test("auth page is reachable", async ({ page }) => {
    await page.goto("/auth");
    // Either a sign-in button or password field should exist
    const hasAuthControls =
      (await page.getByRole("button", { name: /sign in|log in|prihlás/i }).count()) > 0 ||
      (await page.locator('input[type="password"]').count()) > 0;
    expect(hasAuthControls).toBe(true);
  });

  test("404 page renders for unknown route", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-xyz");
    // SPA returns 200 but should show NotFound
    expect(res?.status()).toBeLessThan(500);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.toLowerCase()).toMatch(/404|not found|page not found/);
  });
});

test.describe("Public pages render without crashing", () => {
  for (const path of ["/marketplace", "/jobs", "/games", "/dating"]) {
    test(`${path} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      expect(errors, `JS errors on ${path}: ${errors.join("\n")}`).toEqual([]);
    });
  }
});
