import { test, expect, type Page, type BrowserContext, type APIRequestContext } from "@playwright/test";

/**
 * E2E – Wall Friends accept & decline flow (two účty).
 *
 * Account A = primárny test account (z e2e/auth.setup.ts, beata.vikorova@yandex.com)
 * Account B = dedikovaný "e2e friend partner" account — vytvorený/obnovený
 *             cez edge funkciu `e2e-ensure-test-user` (service role).
 *
 * Pre každý test:
 *   1) Vyčistíme akékoľvek existujúce friendships medzi A a B (DELETE cez REST ako A).
 *   2) A pošle žiadosť B-čku (UI: /wall/friends → Find People → Add, alebo REST fallback).
 *   3) B otvorí /wall/friends, vykoná accept alebo decline cez UI.
 *   4) Overíme DB stav cez REST (ako A) aj UI stav v oboch kontextoch.
 */

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = "jufrdzeonywluwutvyxz";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const ACCOUNT_A_EMAIL = process.env.E2E_TEST_EMAIL ?? "beata.vikorova@yandex.com";
const ACCOUNT_A_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "BiankaDominik25";
const ACCOUNT_B_EMAIL = process.env.E2E_FRIEND_B_EMAIL ?? "e2e-friend-b@uniqueapp.fun";
const ACCOUNT_B_PASSWORD = process.env.E2E_FRIEND_B_PASSWORD ?? "FriendsTest2026!Aa";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: { id: string; email: string };
};

async function signIn(request: APIRequestContext, email: string, password: string): Promise<Session> {
  const res = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    data: { email, password },
  });
  expect(res.ok(), `sign-in failed for ${email}: ${res.status()} ${await res.text()}`).toBeTruthy();
  return (await res.json()) as Session;
}

async function ensureAccountB(request: APIRequestContext): Promise<void> {
  const res = await request.post(`${SUPABASE_URL}/functions/v1/e2e-ensure-test-user`, {
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    data: { email: ACCOUNT_B_EMAIL, password: ACCOUNT_B_PASSWORD },
  });
  expect(res.ok(), `ensure account B failed: ${res.status()} ${await res.text()}`).toBeTruthy();
}

function buildStorageState(session: Session, baseURL: string) {
  const onboardingPayload = JSON.stringify({ at: Date.now(), interests: [] });
  const localStorage = [
    {
      name: STORAGE_KEY,
      value: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user,
        provider_token: null,
        provider_refresh_token: null,
      }),
    },
    { name: "onboarding_completed", value: "true" },
    { name: "welcome_onboarding_v1", value: onboardingPayload },
    { name: `welcome_onboarding_v1_${session.user.id}`, value: onboardingPayload },
    { name: "unique_onboarding_v1", value: onboardingPayload },
    { name: `unique_onboarding_v1_${session.user.id}`, value: onboardingPayload },
    { name: `megatalent_onboarding_done_${session.user.id}`, value: "1" },
  ];
  const origin = new URL(baseURL).origin;
  return { cookies: [], origins: [{ origin, localStorage }] };
}

async function deleteFriendshipsBetween(
  request: APIRequestContext,
  token: string,
  userA: string,
  userB: string,
): Promise<void> {
  // RLS allows DELETE when auth.uid() IN (user_id, friend_id), so as A we can wipe both directions.
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
  const r1 = await request.delete(
    `${SUPABASE_URL}/rest/v1/friendships?user_id=eq.${userA}&friend_id=eq.${userB}`,
    { headers },
  );
  expect([200, 204]).toContain(r1.status());
  const r2 = await request.delete(
    `${SUPABASE_URL}/rest/v1/friendships?user_id=eq.${userB}&friend_id=eq.${userA}`,
    { headers },
  );
  expect([200, 204]).toContain(r2.status());
}

async function getFriendship(
  request: APIRequestContext,
  token: string,
  userA: string,
  userB: string,
): Promise<{ id: string; status: string; user_id: string; friend_id: string } | null> {
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  const res = await request.get(
    `${SUPABASE_URL}/rest/v1/friendships?or=(and(user_id.eq.${userA},friend_id.eq.${userB}),and(user_id.eq.${userB},friend_id.eq.${userA}))`,
    { headers },
  );
  expect(res.ok()).toBeTruthy();
  const rows = (await res.json()) as Array<{ id: string; status: string; user_id: string; friend_id: string }>;
  return rows[0] ?? null;
}

async function insertFriendRequest(
  request: APIRequestContext,
  token: string,
  fromUser: string,
  toUser: string,
): Promise<void> {
  const res = await request.post(`${SUPABASE_URL}/rest/v1/friendships`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    data: { user_id: fromUser, friend_id: toUser, status: "pending" },
  });
  expect([200, 201]).toContain(res.status());
}

