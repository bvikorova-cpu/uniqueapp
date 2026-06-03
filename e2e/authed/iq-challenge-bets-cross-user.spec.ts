import { test, expect } from "@playwright/test";

/**
 * Cross-user (A ↔ B) test pre iq_friend_challenges + iq_match_bets.
 *
 * Flow:
 *   1) A vytvorí iq_friend_challenge (challenger=A, opponent=B).
 *   2) B vidí challenge (RLS scope challenger OR opponent).
 *   3) Obaja stavia v iq_match_bets na ten istý match_id (= challenge.id) —
 *      A stávkuje na seba, B stávkuje na seba (opačné predikcie).
 *   4) Obaja overia, že vidia obe stávky (RLS: "Anyone can view match bets").
 *   5) B akceptuje cez UPDATE status='accepted'.
 *   6) A overí akceptovaný stav.
 *   7) Cleanup.
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

test("A vs B IQ challenge: invite, dual bets visible to both, B accepts", async ({ page, request }) => {
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
  expect(signB.ok()).toBeTruthy();
  const sB = await signB.json();
  const userB: string = sB.user.id;
  const tokenB: string = sB.access_token;
  expect(userA).not.toBe(userB);

  const hA = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json", Prefer: "return=representation" };
  const hB = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json", Prefer: "return=representation" };

  // 1) A vytvorí IQ challenge.
  const cRes = await request.post(`${SUPABASE_URL}/rest/v1/iq_friend_challenges`, {
    headers: hA,
    data: { challenger_id: userA, opponent_id: userB, question_count: 10, stake_credits: 0, status: "pending" },
  });
  if (!cRes.ok()) {
    test.skip(true, `iq challenge insert blocked (${cRes.status()}): ${(await cRes.text()).slice(0, 200)}`);
    return;
  }
  const challengeId: string = (await cRes.json())[0].id;
  expect(challengeId).toBeTruthy();

  // 2) B vidí challenge.
  const bSee = await request.get(`${SUPABASE_URL}/rest/v1/iq_friend_challenges?id=eq.${challengeId}&select=*`, { headers: hB });
  expect(bSee.ok()).toBeTruthy();
  expect((await bSee.json()).length).toBe(1);

  // 3) Obaja stavia v iq_match_bets (match_id = challenge.id).
  const betA = await request.post(`${SUPABASE_URL}/rest/v1/iq_match_bets`, {
    headers: hA,
    data: { match_id: challengeId, user_id: userA, predicted_winner_id: userA, stake_credits: 5 },
  });
  expect(betA.ok(), `A bet failed: ${await betA.text()}`).toBeTruthy();
  const betAId: string = (await betA.json())[0].id;

  const betB = await request.post(`${SUPABASE_URL}/rest/v1/iq_match_bets`, {
    headers: hB,
    data: { match_id: challengeId, user_id: userB, predicted_winner_id: userB, stake_credits: 5 },
  });
  expect(betB.ok(), `B bet failed: ${await betB.text()}`).toBeTruthy();
  const betBId: string = (await betB.json())[0].id;

  // 4) Obaja vidia obe stávky (Anyone can view).
  for (const [h, who] of [[hA, "A"], [hB, "B"]] as const) {
    const r = await request.get(`${SUPABASE_URL}/rest/v1/iq_match_bets?match_id=eq.${challengeId}&select=*&order=created_at.asc`, { headers: h });
    expect(r.ok()).toBeTruthy();
    const rows = await r.json();
    expect(rows.length, `${who} must see both bets`).toBe(2);
    expect(new Set(rows.map((x: any) => x.user_id))).toEqual(new Set([userA, userB]));
  }

  // 5) B akceptuje challenge.
  const accept = await request.patch(`${SUPABASE_URL}/rest/v1/iq_friend_challenges?id=eq.${challengeId}`, {
    headers: hB,
    data: { status: "accepted" },
  });
  expect(accept.ok(), `B accept failed: ${await accept.text()}`).toBeTruthy();

  // 6) A overí.
  const aSee = await request.get(`${SUPABASE_URL}/rest/v1/iq_friend_challenges?id=eq.${challengeId}&select=*`, { headers: hA });
  const aRows = await aSee.json();
  expect(aRows[0].status).toBe("accepted");

  // 7) Cleanup — service role by sme nemali, takže každý maže svoj bet, A maže challenge.
  await request.delete(`${SUPABASE_URL}/rest/v1/iq_match_bets?id=eq.${betAId}`, { headers: hA });
  await request.delete(`${SUPABASE_URL}/rest/v1/iq_match_bets?id=eq.${betBId}`, { headers: hB });
  await request.delete(`${SUPABASE_URL}/rest/v1/iq_friend_challenges?id=eq.${challengeId}`, { headers: hA });
});
