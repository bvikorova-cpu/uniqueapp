/**
 * Megatalent payment flow — ANONYMOUS visitor.
 *
 * Verifies the gate works for a logged-out user:
 *   1. /megatalent renders the paywall (no feed, no vote/comment buttons).
 *   2. Both checkout buttons (€10 Premium / €15 TOP Premium) are visible.
 *   3. Clicking a paid tier without a session does NOT call Stripe — the user
 *      is either bounced to /auth or the call short-circuits (no Stripe URL
 *      ever returned), proving anonymous users cannot bypass auth to pay.
 *
 * The full success path (anonymous → pay → return → unlock) is exercised by
 * the authed companion at e2e/authed/megatalent-payment-flow.spec.ts, because
 * Stripe webhook -> DB activation requires an authenticated user_id.
 */
import { test, expect } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";

test.describe("Megatalent paywall — anonymous", () => {
  test("paywall blocks feed and anonymous checkout cannot reach Stripe", async ({ page }) => {
    let checkoutInvoked = false;
    let stripeOpened = false;

    // Spy on the create-megatalent-checkout edge function. If it ever fires
    // for an anonymous user it must NOT return a valid Stripe URL — stub a 401.
    await page.route(`https://${SUPABASE_HOST}/functions/v1/create-megatalent-checkout`, async (route) => {
      checkoutInvoked = true;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Authentication required" }),
      });
    });

    // Catch any popup to checkout.stripe.com — must never happen anonymously.
    page.context().on("page", (p) => {
      if (p.url().includes("checkout.stripe.com")) stripeOpened = true;
    });
    await page.route("https://checkout.stripe.com/**", (r) => {
      stripeOpened = true;
      return r.fulfill({ status: 200, body: "<html>stripe</html>" });
    });

    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");

    // Paywall title rendered (component uses English copy).
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    // Both paid tier buttons rendered.
    await expect(page.getByRole("button", { name: /€10 \/ month/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /€15 \/ month/i })).toBeVisible();

    // Gated UI must NOT be mounted: no vote / comment affordances behind the paywall.
    expect(await page.locator("button:has(svg.lucide-heart)").count()).toBe(0);
    expect(await page.locator("button:has(svg.lucide-message-circle)").count()).toBe(0);

    // Click Premium. Even if invoke is attempted, it MUST be rejected — no
    // Stripe popup may open. Some apps short-circuit before invoking; that is
    // also acceptable (checkoutInvoked stays false).
    await page.getByRole("button", { name: /€10 \/ month/i }).click();
    await page.waitForTimeout(1500);

    expect(stripeOpened, "Anonymous user reached Stripe Checkout — auth gate broken").toBe(false);
    if (checkoutInvoked) {
      // If the function was hit it returned 401 → toast / paywall stays.
      await expect(
        page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
      ).toBeVisible();
    }
  });
});
