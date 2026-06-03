import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * E2E – Like & Bookmark s reálnym seedovaným postom.
 *
 * Pred testami vloží jeden post pre prihláseného test účet priamo cez Supabase REST
 * (pomocou access_tokenu zo storageState). Po testoch ho zmaže.
 * Vďaka tomu Like/Bookmark testy NIKDY nepadnú do skip-režimu kvôli prázdnemu feedu.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const STORAGE_PATH = "e2e/.auth/authed-state.json";

interface SeededSession {
  accessToken: string;
  userId: string;
}

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
  throw new Error("No sb-*-auth-token found in storageState — run setup project first");
}

async function seedPost(
  request: APIRequestContext,
  session: SeededSession,
  content: string,
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
  expect(res.ok(), `Seed post failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const rows = (await res.json()) as { id: string }[];
  return rows[0].id;
}

async function deletePost(
  request: APIRequestContext,
  session: SeededSession,
  postId: string,
) {
  await request
    .delete(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    .catch(() => {});
}

async function gotoWallAndScroll(page: Page, postId: string) {
  await page.goto("/wall", { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(2500); // realtime websocket – nepoužívame networkidle

  // Posun po stránke aby sa seedovaný post načítal v infinite feedu
  for (let i = 0; i < 6; i++) {
    const found = await page
      .locator(`[data-post-id="${postId}"], article:has-text("E2E SEED")`)
      .first()
      .isVisible({ timeout: 1500 })
      .catch(() => false);
    if (found) break;
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(600);
  }
}

test.describe.serial("Wall – Like & Bookmark so seedovaným postom", () => {
  let session: SeededSession;
  let postId: string;
  const content = `E2E SEED ${Date.now()} 🧪 ignore`;

  test.beforeAll(async ({ request }) => {
    session = readSession();
    postId = await seedPost(request, session, content);
    test.info().annotations.push({ type: "seeded-post", description: postId });
  });

  test.afterAll(async ({ request }) => {
    if (postId) await deletePost(request, session, postId);
  });

  test("Like na seedovanom poste vyvolá Supabase request", async ({ page }) => {
    await gotoWallAndScroll(page, postId);

    // Skús nájsť like button v rámci článku obsahujúceho seed text alebo data-post-id
    const postScope = page
      .locator(`[data-post-id="${postId}"]`)
      .or(page.locator("article").filter({ hasText: "E2E SEED" }))
      .first();

    const visible = await postScope.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible, "Seedovaný post musí byť viditeľný vo feede").toBeTruthy();

    const likeBtn = postScope
      .locator(
        'button[aria-label*="like" i], button[data-testid*="like" i], button:has(svg.lucide-heart)',
      )
      .first();
    await expect(likeBtn).toBeVisible({ timeout: 5000 });

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
  });

  test("Bookmark na seedovanom poste – button viditeľný a klik nezhodí app", async ({ page }) => {
    await gotoWallAndScroll(page, postId);

    const postScope = page
      .locator(`[data-post-id="${postId}"]`)
      .or(page.locator("article").filter({ hasText: "E2E SEED" }))
      .first();
    await expect(postScope).toBeVisible({ timeout: 5000 });

    // Bookmark môže byť priamo na karte alebo v "more" menu
    let bookmark = postScope
      .locator(
        'button[aria-label*="bookmark" i], button[aria-label*="save" i], button:has(svg.lucide-bookmark)',
      )
      .first();

    if (!(await bookmark.isVisible({ timeout: 3000 }).catch(() => false))) {
      // Pokús sa otvoriť overflow menu (3-dot)
      const more = postScope
        .locator('button[aria-label*="more" i], button:has(svg.lucide-more-horizontal), button:has(svg.lucide-more-vertical)')
        .first();
      if (await more.isVisible({ timeout: 2000 }).catch(() => false)) {
        await more.click({ force: true });
        await page.waitForTimeout(400);
        bookmark = page
          .getByRole("menuitem", { name: /bookmark|save|uložiť/i })
          .first();
      }
    }

    await expect(bookmark, "Bookmark/Save akcia musí existovať na poste").toBeVisible({
      timeout: 5000,
    });

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await bookmark.click({ force: true });
    await page.waitForTimeout(800);
    expect(errors, `Bookmark klik vyhodil pageerror: ${errors.join("; ")}`).toHaveLength(0);
  });
});
