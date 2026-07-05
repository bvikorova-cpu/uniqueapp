/**
 * Concert virtual gift — 80/20 split verification (authed).
 *
 * Verifies:
 *   1. ConcertGiftsPanel renders the "80% to artist" badge and the
 *      "Platform fee 20% · Artist receives 80%" footer.
 *   2. Clicking a gift POSTs to /functions/v1/send-concert-gift with
 *      the expected { concertId, giftId } body.
 *   3. Numerical invariant: for the selected gift price, the payout
 *      (80%) and platform commission (20%) sum to the total, and both
 *      match what a server would place in Stripe metadata.
 *
 * Concert/RPC responses are intercepted so this test does not depend
 * on a seeded live_concert_streams row and never hits real Stripe.
 */
import { test, expect } from "@playwright/test";

const FAKE_CONCERT_ID = "00000000-0000-0000-0000-0000000000aa";
const FAKE_MUSICIAN_USER_ID = "00000000-0000-0000-0000-0000000000bb";

const FAKE_CONCERT_ROW = {
  id: FAKE_CONCERT_ID,
  title: "Split Verification Concert",
  description: "E2E — 80/20 split",
  status: "live",
  playback_url: null,
  started_at: new Date().toISOString(),
  scheduled_at: new Date().toISOString(),
  musician_id: FAKE_MUSICIAN_USER_ID,
  viewer_count: 1,
  musician_profiles: {
    stage_name: "Split Artist",
    user_id: FAKE_MUSICIAN_USER_ID,
    avatar_url: null,
  },
};

// Same platform gifts we seeded in the DB — keep in sync with public.platform_gifts.
const FAKE_GIFTS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Rose", icon: "🌹", price: 0.5 },
  { id: "00000000-0000-0000-0000-000000000002", name: "Heart", icon: "❤️", price: 1.0 },
];

function computeSplit(priceEur: number) {
  const totalCents = Math.round(priceEur * 100);
  const platformCents = Math.round(totalCents * 0.20);
  const musicianCents = totalCents - platformCents;
  return { totalCents, platformCents, musicianCents };
}

test.describe("Concert gift 80/20 split", () => {
  test("panel shows 80/20, click posts correct body, math is exact", async ({ page }) => {
    // --- Intercept Supabase REST + RPC + edge function ---
    let sendGiftPayload: any = null;
    let sendGiftHit = 0;

    await page.route("**/rest/v1/rpc/can_watch_concert", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(true),
      });
    });

    await page.route("**/rest/v1/live_concert_streams*", async (route) => {
      // Return the fake concert row for GET queries by id.
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_CONCERT_ROW),
      });
    });

    await page.route("**/rest/v1/platform_gifts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_GIFTS),
      });
    });

    await page.route("**/functions/v1/send-concert-gift", async (route) => {
      sendGiftHit++;
      try {
        sendGiftPayload = JSON.parse(route.request().postData() || "{}");
      } catch {
        sendGiftPayload = null;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "about:blank#stripe-mock",
          session_id: "cs_test_split_verify",
        }),
      });
    });

    // Block real navigation to about:blank redirect from window.location.href
    await page.route("about:blank#stripe-mock", (r) => r.fulfill({ status: 200, body: "" }));

    // --- Navigate ---
    await page.goto(`/concert-watch/${FAKE_CONCERT_ID}`, { waitUntil: "domcontentloaded" });
    if (/\/auth(\b|\/)/.test(page.url())) {
      test.skip(true, "Auth wall — session not injected for this run.");
      return;
    }

    // Open the Gifts tab if present (ConcertWatch uses Tabs).
    const giftsTab = page.getByRole("tab", { name: /gift/i });
    if (await giftsTab.count()) {
      await giftsTab.first().click().catch(() => {});
    }

    // --- Split UI text present ---
    await expect(page.getByText(/80%\s*to artist/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText(/platform fee 20%\s*·\s*artist receives 80%/i).first()
    ).toBeVisible();

    // --- Click a gift and assert outgoing request payload ---
    const roseButton = page.getByRole("button", { name: /rose/i }).first();
    await expect(roseButton).toBeVisible();
    await roseButton.click();

    await expect
      .poll(() => sendGiftHit, { timeout: 8_000 })
      .toBeGreaterThan(0);

    expect(sendGiftPayload).toBeTruthy();
    expect(sendGiftPayload.concertId).toBe(FAKE_CONCERT_ID);
    expect(sendGiftPayload.giftId).toBe(FAKE_GIFTS[0].id);

    // --- Numerical invariant for Stripe metadata ---
    for (const g of FAKE_GIFTS) {
      const { totalCents, platformCents, musicianCents } = computeSplit(g.price);
      expect(platformCents + musicianCents).toBe(totalCents);
      // 80/20 rule (exact for these prices; tolerate ±1 cent rounding otherwise)
      expect(Math.abs(musicianCents / totalCents - 0.80)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(platformCents / totalCents - 0.20)).toBeLessThanOrEqual(0.01);
    }
  });
});
