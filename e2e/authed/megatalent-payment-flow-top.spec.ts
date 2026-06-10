/**
 * Megatalent payment flow — €15 TOP Premium tier (authed).
 *
 * Mirrors megatalent-payment-flow.spec.ts but exercises the top_premium tier
 * (€15 / month, Stripe price_1TOvuTGaXSfGtYFtIheCgIzQ).
 *
 *   1. Visit /megatalent — paywall is shown (subscription stubbed = false).
 *   2. Click "€15 / month" → create-megatalent-checkout invocation is captured;
 *      the test asserts body.tier === "top_premium" and returns a fake URL.
 *   3. Flip the gate (simulates webhook upserting an active row at €15).
 *   4. Return to /megatalent?success=true&tier=top_premium.
 *   5. Paywall is gone and the MegaTalent shell mounts.
 */
import { test, expect, Page } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";
const REST_SUB = `https://${SUPABASE_HOST}/rest/v1/megatalent_subscriptions*`;
const FN_CHECKOUT = `https://${SUPABASE_HOST}/functions/v1/create-checkout`;
const FN_CHECK = `https://${SUPABASE_HOST}/functions/v1/check-megatalent-subscription`;

async function installGateStubs(page: Page, getSubscribed: () => boolean) {
  await page.route(REST_SUB, async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: getSubscribed()
        ? JSON.stringify([
            {
              status: "active",
              tier: "top_premium",
              current_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString(),
            },
          ])
        : "[]",
    }),
  );
  await page.route(FN_CHECK, async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ subscribed: getSubscribed(), tier: "top_premium" }),
    }),
  );
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, body: "<html>stub</html>" }),
  );
}

test.describe("Megatalent payment flow — €15 Top Premium (authed)", () => {
  test("pay €15 → return from Stripe → feed unlocks at top_premium tier", async ({
    page,
    context,
  }) => {
    let subscribed = false;
    let checkoutCalled = false;

    await installGateStubs(page, () => subscribed);

    await page.route(FN_CHECKOUT, async (route) => {
      checkoutCalled = true;
      const body = route.request().postDataJSON?.() ?? {};
      expect(body?.tier).toBe("top_premium");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://checkout.stripe.com/test_session_megatalent_top_e2e",
        }),
      });
    });

    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    const popupPromise = context.waitForEvent("page", { timeout: 5_000 }).catch(() => null);
    await page.getByRole("button", { name: /€15 \/ month/i }).click();

    await expect.poll(() => checkoutCalled, { timeout: 5_000 }).toBe(true);

    const popup = await popupPromise;
    if (popup) await popup.close().catch(() => {});

    subscribed = true;
    await page.goto("/megatalent?success=true&tier=top_premium");

    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toHaveCount(0, { timeout: 15_000 });

    const shell = page
      .locator("text=/megatalent|prize pool|€10,000|upload|nahraj|pridaj|submit/i")
      .first();
    await expect(shell).toBeVisible({ timeout: 15_000 });

    await expect
      .poll(() => new URL(page.url()).search, { timeout: 5_000 })
      .not.toContain("success=true");
  });
});
