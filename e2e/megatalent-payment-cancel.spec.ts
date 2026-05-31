/**
 * Megatalent payment CANCEL/DECLINE — ANONYMOUS visitor.
 *
 * Verifies that a logged-out user who returns from Stripe with cancel or
 * payment-failure params still cannot reach the gated MegaTalent feed:
 *   1. /megatalent?canceled=true        → redirected to /auth, no unlock.
 *   2. /megatalent?payment=failed       → redirected to /auth, no unlock.
 *   3. No create-megatalent-checkout invocation, no Stripe popup.
 *
 * The full activation path requires a session — the authed counterpart at
 * e2e/authed/megatalent-payment-cancel.spec.ts exercises that case.
 */
import { test, expect } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";

test.describe("Megatalent paywall — anonymous cancel/decline", () => {
  for (const query of ["canceled=true", "payment=failed", "success=false"]) {
    test(`anonymous return with ?${query} stays locked & bounces to /auth`, async ({
      page,
      context,
    }) => {
      let checkoutInvoked = false;
      let stripeOpened = false;

      await page.route(
        `https://${SUPABASE_HOST}/functions/v1/create-megatalent-checkout`,
        async (route) => {
          checkoutInvoked = true;
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ error: "Authentication required" }),
          });
        },
      );

      context.on("page", (p) => {
        if (p.url().includes("checkout.stripe.com")) stripeOpened = true;
      });
      await page.route("https://checkout.stripe.com/**", (r) => {
        stripeOpened = true;
        return r.fulfill({ status: 200, body: "<html>stub</html>" });
      });

      await page.goto(`/megatalent?${query}`);
      await page.waitForURL(/\/auth(\b|\?|#|$)/, { timeout: 15_000 });
      await page.waitForLoadState("networkidle");

      // No gated MegaTalent UI is reachable.
      expect(await page.getByRole("button", { name: /€10 \/ month/i }).count()).toBe(0);
      expect(
        await page.locator("text=/prize pool|€10,000|MegaTalent feed/i").count(),
      ).toBe(0);

      // No checkout attempt, no Stripe popup.
      expect(checkoutInvoked, "Anonymous visit invoked create-megatalent-checkout").toBe(false);
      expect(stripeOpened, "Anonymous visit reached Stripe Checkout").toBe(false);
    });
  }
});
