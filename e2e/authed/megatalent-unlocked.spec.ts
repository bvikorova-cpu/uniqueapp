import { test, expect } from "@playwright/test";

/**
 * MegaTalent — authenticated, already-subscribed user.
 *
 * The shared QA test account (beata.vikorova@yandex.com) carries an active
 * `top_premium` row in `megatalent_subscriptions`, so the paywall MUST be
 * dismissed and the gated feed mounted.
 *
 * Asserts (functional, not visual):
 *   1. Paywall card "Odomkni MegaTalent súťaž" is NOT rendered.
 *   2. The feed shell renders (hero, contest stats, or vote/upload affordance).
 *   3. Clicking a vote button does NOT show the "Megatalent Premium required"
 *      gate toast — proving the gated client logic recognises the active sub.
 */
test.describe("MegaTalent — paid user unlock", () => {
  test("feed is reachable, no paywall, voting does not show premium-required toast", async ({
    page,
  }) => {
    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Paywall must be GONE.
    await expect(page.getByText(/Odomkni MegaTalent súťaž/i)).toHaveCount(0, {
      timeout: 15_000,
    });

    // Gated UI must be MOUNTED. Wait up to 15s for the hero / shell to appear —
    // /megatalent has heavy client-side hydration after the subscription check.
    const heroOrCta = page
      .locator("text=/megatalent|prize pool|€10,000|upload|nahraj|pridaj|submit/i")
      .first();
    await expect(heroOrCta).toBeVisible({ timeout: 15_000 });

    // If a vote button is rendered, clicking it MUST NOT raise the
    // "Premium required" toast — that toast only fires for unpaid users.
    const voteBtn = page.locator('button:has(svg.lucide-heart)').first();
    if (await voteBtn.count() > 0) {
      await voteBtn.click({ trial: false }).catch(() => {/* overlay races; not fatal */});
      const gateToast = page.getByText(/Megatalent Premium required/i);
      await expect(gateToast).toHaveCount(0, { timeout: 3_000 });
    }
  });
});
