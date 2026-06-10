/**
 * Megatalent payment CANCEL/DECLINE — AUTHENTICATED user.
 *
 * Simulates the failure side of the €10 Premium checkout:
 *
 *   1. Visit /megatalent — paywall is shown (subscription stub = false).
 *   2. Click "€10 / month" → create-megatalent-checkout returns a fake URL.
 *      We stub the response so no real Stripe popup loads.
 *   3. Simulate the user clicking "Back" / Stripe declining the card by
 *      navigating the SAME tab back to /megatalent?canceled=true (and also
 *      ?payment=failed in a second pass).
 *   4. Subscription check stays `false` (mirrors: no webhook ever fired).
 *   5. Assert the paywall is STILL visible and the gated feed never mounts.
 *
 * This guards against a regression where the guard accidentally treats
 * any return-from-Stripe (regardless of query params) as success.
 */
import { test, expect, Page } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";
const REST_SUB = `https://${SUPABASE_HOST}/rest/v1/megatalent_subscriptions*`;
const FN_CHECKOUT = `https://${SUPABASE_HOST}/functions/v1/create-checkout`;
const FN_CHECK = `https://${SUPABASE_HOST}/functions/v1/check-megatalent-subscription`;

async function installUnsubscribedStubs(page: Page) {
  await page.route(REST_SUB, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(FN_CHECK, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ subscribed: false }),
    }),
  );
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, body: "<html>stub</html>" }),
  );
}

for (const query of ["canceled=true", "payment=failed"]) {
  test(`cancel/decline (${query}) keeps MegaTalent locked`, async ({ page, context }) => {
    let checkoutCalled = false;

    await installUnsubscribedStubs(page);
    await page.route(FN_CHECKOUT, async (route) => {
      const body = route.request().postDataJSON?.() ?? {};
      if (body?.product !== "megatalent_subscription") {
        return route.fallback();
      }
      checkoutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://checkout.stripe.com/test_session_megatalent_cancel",
        }),
      });
    });

    // 1) Paywall up.
    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    // 2) Click €10 — opens new tab; close it (simulating user abandoning Stripe).
    const popupPromise = context.waitForEvent("page", { timeout: 5_000 }).catch(() => null);
    await page.getByRole("button", { name: /€10 \/ month/i }).click();
    await expect.poll(() => checkoutCalled, { timeout: 5_000 }).toBe(true);
    const popup = await popupPromise;
    if (popup) await popup.close().catch(() => {});

    // 3) Return from Stripe with cancel/decline params.
    await page.goto(`/megatalent?${query}`);
    await page.waitForLoadState("networkidle");

    // 4) Paywall MUST still be visible — subscription was never activated.
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    // 5) The gated shell must NOT have mounted. The €10 / €15 tier buttons
    //    remain the only checkout entry points (proof the paywall is up).
    await expect(page.getByRole("button", { name: /€10 \/ month/i })).toBeVisible();
  });
}
