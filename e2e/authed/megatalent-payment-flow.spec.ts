/**
 * Megatalent payment flow — END-TO-END for an AUTHENTICATED user.
 *
 * Simulates the entire €10 Premium purchase journey without burning real money
 * or relying on the Stripe sandbox:
 *
 *   1. Visit /megatalent — paywall is shown (subscription check stubbed = false).
 *   2. Click "€10 / month" → create-megatalent-checkout invocation is captured;
 *      the test responds with a fake Stripe URL.
 *   3. The fake Stripe page is short-circuited; we navigate the SAME tab back
 *      to /megatalent?success=true&tier=premium — exactly what Stripe does
 *      after a real successful payment.
 *   4. The post-payment activation flow polls check-megatalent-subscription;
 *      we stub it to return `subscribed: true` (mirroring the Stripe webhook
 *      writing an active row into megatalent_subscriptions).
 *   5. Assert the paywall is gone and the gated MegaTalent shell is mounted.
 *
 * Why stub edge functions + DB instead of real Stripe?
 *   - Deterministic, no test-mode credentials in CI.
 *   - Exercises the EXACT client gating path (MegatalentGuard) that a real
 *     paying user hits — the only diff is who set `subscribed=true`.
 */
import { test, expect, Page } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";
const REST_SUB = `https://${SUPABASE_HOST}/rest/v1/megatalent_subscriptions*`;
// After B18a consolidation create-megatalent-checkout is proxied client-side
// (src/integrations/supabase/proxyMap.ts) to the universal create-checkout
// router with product: "megatalent_subscription".
const FN_CHECKOUT = `https://${SUPABASE_HOST}/functions/v1/create-checkout`;
const FN_CHECK = `https://${SUPABASE_HOST}/functions/v1/check-megatalent-subscription`;

/**
 * Install request interceptors that simulate the gate's data sources.
 * `subscribed` controls the response on subsequent calls; flip via the setter.
 */
async function installGateStubs(page: Page, getSubscribed: () => boolean) {
  // Block the DB-first check: return an empty array while unsubscribed,
  // an active row once flipped.
  await page.route(REST_SUB, async (route) => {
    if (!getSubscribed()) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        },
      ]),
    });
  });

  // Fallback edge function check — mirror the same toggle.
  await page.route(FN_CHECK, async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ subscribed: getSubscribed() }),
    }),
  );

  // Block real Stripe — should never load.
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, body: "<html>stub</html>" }),
  );
}

test.describe("Megatalent payment flow — authed", () => {
  test("pay €10 Premium → return from Stripe → feed unlocks", async ({ page, context }) => {
    let subscribed = false;
    let checkoutCalled = false;

    await installGateStubs(page, () => subscribed);

    // Stub the checkout edge function — capture the body, return a fake URL.
    await page.route(FN_CHECKOUT, async (route) => {
      const body = route.request().postDataJSON?.() ?? {};
      if (body?.product !== "megatalent_subscription") {
        return route.fallback();
      }
      checkoutCalled = true;
      expect(body?.tier).toBe("premium");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test_session_megatalent_e2e" }),
      });
    });

    // 1) Paywall is up.
    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    // 2) Click the €10 Premium tier — opens in a new tab.
    const popupPromise = context.waitForEvent("page", { timeout: 5_000 }).catch(() => null);
    await page.getByRole("button", { name: /€10 \/ month/i }).click();

    await expect.poll(() => checkoutCalled, { timeout: 5_000 }).toBe(true);

    const popup = await popupPromise;
    if (popup) {
      // Close the stripe popup — we'll simulate the redirect on the main tab.
      await popup.close().catch(() => {});
    }

    // 3) Flip the gate (mirrors Stripe webhook activating the subscription).
    subscribed = true;

    // 4) Return from Stripe to the SAME tab with success params.
    await page.goto("/megatalent?success=true&tier=premium");

    // 5) Paywall must disappear. The guard shows an "Activating..." screen
    //    for ~2.5s then mounts the real MegaTalent shell. Allow up to 15s.
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toHaveCount(0, { timeout: 15_000 });

    // Gated UI is mounted — the MegaTalent feed shell renders SOME signal:
    // hero copy, prize pool, upload CTA, or an existing submission card.
    const shell = page
      .locator("text=/megatalent|prize pool|€10,000|upload|nahraj|pridaj|submit/i")
      .first();
    await expect(shell).toBeVisible({ timeout: 15_000 });

    // The Stripe redirect params must be stripped from the URL by the guard.
    await expect
      .poll(() => new URL(page.url()).search, { timeout: 5_000 })
      .not.toContain("success=true");
  });
});
