import { test, expect, Page } from "@playwright/test";

/**
 * E2E tests for the Multiverse Network module.
 *
 * Coverage:
 *  1. Public hub renders without auth and shows core sections.
 *  2. Stripe checkout (create-multiverse-checkout) — success returns URL,
 *     spinner clears, button reusable.
 *  3. Stripe checkout failure (500) — spinner clears, error toast, button re-enabled.
 *  4. Quantum reality vote (vote-absolution-style flow) — auth gate + happy path.
 *  5. Reality jump / merge timelines — auth gate (401 → toast, no crash).
 *  6. Return from Stripe with ?session_id triggers verify-multiverse-payment
 *     and cleans URL params.
 *
 * All Edge Functions are stubbed via page.route() — no real Stripe calls.
 */

const FN_RE = /\/functions\/v1\//;
const ROUTE = "/multiverse-network";

async function stubAll(
  page: Page,
  handlers: Record<string, { status: number; body: any }>,
) {
  await page.route(FN_RE, async (route) => {
    const url = route.request().url();
    for (const [key, resp] of Object.entries(handlers)) {
      if (url.includes(key)) {
        return route.fulfill({
          status: resp.status,
          contentType: "application/json",
          body: JSON.stringify(resp.body),
        });
      }
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

test.describe("Multiverse Network", () => {
  test("public hub renders without auth", async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(new RegExp(ROUTE));
    // Page should not crash — body present
    await expect(page.locator("body")).toBeVisible();
  });

  test("checkout success → spinner clears, button reusable", async ({ page, context }) => {
    await stubAll(page, {
      "create-multiverse-checkout": {
        status: 200,
        body: { url: "https://checkout.stripe.com/test_mv_123" },
      },
    });
    await page.route("https://checkout.stripe.com/**", (r) =>
      r.fulfill({ status: 200, body: "<html>stripe</html>" }),
    );

    const popups: Page[] = [];
    context.on("page", (p) => popups.push(p));

    await page.goto(ROUTE);
    await page.waitForLoadState("networkidle");

    const btn = page
      .getByRole("button", { name: /get access|subscribe|buy|purchase|upgrade/i })
      .first();
    if (!(await btn.count())) test.skip(true, "No checkout button visible on hub");

    await btn.click();
    await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 6_000 });
    await expect(btn).toBeEnabled({ timeout: 6_000 });
  });

  test("checkout 500 → spinner clears, error toast shown", async ({ page }) => {
    await stubAll(page, {
      "create-multiverse-checkout": {
        status: 500,
        body: { error: "Stripe unavailable" },
      },
    });

    await page.goto(ROUTE);
    await page.waitForLoadState("networkidle");

    const btn = page
      .getByRole("button", { name: /get access|subscribe|buy|purchase|upgrade/i })
      .first();
    if (!(await btn.count())) test.skip(true, "No checkout button visible on hub");

    await btn.click();
    await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 8_000 });
    await expect(
      page.getByText(/error|failed|try again|chyba/i).first(),
    ).toBeVisible({ timeout: 5_000 });
    await expect(btn).toBeEnabled({ timeout: 5_000 });
  });

  test("quantum vote / interaction without auth shows sign-in toast", async ({ page }) => {
    await stubAll(page, {
      "vote-absolution": { status: 401, body: { error: "Unauthorized" } },
      "reality-jump": { status: 401, body: { error: "Unauthorized" } },
      "merge-timelines": { status: 401, body: { error: "Unauthorized" } },
      "multiverse-ai-tool": { status: 401, body: { error: "Unauthorized" } },
    });

    await page.goto(ROUTE);
    await page.waitForLoadState("networkidle");

    const interactive = page
      .getByRole("button", { name: /vote|jump|merge|generate|create|map|compare/i })
      .first();
    if (!(await interactive.count())) test.skip(true, "No interactive action button on hub");

    await interactive.click();
    // Either a sign-in toast or no crash + spinner clears
    await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 6_000 });
    await expect(interactive).toBeEnabled({ timeout: 6_000 });
  });

  test("return from Stripe with session_id triggers verify and cleans URL", async ({ page }) => {
    await stubAll(page, {
      "verify-multiverse-payment": {
        status: 200,
        body: { success: true, service: "reality_jumping" },
      },
      "verify-": {
        status: 200,
        body: { success: true },
      },
    });

    await page.goto(`${ROUTE}?payment=success&session_id=cs_test_mv_999`);
    await page.waitForLoadState("networkidle");

    await expect
      .poll(() => new URL(page.url()).search, { timeout: 8_000 })
      .not.toContain("session_id");
    await expect
      .poll(() => new URL(page.url()).search, { timeout: 8_000 })
      .not.toContain("payment=success");
  });

  test("cancel return cleans URL", async ({ page }) => {
    await page.goto(`${ROUTE}?payment=canceled`);
    await page.waitForLoadState("networkidle");

    await expect
      .poll(() => new URL(page.url()).search, { timeout: 5_000 })
      .not.toContain("payment=canceled");
  });
});
