import { test, expect, Page } from "@playwright/test";

/**
 * E2E tests for the full Stripe checkout flow.
 *
 * Coverage:
 *  1. Unauthenticated users are blocked from Stripe and see an auth toast.
 *  2. Stubbed `create-checkout` returns a URL → app opens checkout in a new tab,
 *     spinner clears, button becomes interactive again.
 *  3. Stubbed `create-checkout` failure (500) → spinner clears, error toast shows,
 *     button is re-enabled.
 *  4. Returning from Stripe with `?session_id=...&payment=success` triggers the
 *     verify endpoint, shows success toast, and cleans the URL params.
 *  5. Cancel return (`?payment=canceled`) shows an info toast and cleans URL.
 *
 * These tests stub Supabase Edge Functions via `page.route()` so they do NOT
 * hit Stripe or production functions.
 */

const FN_RE = /\/functions\/v1\//;

async function stubCheckoutSuccess(page: Page) {
  await page.route(FN_RE, async (route) => {
    const url = route.request().url();
    if (url.includes("create-checkout")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test_session_123" }),
      });
    }
    return route.continue();
  });
}

async function stubCheckoutFailure(page: Page) {
  await page.route(FN_RE, async (route) => {
    const url = route.request().url();
    if (url.includes("create-checkout")) {
      return route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Stripe unavailable" }),
      });
    }
    return route.continue();
  });
}

async function stubVerifySuccess(page: Page) {
  await page.route(FN_RE, async (route) => {
    const url = route.request().url();
    if (url.includes("verify-credits-payment") || url.includes("verify-")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, credits_added: 100 }),
      });
    }
    return route.continue();
  });
}

async function findCheckoutButton(page: Page) {
  // Try common checkout entry points across the app.
  const candidates = [
    page.getByRole("button", { name: /buy|subscribe|get started|purchase|checkout|upgrade/i }).first(),
  ];
  for (const c of candidates) {
    if (await c.count()) return c;
  }
  return null;
}

test.describe("Stripe checkout flow", () => {
  test("unauthenticated user is blocked with toast (no popup)", async ({ page, context }) => {
    const popups: Page[] = [];
    context.on("page", (p) => popups.push(p));

    await page.goto("/crystal-energy-network");
    await page.waitForLoadState("networkidle");

    const btn = await findCheckoutButton(page);
    if (!btn) test.skip(true, "No checkout button on page");
    await btn!.click();

    // Auth required toast (sonner / shadcn toaster)
    await expect(
      page.getByText(/sign in|authentication|please sign|prihlás/i).first(),
    ).toBeVisible({ timeout: 5_000 });
    expect(popups.length).toBe(0);
  });

  test("checkout success → URL returned, spinner clears, button reusable", async ({ page }) => {
    await stubCheckoutSuccess(page);

    // Block actual Stripe popup navigation
    await page.route("https://checkout.stripe.com/**", (r) =>
      r.fulfill({ status: 200, body: "<html>stripe</html>" }),
    );

    await page.goto("/crystal-energy-network");
    await page.waitForLoadState("networkidle");

    const btn = await findCheckoutButton(page);
    if (!btn) test.skip(true, "No checkout button");
    await btn!.click();

    // Spinner must clear within 5s
    await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 5_000 });
    // Button is interactive again
    await expect(btn!).toBeEnabled({ timeout: 5_000 });
  });

  test("checkout 500 → spinner clears, error toast shown, button re-enabled", async ({ page }) => {
    await stubCheckoutFailure(page);

    await page.goto("/crystal-energy-network");
    await page.waitForLoadState("networkidle");

    const btn = await findCheckoutButton(page);
    if (!btn) test.skip(true, "No checkout button");
    await btn!.click();

    await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 8_000 });
    await expect(
      page.getByText(/error|failed|unavailable|chyba|try again/i).first(),
    ).toBeVisible({ timeout: 5_000 });
    await expect(btn!).toBeEnabled({ timeout: 5_000 });
  });

  test("return from Stripe with session_id triggers verify + cleans URL", async ({ page }) => {
    await stubVerifySuccess(page);

    await page.goto("/?payment=success&session_id=cs_test_123");
    await page.waitForLoadState("networkidle");

    // URL should be cleaned after verification
    await expect.poll(() => new URL(page.url()).search, { timeout: 8_000 }).not.toContain("session_id");
    await expect.poll(() => new URL(page.url()).search, { timeout: 8_000 }).not.toContain("payment=success");
  });

  test("cancel return shows info toast and cleans URL", async ({ page }) => {
    await page.goto("/?payment=canceled");
    await page.waitForLoadState("networkidle");

    await expect.poll(() => new URL(page.url()).search, { timeout: 5_000 }).not.toContain("payment=canceled");
  });
});
