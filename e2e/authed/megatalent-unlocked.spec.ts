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
    await page.waitForLoadState("networkidle");

    // Paywall must be GONE.
    await expect(page.getByText(/Odomkni MegaTalent súťaž/i)).toHaveCount(0, {
      timeout: 15_000,
    });

    // Gated UI must be MOUNTED. Either vote/comment buttons exist on real
    // submissions, or the upload CTA / hero shell is rendered.
    const voteCount = await page.locator('button:has(svg.lucide-heart)').count();
    const commentCount = await page.locator('button:has(svg.lucide-message-circle)').count();
    const hasUploadCta =
      (await page.getByText(/upload|nahraj|pridaj|submit/i).count()) > 0;
    const hasHero =
      (await page.getByText(/megatalent|prize pool|€10,000/i).count()) > 0;

    expect(
      voteCount + commentCount > 0 || hasUploadCta || hasHero,
      "MegaTalent feed shell did not mount after subscription unlock",
    ).toBe(true);

    // If a vote button is rendered, clicking it MUST NOT raise the
    // "Premium required" toast — that toast only fires for unpaid users.
    if (voteCount > 0) {
      await page.locator('button:has(svg.lucide-heart)').first().click();
      const gateToast = page.getByText(/Megatalent Premium required/i);
      await expect(gateToast).toHaveCount(0, { timeout: 3_000 });
    }
  });
});
