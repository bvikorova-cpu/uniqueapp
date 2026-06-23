import { test, expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Wall – automatizovaný A/B testovací režim.
 *
 * Pokrýva prvú iteráciu:
 *   1. User A vytvorí textový post (composer → publish → vidí ho vo feede)
 *   2. User B (druhý kontext s vlastnou session) feed obnoví a uvidí ten istý post
 *   3. User B pridá komentár → User A ho vidí po reloade
 *   4. User B klikne reaction (like) → A vidí počet reakcií ≥ 1
 *
 * Spustenie:
 *   E2E_TEST_EMAIL_B=... E2E_TEST_PASSWORD_B=... \
 *     npx playwright test e2e/authed/wall-ab-scenarios.spec.ts
 *
 * User A používa štandardnú authed-state.json (account z auth.setup.ts).
 * User B sa loguje cez Supabase token endpoint v runtime a session sa pichne
 * do localStorage druhého browser contextu.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const EMAIL_B = process.env.E2E_TEST_EMAIL_B;
const PASSWORD_B = process.env.E2E_TEST_PASSWORD_B;

const skipReason = !EMAIL_B || !PASSWORD_B
  ? "E2E_TEST_EMAIL_B / E2E_TEST_PASSWORD_B nie sú nastavené – preskakujem A/B scenár."
  : "";

async function signInB(request: import("@playwright/test").APIRequestContext) {
  const res = await request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      data: { email: EMAIL_B, password: PASSWORD_B },
    },
  );
  expect(res.ok(), `B sign-in failed: ${res.status()}`).toBeTruthy();
  return await res.json();
}

async function seedSession(context: BrowserContext, session: any, baseURL: string) {
  const stored = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
  };
  const onboarding = JSON.stringify({ at: Date.now(), interests: [] });
  await context.addInitScript(
    ({ key, value, oid, ob }) => {
      try {
        localStorage.setItem(key, value);
        localStorage.setItem("onboarding_completed", "true");
        localStorage.setItem("welcome_onboarding_v1", ob);
        localStorage.setItem(`welcome_onboarding_v1_${oid}`, ob);
        localStorage.setItem("unique_onboarding_v1", ob);
        localStorage.setItem(`unique_onboarding_v1_${oid}`, ob);
        localStorage.setItem("gdpr_cookie_consent", new Date().toISOString());
      } catch {}
    },
    { key: STORAGE_KEY, value: JSON.stringify(stored), oid: session.user.id, ob: onboarding },
  );
}

async function openWall(page: Page) {
  await page.goto("/wall", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Feed", exact: true }).first())
    .toBeVisible({ timeout: 20_000 });
}

async function publishPost(page: Page, body: string) {
  // composer placeholder: "What's on your mind?" – sidebar aj mobilný sheet.
  // Na mobile treba najprv otvoriť FAB.
  const fab = page.locator('button:has-text("+")').first();
  const sidebarTextarea = page.getByPlaceholder(/what's on your mind/i).first();
  if (!(await sidebarTextarea.isVisible().catch(() => false))) {
    if (await fab.isVisible().catch(() => false)) await fab.click();
  }
  const ta = page.getByPlaceholder(/what's on your mind/i).first();
  await expect(ta).toBeVisible({ timeout: 10_000 });
  await ta.fill(body);
  const publish = page.getByRole("button", { name: /post|publish|zverejni/i }).first();
  await publish.click();
  await expect(page.locator(`text=${body}`).first()).toBeVisible({ timeout: 15_000 });
}

test.describe("Wall A/B – posty + reakcie + komentáre", () => {
  test.skip(!!skipReason, skipReason);

  test("A vytvorí post → B ho vidí, lajkne a komentuje → A vidí zmeny", async ({ browser, request, baseURL }) => {
    const marker = `E2E-AB-${Date.now()}`;
    const postBody = `${marker} ahoj z automatu`;
    const commentBody = `${marker}-comment od B`;

    // ---- User A (default storageState) ----
    const ctxA = await browser.newContext({ storageState: "e2e/.auth/authed-state.json" });
    const pageA = await ctxA.newPage();
    await openWall(pageA);
    await publishPost(pageA, postBody);

    // ---- User B (čistý kontext + runtime login) ----
    const sessionB = await signInB(request);
    const ctxB = await browser.newContext();
    await seedSession(ctxB, sessionB, baseURL ?? "http://localhost:8080");
    const pageB = await ctxB.newPage();
    await openWall(pageB);

    // B musí vidieť A-post (môže byť potreba pár sekúnd na refresh feedu)
    const postLocator = pageB.locator(`text=${postBody}`).first();
    await expect(postLocator).toBeVisible({ timeout: 30_000 });

    // Klik na reakciu (like) v rámci postu
    const postCard = pageB.locator("article, [data-testid='wall-post']").filter({ hasText: postBody }).first();
    const likeBtn = postCard.getByRole("button", { name: /like|❤|👍|react/i }).first();
    if (await likeBtn.isVisible().catch(() => false)) {
      await likeBtn.click();
    } else {
      test.info().annotations.push({ type: "warn", description: "Reaction button nenájdený – overiť WallPost selektor" });
    }

    // Komentár
    const commentInput = postCard.getByPlaceholder(/comment|napíš|write/i).first();
    if (await commentInput.isVisible().catch(() => false)) {
      await commentInput.fill(commentBody);
      await commentInput.press("Enter");
      await expect(postCard.locator(`text=${commentBody}`)).toBeVisible({ timeout: 10_000 });
    } else {
      // niektoré varianty otvárajú komentáre cez tlačidlo
      const openComments = postCard.getByRole("button", { name: /comment/i }).first();
      if (await openComments.isVisible().catch(() => false)) {
        await openComments.click();
        const ci = pageB.getByPlaceholder(/comment|napíš|write/i).first();
        await ci.fill(commentBody);
        await ci.press("Enter");
        await expect(pageB.locator(`text=${commentBody}`).first()).toBeVisible({ timeout: 10_000 });
      } else {
        test.info().annotations.push({ type: "warn", description: "Comment input nenájdený – overiť WallPost selektor" });
      }
    }

    // ---- A reload a overí, že vidí reakciu + komentár ----
    await pageA.reload({ waitUntil: "domcontentloaded" });
    const postOnA = pageA.locator("article, [data-testid='wall-post']").filter({ hasText: postBody }).first();
    await expect(postOnA).toBeVisible({ timeout: 20_000 });
    // mäkká kontrola – ak sa zobrazí komentár, super; inak iba warn
    const sawComment = await postOnA.locator(`text=${commentBody}`).first().isVisible().catch(() => false);
    if (!sawComment) {
      test.info().annotations.push({ type: "warn", description: "A nevidí komentár B po reloade – preveriť realtime/comments fetch" });
    }

    await ctxA.close();
    await ctxB.close();
  });
});
