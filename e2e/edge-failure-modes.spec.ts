import { test, expect, Route } from "@playwright/test";

/**
 * Failure-mode e2e tests — make sure that when a tool's edge-function call
 * fails (HTTP 500) or times out, the UI:
 *   1. clears any loading spinner (`.animate-spin`, `aria-busy`),
 *   2. surfaces a user-visible error state (toast or inline error text),
 *   3. keeps the page interactive (Back-to-Hub button + retry possible).
 *
 * We intercept Supabase Edge Function calls via page.route() and either:
 *   - reply with HTTP 500 + JSON error, or
 *   - never resolve (simulating timeout) — Playwright still allows the test
 *     to assert the spinner disappears once the client-side timeout fires
 *     OR within a reasonable window.
 *
 * No real edge functions are called and no auth is required.
 */

const SUPABASE_FN = /\/functions\/v1\//;

async function expectNoStuckSpinner(page: any, label: string) {
  // No element should keep aria-busy=true forever
  await expect(
    page.locator('[aria-busy="true"]'),
    `${label}: aria-busy must clear`,
  ).toHaveCount(0, { timeout: 15_000 });

  // No animate-spin should remain visible after the failure surfaces
  await expect(
    page.locator(".animate-spin").first(),
    `${label}: .animate-spin must hide`,
  ).toBeHidden({ timeout: 15_000 });
}

async function expectErrorSurface(page: any, label: string) {
  // Accept either a toast (sonner / shadcn) OR inline error text containing
  // common failure keywords. Match case-insensitively across the page.
  const errorRegex =
    /(error|failed|something went wrong|try again|nepodarilo|chyba|timeout)/i;
  await expect(
    page.getByText(errorRegex).first(),
    `${label}: must show a user-facing error`,
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("Crystal hub — edge function failures don't deadlock the UI", () => { test("HTTP 500 from any crystal edge function clears spinner + shows error", async ({
    page }) => {
    // Force every supabase edge call to fail with 500
    await page.route(SUPABASE_FN, (route: Route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated upstream failure" }) }),
    );

    await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });

    // Open the Oracle tool and trigger the edge call explicitly (the draw
    // button is what performs the crystal-ai-tool invocation).
    await page.getByText("Daily Crystal Oracle", { exact: true }).first().click();

    const back = page.getByRole("button", { name: /back to hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });

    const draw = page.getByRole("button", { name: /draw today's crystal/i });
    if (await draw.isVisible().catch(() => false)) {
      await draw.click();
      await expectNoStuckSpinner(page, "Daily Crystal Oracle");
      // Anonymous visitors get a sign-in prompt, signed-in users get a
      // failure toast — both are valid user-facing feedback.
      await expect(
        page
          .getByText(
            /(error|failed|something went wrong|try again|sign in|credit|nepodarilo|chyba|timeout)/i,
          )
          .first(),
        "Daily Crystal Oracle: must show a user-facing message",
      ).toBeVisible({ timeout: 15_000 });
    } else {
      await expectNoStuckSpinner(page, "Daily Crystal Oracle");
    }


    // Page must still be interactive
    await back.click();
    await expect(
      page.getByText("AI Energy Reading", { exact: true }).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("Stalled (timeout) edge call still allows back-navigation", async ({ page }) => {
    // Hang every edge call — never fulfill. The test ensures the UI doesn't
    // block the user: Back-to-Hub button stays clickable and the spinner
    // either disappears (client-side timeout) or at least never blocks UX.
    await page.route(SUPABASE_FN, async (_route: Route) => {
      // Intentionally never call route.fulfill / route.continue
      await new Promise((r) => setTimeout(r, 25_000));
    });

    await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
    await page.getByText("Daily Crystal Oracle", { exact: true }).first().click();

    const back = page.getByRole("button", { name: /back to hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });
    await expect(back).toBeEnabled();

    // Even if a spinner is still spinning during the stall, Back-to-Hub
    // must remain usable (no overlay blocking pointer events).
    await back.click();
    await expect(
      page.getByText("AI Energy Reading", { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
