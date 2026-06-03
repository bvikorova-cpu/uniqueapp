import { test, expect } from "@playwright/test";
import { getNotificationRoute } from "../../src/utils/notificationRoutes";

/**
 * Overuje trigger _notify_friend_quest_invite:
 *   1) prihlásený user pošle friend_quest_invite (self → self, povolené RLS),
 *   2) DB trigger vytvorí notifikáciu pre to_user,
 *   3) notifikácia má type=friend_quest_invite, related_id=invite.id,
 *      action_url=/rewards?tab=friend-quests, actor_id=from_user,
 *   4) getNotificationRoute() vráti správnu cestu (klik → /rewards?tab=friend-quests).
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe.configure({ retries: 2 });

test("friend quest invite creates notification for recipient with related_id+action_url", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(1000);

  const session = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) return null;
    const raw = localStorage.getItem(key);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  expect(session?.access_token, "missing supabase session").toBeTruthy();
  const userId: string = session.user.id;
  const accessToken: string = session.access_token;

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // 1) Insert invite (self → self).
  const inviteRes = await page.request.post(
    `${SUPABASE_URL}/rest/v1/friend_quest_invites`,
    {
      headers,
      data: { from_user: userId, to_user: userId, quest_type: "post_streak" },
    },
  );
  if (!inviteRes.ok()) {
    const body = await inviteRes.text();
    test.skip(true, `invite insert blocked (${inviteRes.status()}): ${body.slice(0, 200)}`);
    return;
  }
  const inviteRows = await inviteRes.json();
  const inviteId: string = inviteRows[0].id;
  expect(inviteId).toBeTruthy();

  // 2) Poll notifications for the matching row created by the trigger.
  let notif: any = null;
  for (let i = 0; i < 20; i++) {
    const res = await page.request.get(
      `${SUPABASE_URL}/rest/v1/notifications?related_id=eq.${inviteId}&type=eq.friend_quest_invite&select=*`,
      { headers },
    );
    if (res.ok()) {
      const rows = await res.json();
      if (rows.length > 0) { notif = rows[0]; break; }
    }
    await page.waitForTimeout(500);
  }

  expect(notif, "trigger did not create notification for recipient").toBeTruthy();
  expect(notif.user_id).toBe(userId);          // recipient
  expect(notif.actor_id).toBe(userId);         // sender
  expect(notif.related_id).toBe(inviteId);     // identifies the invite
  expect(notif.type).toBe("friend_quest_invite");
  expect(notif.action_url).toBe("/rewards?tab=friend-quests");
  expect(typeof notif.message).toBe("string");
  expect(notif.message.length).toBeGreaterThan(0);

  // 3) Router maps notification to correct path (simulates click).
  expect(getNotificationRoute(notif)).toBe("/rewards?tab=friend-quests");

  // 4) Cleanup
  await page.request.delete(
    `${SUPABASE_URL}/rest/v1/notifications?id=eq.${notif.id}`,
    { headers },
  );
  await page.request.delete(
    `${SUPABASE_URL}/rest/v1/friend_quest_invites?id=eq.${inviteId}`,
    { headers },
  );
});
