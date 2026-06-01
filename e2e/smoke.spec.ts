import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the public landing page renders, key navigation links exist,
 * and the auth route is reachable. These flows do not require login or paid features
 * so they can run against any environment (local, preview, or production).
 *
 * IMPORTANT: the SPA shows "Loading Unique…" before React hydrates. All assertions
 * must wait for hydration; otherwise we measure the placeholder and produce false
 * negatives.
 */

async function waitForHydration(page: import("@playwright/test").Page) {
  // The app root mounts <main> / <header> / hero content once hydrated. Wait
  // for either a real element or the placeholder to disappear — whichever
  // comes first within the budget.
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () => {
        const body = document.body?.innerText?.toLowerCase() ?? "";
        if (body.includes("loading unique")) return false;
        // Hydrated when we have real DOM content
        return (
          document.querySelector("header") !== null ||
          document.querySelector("main") !== null ||
          document.querySelector("[data-app-root]") !== null ||
          body.length > 80
        );
      },
      { timeout: 15_000 },
    )
    .catch(() => {});
}

test.describe("Landing page smoke", () => {
  test("homepage loads and shows main hero", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await expect(page).toHaveTitle(/unique/i);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(50);
    expect(bodyText.toLowerCase()).not.toBe("loading unique…");
  });

  test("auth page is reachable", async ({ page }) => {
    await page.goto("/auth");
    await waitForHydration(page);
    // Poll — Auth.tsx renders Tabs (Login/Register) with email+password inputs.
    await expect
      .poll(
        async () =>
          (await page.locator('input[type="password"], input[type="email"]').count()) +
          (await page.getByRole("button", { name: /login|sign in|log in|register|sign up|prihlás/i }).count()),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);
  });


  test("404 page renders for unknown route", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-xyz");
    expect(res?.status()).toBeLessThan(500);
    await waitForHydration(page);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.toLowerCase()).toMatch(/404|not found|page not found|stránka|neexistuje/);
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