async function gotoFriends(page: Page) {
  await page.goto("/wall/friends", { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(2500);
  // Dismiss welcome onboarding modal if present
  const close = page.locator('[role="dialog"] button[aria-label*="close" i]').first();
  if (await close.isVisible({ timeout: 1000 }).catch(() => false)) {
    await close.click().catch(() => {});
  }
}

let sessionA: Session;
let sessionB: Session;
let userAId: string;
let userBId: string;

test.describe.configure({ mode: "serial" });

test.describe("Wall Friends – accept & decline (two účty)", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAccountB(request);
    sessionA = await signIn(request, ACCOUNT_A_EMAIL, ACCOUNT_A_PASSWORD);
    sessionB = await signIn(request, ACCOUNT_B_EMAIL, ACCOUNT_B_PASSWORD);
    userAId = sessionA.user.id;
    userBId = sessionB.user.id;

    // Make sure B has a minimal profile row so it shows up in search/UI.
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${sessionB.access_token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    };
    await request.post(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers,
      data: { id: userBId, full_name: "E2E Friend B" },
    });
  });

  test.beforeEach(async ({ request }) => {
    await deleteFriendshipsBetween(request, sessionA.access_token, userAId, userBId);
  });

  test.afterAll(async ({ request }) => {
    if (sessionA) await deleteFriendshipsBetween(request, sessionA.access_token, userAId, userBId);
  });

  test("accept – B prijme žiadosť → DB status=accepted, UI A vidí priateľa", async ({ browser, request, baseURL }) => {
    const base = baseURL ?? "http://localhost:8080";
    const ctxA = await browser.newContext({ storageState: buildStorageState(sessionA, base) });
    const ctxB = await browser.newContext({ storageState: buildStorageState(sessionB, base) });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      // A posiela žiadosť priamo cez REST (UI flow už pokryl predošlý smoke test)
      await insertFriendRequest(request, sessionA.access_token, userAId, userBId);

      // DB sanity
      const before = await getFriendship(request, sessionA.access_token, userAId, userBId);
      expect(before?.status).toBe("pending");

      // B otvorí Friends a v sekcii "Friend Requests" klikne na "Confirm"
      await gotoFriends(pageB);

      const requestsSection = pageB
        .locator("section")
        .filter({ has: pageB.getByRole("heading", { name: /friend requests/i }) })
        .first();
      const acceptBtn = requestsSection.getByRole("button", { name: /confirm/i }).first();

      await expect(acceptBtn).toBeVisible({ timeout: 15_000 });

      const patchResp = pageB
        .waitForResponse(
          (r) =>
            r.url().includes(`${SUPABASE_URL}/rest/v1/friendships`) &&
            r.request().method() === "PATCH",
          { timeout: 10_000 },
        )
        .catch(() => null);

      await acceptBtn.click();
      const resp = await patchResp;
      expect(resp, "PATCH friendships request must fire").not.toBeNull();
      expect([200, 204]).toContain(resp!.status());

      // DB overenie
      await expect
        .poll(
          async () => (await getFriendship(request, sessionA.access_token, userAId, userBId))?.status,
          { timeout: 10_000, intervals: [500, 1000] },
        )
        .toBe("accepted");

      // UI A: refreshne sa, mal by vidieť B v "All Friends" sekcii
      await gotoFriends(pageA);
      await pageA.waitForTimeout(1500);
      const friendsCount = pageA.locator("section").filter({ hasText: /all friends/i });
      await expect(friendsCount.getByText(/e2e friend b/i).first()).toBeVisible({ timeout: 10_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("decline – B odmietne žiadosť → DB riadok zmazaný, UI A bez priateľa", async ({ browser, request, baseURL }) => {
    const base = baseURL ?? "http://localhost:8080";
    const ctxA = await browser.newContext({ storageState: buildStorageState(sessionA, base) });
    const ctxB = await browser.newContext({ storageState: buildStorageState(sessionB, base) });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await insertFriendRequest(request, sessionA.access_token, userAId, userBId);
      expect((await getFriendship(request, sessionA.access_token, userAId, userBId))?.status).toBe("pending");

      await gotoFriends(pageB);

      const requestsSection = pageB
        .locator("section")
        .filter({ has: pageB.getByRole("heading", { name: /friend requests/i }) })
        .first();
      const declineBtn = requestsSection.getByRole("button", { name: /remove/i }).first();
      await expect(declineBtn).toBeVisible({ timeout: 15_000 });

      const delResp = pageB
        .waitForResponse(
          (r) =>
            r.url().includes(`${SUPABASE_URL}/rest/v1/friendships`) &&
            r.request().method() === "DELETE",
          { timeout: 10_000 },
        )
        .catch(() => null);

      await declineBtn.click();
      const resp = await delResp;
      expect(resp, "DELETE friendships request must fire").not.toBeNull();
      expect([200, 204]).toContain(resp!.status());

      // DB – row zmazaný
      await expect
        .poll(
          async () => await getFriendship(request, sessionA.access_token, userAId, userBId),
          { timeout: 10_000, intervals: [500, 1000] },
        )
        .toBeNull();

      // UI A – nemá B v priateľoch
      await gotoFriends(pageA);
      await pageA.waitForTimeout(1500);
      const friendsSection = pageA.locator("section").filter({ hasText: /all friends/i });
      await expect(friendsSection.getByText(/e2e friend b/i)).toHaveCount(0);
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
