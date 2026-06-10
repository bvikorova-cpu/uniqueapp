/**
 * Megatalent payment flow — ANONYMOUS visitor.
 *
 * Verifies the auth/paywall gate for a logged-out user:
 *   1. Visiting /megatalent without a session redirects to /auth
 *      (MegatalentGuard renders <Navigate to="/auth" /> when !user).
 *   2. No request to create-megatalent-checkout is ever fired.
 *   3. No Stripe Checkout popup ever opens.
 *
 * The full success path (pay → return → unlock) requires an authenticated
 * session because the Stripe webhook activates the subscription against the
 * user's id — that flow is exercised by the authed companion spec at
 * e2e/authed/megatalent-payment-flow.spec.ts.
 */
import { test, expect } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";

test.describe("Megatalent paywall — anonymous", () => {
  test("anonymous visitor is bounced to /auth and never reaches Stripe", async ({ page, context }) => {
    let checkoutInvoked = false;
    let stripeOpened = false;

    await page.route(`https://${SUPABASE_HOST}/functions/v1/create-checkout`, async (route) => {
      const body = route.request().postDataJSON?.() ?? {};
      if (body?.product !== "megatalent_subscription") {
        return route.fallback();
      }
      checkoutInvoked = true;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Authentication required" }),
      });
    });

    context.on("page", (p) => {
      if (p.url().includes("checkout.stripe.com")) stripeOpened = true;
    });
    await page.route("https://checkout.stripe.com/**", (r) => {
      stripeOpened = true;
      return r.fulfill({ status: 200, body: "<html>stub</html>" });
    });

    await page.goto("/megatalent");

    // Guard redirects unauth users to /auth — wait for the URL to settle there.
    await page.waitForURL(/\/auth(\b|\?|#|$)/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    // No paid-tier buttons should be on the auth page.
    expect(await page.getByRole("button", { name: /€10 \/ month/i }).count()).toBe(0);
    expect(await page.getByRole("button", { name: /€15 \/ month/i }).count()).toBe(0);

    // And critically: no checkout was attempted, no Stripe popup opened.
    expect(checkoutInvoked, "Anonymous visit invoked create-megatalent-checkout").toBe(false);
    expect(stripeOpened, "Anonymous visit reached Stripe Checkout").toBe(false);
  });
});
