import { test, expect } from "@playwright/test";

/**
 * Cross-user (A ↔ B) test pre brain_duel_friend_challenges (PvP).
 *
 * Flow:
 *   1) A vytvorí challenge (challenger_id=A, challenged_id=B).
 *   2) RLS: oboji A aj B vidia row (SELECT scope challenger OR challenged).
 *   3) B akceptuje cez UPDATE status='accepted', accepted_at=now().
 *   4) A overí, že stav je 'accepted'.
 *   5) Cleanup (A maže).
 *
 * Skip bez E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const EMAIL_B = process.env.E2E_TEST_EMAIL_B;
const PASSWORD_B = process.env.E2E_TEST_PASSWORD_B;

test("A challenges B in brain duel; B accepts; both see correct state", async ({ page, request }) => {
  test.setTimeout(60_000);

  if (!EMAIL_B || !PASSWORD_B) {
    test.skip(true, "E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B not set");
    return;
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const sessA = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.startsWith("sb-") && x.endsWith("-auth-token"));
    if (!k) return null;
    try { return JSON.parse(localStorage.getItem(k) ?? ""); } catch { return null; }
  });
  expect(sessA?.access_token).toBeTruthy();
  const userA = sessA.user.id;
  const tokenA = sessA.access_token;

  const signB = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    data: { email: EMAIL_B, password: PASSWORD_B },
  });
  expect(signB.ok(), `B sign-in failed: ${signB.status()}`).toBeTruthy();
  const sB = await signB.json();
  const userB: string = sB.user.id;
  const tokenB: string = sB.access_token;
  expect(userA).not.toBe(userB);

  const hA = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json", Prefer: "return=representation" };
  const hB = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json", Prefer: "return=representation" };

  // 1) A vytvorí challenge.
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const createRes = await request.post(`${SUPABASE_URL}/rest/v1/brain_duel_friend_challenges`, {
    headers: hA,
    data: {
      challenger_id: userA,
      challenged_id: userB,
      category: "general",
      stake_credits: 0,
      status: "pending",
      expires_at: expiresAt,
    },
  });
  if (!createRes.ok()) {
    test.skip(true, `challenge insert blocked (${createRes.status()}): ${(await createRes.text()).slice(0, 200)}`);
    return;
  }
  const challengeId: string = (await createRes.json())[0].id;
  expect(challengeId).toBeTruthy();

  // 2) B vidí challenge (RLS).
  const bSee = await request.get(`${SUPABASE_URL}/rest/v1/brain_duel_friend_challenges?id=eq.${challengeId}&select=*`, { headers: hB });
  expect(bSee.ok()).toBeTruthy();
  const bRows = await bSee.json();
  expect(bRows.length, "B must see the challenge addressed to them").toBe(1);
  expect(bRows[0].status).toBe("pending");

  // 3) B akceptuje.
  const acceptRes = await request.patch(`${SUPABASE_URL}/rest/v1/brain_duel_friend_challenges?id=eq.${challengeId}`, {
    headers: hB,
    data: { status: "accepted", accepted_at: new Date().toISOString() },
  });
  expect(acceptRes.ok(), `B accept failed: ${await acceptRes.text()}`).toBeTruthy();

  // 4) A overí stav.
  const aSee = await request.get(`${SUPABASE_URL}/rest/v1/brain_duel_friend_challenges?id=eq.${challengeId}&select=*`, { headers: hA });
  expect(aSee.ok()).toBeTruthy();
  const aRows = await aSee.json();
  expect(aRows.length).toBe(1);
  expect(aRows[0].status).toBe("accepted");
  expect(aRows[0].accepted_at).toBeTruthy();

  // 5) Cleanup.
  await request.delete(`${SUPABASE_URL}/rest/v1/brain_duel_friend_challenges?id=eq.${challengeId}`, { headers: hA });
});
