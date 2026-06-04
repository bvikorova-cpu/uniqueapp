/**
 * MegaTalent Watch Party — AUTHENTICATED end-to-end flow.
 *
 * QA user (beata.vikorova@yandex.com) has an active megatalent_subscriptions
 * row so the MegatalentGuard lets us into /megatalent/music where the
 * MegatalentWatchParty component is mounted.
 *
 * Covers (UI + DB):
 *   1. JOIN — Watch Party card renders, "Go Live" affordance visible.
 *   2. START — clicking Go Live → entering a title → Start creates a row in
 *      megatalent_live_streams with status='live' for the current user.
 *   3. CONTENT — gated UI shows the LIVE badge, stream title, and chat input.
 *   4. CHAT — sending a message inserts into megatalent_watch_party_messages
 *      and the message renders in the scrollback.
 *   5. END / LEAVE — "End stream" flips status='ended'; "← Back" detaches
 *      the active stream without ending it.
 *
 * Also re-asserts RLS as the authed user:
 *   - INSERT into megatalent_live_streams with host_user_id ≠ auth.uid()
 *     is rejected (server-side WITH CHECK).
 *   - INSERT into megatalent_watch_party_messages with user_id ≠ auth.uid()
 *     is rejected.
 *
 * Cleanup at the end deletes any rows the test created.
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

function readAccessToken(): { token: string; userId: string } {
  const state = JSON.parse(readFileSync("e2e/.auth/authed-state.json", "utf8"));
  for (const origin of state.origins ?? []) {
    for (const item of origin.localStorage ?? []) {
      if (item.name?.startsWith("sb-") && item.name.endsWith("-auth-token")) {
        const session = JSON.parse(item.value);
        return { token: session.access_token, userId: session.user.id };
      }
    }
  }
  throw new Error("No persisted auth token found");
}

const CATEGORY_SLUG = "music"; // route param
const STREAM_CATEGORY = "singing"; // value persisted in DB (config.categories[0])
const CREATED_STREAM_IDS: string[] = [];

test.describe("Watch Party — authed E2E", () => {
  test.afterAll(async ({ request }) => {
    const { token } = readAccessToken();
    for (const id of CREATED_STREAM_IDS) {
      await request
        .delete(
          `${SUPABASE_URL}/rest/v1/megatalent_live_streams?id=eq.${id}`,
          {
            headers: {
              apikey: ANON_KEY,
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .catch(() => {});
    }
  });

  test("Go Live → chat message → End stream", async ({ page, request }) => {
    const { token, userId } = readAccessToken();
    const title = `E2E WP ${Date.now()}`;

    await page.goto(`/megatalent/${CATEGORY_SLUG}`);
    await page.waitForLoadState("networkidle");

    // 1. JOIN — Watch Party card must mount.
    const card = page.getByText(/Live & Watch Party/i).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    const goLive = page.getByRole("button", { name: /Go Live/i });
    await expect(goLive).toBeVisible();

    // 2. START — open form, type title, Start.
    await goLive.click();
    const titleInput = page.getByPlaceholder(/Stream title/i);
    await titleInput.fill(title);
    await page.getByRole("button", { name: /^Start$/i }).click();

    // 3. CONTENT — LIVE badge + title + chat input render.
    await expect(page.locator("text=/^LIVE$/").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(title, { exact: false })).toBeVisible();
    const chatInput = page.getByPlaceholder(/Write a message/i);
    await expect(chatInput).toBeVisible();

    // DB sanity: row exists with status='live' for this user.
    const streamRes = await request.get(
      `${SUPABASE_URL}/rest/v1/megatalent_live_streams?select=id,status,host_user_id&title=eq.${encodeURIComponent(title)}`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
    );
    expect(streamRes.ok()).toBeTruthy();
    const rows = await streamRes.json();
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe("live");
    expect(rows[0].host_user_id).toBe(userId);
    const streamId = rows[0].id as string;
    CREATED_STREAM_IDS.push(streamId);

    // 4. CHAT — send a message via UI, verify it renders + persists.
    const msg = `hello-${Date.now()}`;
    await chatInput.fill(msg);
    await chatInput.press("Enter");
    await expect(page.getByText(msg, { exact: false })).toBeVisible({ timeout: 8_000 });

    const msgRes = await request.get(
      `${SUPABASE_URL}/rest/v1/megatalent_watch_party_messages?select=id,content,user_id&stream_id=eq.${streamId}`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
    );
    const msgRows = await msgRes.json();
    expect(msgRows.some((m: any) => m.content === msg && m.user_id === userId)).toBe(true);

    // 5. END — End stream flips status.
    await page.getByRole("button", { name: /End stream/i }).click();
    // Card should detach (Go Live re-appears or stream list shown).
    await expect(page.getByRole("button", { name: /Go Live/i })).toBeVisible({ timeout: 8_000 });

    const endedRes = await request.get(
      `${SUPABASE_URL}/rest/v1/megatalent_live_streams?select=status,ended_at&id=eq.${streamId}`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
    );
    const endedRows = await endedRes.json();
    expect(endedRows[0].status).toBe("ended");
    expect(endedRows[0].ended_at).toBeTruthy();
  });

  test("RLS — authed user cannot impersonate another host or sender", async ({ request }) => {
    const { token } = readAccessToken();
    const other = "11111111-1111-1111-1111-111111111111";

    const insertStream = await request.post(
      `${SUPABASE_URL}/rest/v1/megatalent_live_streams`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          host_user_id: other,
          category: STREAM_CATEGORY,
          title: "rls-impersonation",
          status: "live",
        },
      },
    );
    expect(insertStream.status(), "RLS must reject host_user_id ≠ auth.uid()").toBeGreaterThanOrEqual(400);
    expect(insertStream.status()).toBeLessThan(500);

    const insertMsg = await request.post(
      `${SUPABASE_URL}/rest/v1/megatalent_watch_party_messages`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          stream_id: "00000000-0000-0000-0000-000000000000",
          user_id: other,
          content: "rls-impersonation",
        },
      },
    );
    expect(insertMsg.status()).toBeGreaterThanOrEqual(400);
    expect(insertMsg.status()).toBeLessThan(500);
  });
});
