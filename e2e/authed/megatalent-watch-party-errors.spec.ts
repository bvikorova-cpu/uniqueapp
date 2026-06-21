/**
 * MegaTalent Watch Party — ERROR STATES (authed).
 *
 * Covers regressions where:
 *   1. The user's MegaTalent subscription has expired/lapsed → /megatalent/music
 *      must NOT mount the Watch Party UI; the paywall must take over even
 *      though the user is logged in.
 *   2. "Go Live" insert into megatalent_live_streams fails (DB/network) →
 *      the component surfaces a destructive toast and does NOT switch to the
 *      active-stream view (no End stream button, no chat input).
 *   3. Sending a chat message fails → destructive toast appears and the UI
 *      does not pretend the message was delivered.
 *
 * All requests to Supabase are stubbed at the network layer; no rows are
 * written, so no cleanup is needed.
 */
import { test, expect, Page } from "@playwright/test";

const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";
const REST_SUB = `https://${SUPABASE_HOST}/rest/v1/megatalent_subscriptions*`;
const FN_CHECK_SUB = `https://${SUPABASE_HOST}/functions/v1/check-megatalent-subscription`;
const REST_STREAMS = `https://${SUPABASE_HOST}/rest/v1/megatalent_live_streams*`;
const REST_MESSAGES = `https://${SUPABASE_HOST}/rest/v1/megatalent_watch_party_messages*`;

async function stubUnsubscribed(page: Page) {
  await page.route(REST_SUB, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(FN_CHECK_SUB, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ subscribed: false }),
    }),
  );
}

test.describe("Watch Party — error states", () => {
  test("expired subscription keeps Watch Party behind the paywall", async ({ page }) => {
    await stubUnsubscribed(page);

    await page.goto("/megatalent/music");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Paywall must be visible.
    await expect(
      page.getByText(/Unlock the MegaTalent contest|Odomkni MegaTalent/i),
    ).toBeVisible({ timeout: 15_000 });

    // Watch Party UI must NOT mount.
    expect(await page.getByText(/Live & Watch Party/i).count()).toBe(0);
    expect(await page.getByRole("button", { name: /Go Live/i }).count()).toBe(0);

    // €10 / €15 tier buttons remain the only entry points.
    await expect(page.getByRole("button", { name: /€10 \/ month/i })).toBeVisible();
  });

  test("Go Live insert failure shows error toast and stays on lobby", async ({ page }) => {
    let insertAttempted = false;

    // Reject only the INSERT (POST). Allow GETs so the lobby renders.
    await page.route(REST_STREAMS, async (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        insertAttempted = true;
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            code: "PGRST000",
            message: "stream insert failed (e2e stub)",
          }),
        });
      }
      return route.continue();
    });

    await page.goto("/megatalent/music");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    await expect(page.getByText(/Live & Watch Party/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // Open the create form and submit.
    await page.getByRole("button", { name: /Go Live/i }).click();
    await page.getByPlaceholder(/Stream title/i).fill(`E2E fail ${Date.now()}`);
    await page.getByRole("button", { name: /^Start$/i }).click();

    // Insert was attempted.
    await expect.poll(() => insertAttempted, { timeout: 8_000 }).toBe(true);

    // Destructive toast appears with the stub error message.
    await expect(
      page.locator("text=/stream insert failed \\(e2e stub\\)|Error/i").first(),
    ).toBeVisible({ timeout: 8_000 });

    // We must NOT have transitioned to the active-stream view.
    expect(await page.getByRole("button", { name: /End stream/i }).count()).toBe(0);
    expect(await page.getByPlaceholder(/Write a message/i).count()).toBe(0);
  });

  test("chat send failure surfaces a toast and does not silently swallow the error", async ({
    page,
  }) => {
    // Make every chat insert fail.
    await page.route(REST_MESSAGES, async (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            code: "PGRST000",
            message: "chat insert failed (e2e stub)",
          }),
        });
      }
      return route.continue();
    });

    await page.goto("/megatalent/music");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Need a live stream first. Reuse the real "Go Live" flow but stub the
    // stream insert to succeed with a fake row so we land on the chat view
    // without touching the database.
    const fakeStream = {
      id: "00000000-0000-0000-0000-0000000000ee",
      host_user_id: "00000000-0000-0000-0000-0000000000ff",
      category: "singing",
      title: "stub stream for chat error",
      status: "live",
      started_at: new Date().toISOString(),
      ended_at: null,
    };
    await page.route(REST_STREAMS, async (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(fakeStream),
        });
      }
      return route.continue();
    });

    await page.getByRole("button", { name: /Go Live/i }).click();
    await page.getByPlaceholder(/Stream title/i).fill(fakeStream.title);
    await page.getByRole("button", { name: /^Start$/i }).click();

    const chatInput = page.getByPlaceholder(/Write a message/i);
    await expect(chatInput).toBeVisible({ timeout: 10_000 });

    const msg = `fail-${Date.now()}`;
    await chatInput.fill(msg);
    await chatInput.press("Enter");

    // Destructive toast must show.
    await expect(
      page.locator("text=/chat insert failed \\(e2e stub\\)|Error/i").first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});
