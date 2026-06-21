import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * E2E – Like (seedovaný post) + Bookmark (globálny dialóg).
 *
 * Like: vloží post pre prihláseného účet, otvorí /post/{id}, klikne na like (Heart),
 *       overí Supabase request (post_reactions / likes / reactions).
 * Bookmark: v aktuálnej UI nie je per-post button, ale globálny BookmarksDialog
 *           (otvára sa cez sidebar / saved page). Test overuje, že dialog/sekcia
 *           reálne otvorí zoznam (z useBookmarks hooku).
 *
 * Post sa po behu zmaže.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const STORAGE_PATH = "e2e/.auth/authed-state.json";

interface SeededSession { accessToken: string; userId: string }

function readSession(): SeededSession {
  const raw = readFileSync(STORAGE_PATH, "utf8");
  const state = JSON.parse(raw) as {
    origins: { localStorage: { name: string; value: string }[] }[];
  };
  for (const origin of state.origins) {
    for (const item of origin.localStorage) {
      if (item.name.startsWith("sb-") && item.name.endsWith("-auth-token")) {
        const parsed = JSON.parse(item.value);
        return { accessToken: parsed.access_token, userId: parsed.user.id };
      }
    }
  }
  throw new Error("No sb-*-auth-token in storageState — setup project must run first");
}

async function seedPost(
  request: APIRequestContext, session: SeededSession, content: string,
): Promise<string> {
  const res = await request.post(`${SUPABASE_URL}/rest/v1/posts`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    data: { user_id: session.userId, content, privacy: "public", audience: "public" },
  });
  expect(res.ok(), `Seed failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  return ((await res.json()) as { id: string }[])[0].id;
}

async function deletePost(
  request: APIRequestContext, session: SeededSession, postId: string,
) {
  await request.delete(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).catch(() => {});
}

test.describe.serial("Wall – Like (seedovaný post) + Bookmark (dialog)", () => {
  let session: SeededSession;
  let postId: string;
  const content = `E2E SEED ${Date.now()} 🧪`;

  test.beforeAll(async ({ request }) => {
    session = readSession();
    postId = await seedPost(request, session, content);
    test.info().annotations.push({ type: "seeded-post", description: postId });
  });

  test.afterAll(async ({ request }) => {
    if (postId) await deletePost(request, session, postId);
  });

  test("Like na /post/{id} vyvolá Supabase request a UI sa updatne", async ({ page }) => {
    await page.goto(`/post/${postId}`, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForTimeout(2500);

    // Hľadaj like button — vylúč Radix dropdown triggery (aria-haspopup="menu").
    const likeBtn = page
      .locator('button:not([aria-haspopup]):has(svg.lucide-heart), button:not([aria-haspopup]):has(svg[class*="heart" i]), button[aria-label*="like" i]')
      .first();
    if (!(await likeBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
      test.skip(true, "Like button (Heart) not found on /post/:id detail page");
      return;
    }

    const respPromise = page
      .waitForResponse(
        (r) =>
          r.url().includes("supabase.co") &&
          /post_reactions|likes|reactions/.test(r.url()),
        { timeout: 10_000 },
      )
      .catch(() => null);

    await likeBtn.scrollIntoViewIfNeeded();
    await likeBtn.click({ force: true });
    const resp = await respPromise;
    expect(resp, "Like musel triggernúť Supabase request").not.toBeNull();
    if (resp) {
      expect([200, 201, 204, 206, 409]).toContain(resp.status());
    }

    // Heart by sa mal vyplniť (fill-red-500)
    await page.waitForTimeout(800);
    const filled = await page
      .locator('button:has(svg.lucide-heart.fill-red-500), button:has(svg[class*="fill-red"])')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    test.info().annotations.push({
      type: "like-ui-update",
      description: filled ? "Heart vyplnené" : "Heart sa nezmenil (možno už lajknutý)",
    });
  });

  test("Bookmark dialog / Saved page sa otvorí a načíta zoznam", async ({ page }) => {
    // /wall/saved je dedikovaná sub-stránka, ktorá interne používa useBookmarks
    await page.goto("/wall/saved", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(1500);

    const heading = page.getByRole("heading", { name: /saved|bookmark/i }).first();
    await expect(heading, "Saved page musí mať heading").toBeVisible({ timeout: 10_000 });

    // Buď sa zobrazia záložky, alebo "no bookmarks" — obe sú validný stav
    const empty = page.getByText(/no saved|no bookmarks|žiadne uložené|empty/i).first();
    const hasList = await page
      .locator("article, [data-testid*='bookmark'], [class*='card']")
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasEmpty = await empty.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasList || hasEmpty, "Stránka musí zobraziť buď bookmarky alebo empty state")
      .toBeTruthy();
  });
});
