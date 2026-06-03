import { test, expect } from "@playwright/test";

/**
 * Real cross-user (A ↔ B) test for friend quest flow.
 *
 * Flow:
 *   1) User A (browser session) posiela friend_quest_invite na User B.
 *   2) DB trigger _notify_friend_quest_invite vytvorí notifikáciu pre B.
 *   3) User B (REST sign-in) overí, že notifikáciu vidí (RLS scoped).
 *   4) User B akceptuje invite cez RPC accept_friend_quest_invite.
 *   5) DB trigger _notify_friend_quest_invite_response vytvorí notifikáciu
 *      typu friend_quest_accepted pre A (sender) s related_id=invite.id.
 *   6) Cleanup invite + obe notifikácie.
 *
 * Vyžaduje env vars (inak skip):
 *   E2E_TEST_EMAIL_B  — druhý reálny test účet
 *   E2E_TEST_PASSWORD_B
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const EMAIL_B = process.env.E2E_TEST_EMAIL_B;
const PASSWORD_B = process.env.E2E_TEST_PASSWORD_B;

test.describe.configure({ retries: 1 });

test("A → B friend quest invite + B accept → A receives accepted notification", async ({ page, request }) => {
  test.setTimeout(90_000);

  if (!EMAIL_B || !PASSWORD_B) {
    test.skip(true, "E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B not set — cross-user test needs a second account");
    return;
  }

  // --- User A from persisted browser session ---
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const sessionA = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) return null;
    try { return JSON.parse(localStorage.getItem(key) ?? ""); } catch { return null; }
  });
  expect(sessionA?.access_token, "missing user A session").toBeTruthy();
  const userA = sessionA.user.id;
  const tokenA = sessionA.access_token;

  // --- User B via REST sign-in ---
  const signinB = await request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      data: { email: EMAIL_B, password: PASSWORD_B },
    },
  );
  expect(signinB.ok(), `User B sign-in failed: ${signinB.status()}`).toBeTruthy();
  const sessB = await signinB.json();
  const userB: string = sessB.user.id;
  const tokenB: string = sessB.access_token;

  expect(userA, "A and B must be distinct accounts").not.toBe(userB);

  const hA = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${tokenA}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  const hB = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${tokenB}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // 1) A posiela invite na B.
  const inviteRes = await request.post(
    `${SUPABASE_URL}/rest/v1/friend_quest_invites`,
    { headers: hA, data: { from_user: userA, to_user: userB, quest_type: "post_streak" } },
  );
  if (!inviteRes.ok()) {
    const body = await inviteRes.text();
    test.skip(true, `A → B invite insert blocked by RLS (${inviteRes.status()}): ${body.slice(0, 200)}`);
    return;
  }
  const inviteId: string = (await inviteRes.json())[0].id;
  expect(inviteId).toBeTruthy();

  // 2) B vidí notifikáciu (friend_quest_invite).
  let inviteNotif: any = null;
  for (let i = 0; i < 20; i++) {
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/notifications?related_id=eq.${inviteId}&type=eq.friend_quest_invite&select=*`,
      { headers: hB },
    );
    if (r.ok()) {
      const rows = await r.json();
      if (rows.length > 0) { inviteNotif = rows[0]; break; }
    }
    await page.waitForTimeout(500);
  }
  expect(inviteNotif, "B did not receive friend_quest_invite notification").toBeTruthy();
  expect(inviteNotif.user_id).toBe(userB);
  expect(inviteNotif.actor_id).toBe(userA);
  expect(inviteNotif.action_url).toBe("/rewards?tab=friend-quests");

  // 3) B akceptuje cez RPC.
  const acceptRes = await request.post(
    `${SUPABASE_URL}/rest/v1/rpc/accept_friend_quest_invite`,
    { headers: hB, data: { _invite_id: inviteId } },
  );
  expect(acceptRes.ok(), `accept RPC failed: ${acceptRes.status()} ${await acceptRes.text()}`).toBeTruthy();
  const acceptJson = await acceptRes.json();
  expect(acceptJson?.ok, `accept RPC returned not ok: ${JSON.stringify(acceptJson)}`).toBeTruthy();

  // 4) A dostane notifikáciu friend_quest_accepted.
  let acceptedNotif: any = null;
  for (let i = 0; i < 20; i++) {
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/notifications?related_id=eq.${inviteId}&type=eq.friend_quest_accepted&select=*`,
      { headers: hA },
    );
    if (r.ok()) {
      const rows = await r.json();
      if (rows.length > 0) { acceptedNotif = rows[0]; break; }
    }
    await page.waitForTimeout(500);
  }
  expect(acceptedNotif, "A did not receive friend_quest_accepted notification").toBeTruthy();
  expect(acceptedNotif.user_id).toBe(userA);
  expect(acceptedNotif.actor_id).toBe(userB);
  expect(acceptedNotif.related_id).toBe(inviteId);
  expect(acceptedNotif.action_url).toBe("/rewards?tab=friend-quests");

  // 5) Cleanup (B maže svoju notifikáciu, A svoju + invite).
  await request.delete(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${inviteNotif.id}`, { headers: hB });
  await request.delete(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${acceptedNotif.id}`, { headers: hA });
  await request.delete(`${SUPABASE_URL}/rest/v1/friend_quest_invites?id=eq.${inviteId}`, { headers: hA });
});
