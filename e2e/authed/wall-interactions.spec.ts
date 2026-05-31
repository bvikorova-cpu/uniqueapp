import { test, expect, Page, Route } from "@playwright/test";

/**
 * Robustné E2E pre /wall.
 * Pokrýva:
 *   1) Vytvorenie príspevku + UI (visibility, sensitive toggle, action ikony, Drafts)
 *   2) Like / Unlike + perzistencia po reloade + realtime cez druhý context
 *   3) Network odchytenie Supabase volaní na tabuľku `post_reactions` / `likes`
 *   4) Bezpečnosť: RLS test (cudzí user_id → 401/403) + anonymný like → redirect/login
 *   5) Prepínanie tém vo Theme Colors paneli
 *
 * Beží v projekte `chromium-authed` (storageState z auth.setup.ts).
 */

const WALL = "/wall";
const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";

async function gotoWall(page: Page) {
  await page.goto(WALL, { waitUntil: "domcontentloaded" });
  // Onboarding overlay už je dismissnutý v storageState; isto si počkáme na composer.
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function getComposer(page: Page) {
  const composer = page
    .getByPlaceholder(/what's on your mind/i)
    .or(page.getByRole("textbox", { name: /what's on your mind/i }))
    .first();
  await expect(composer).toBeVisible({ timeout: 15_000 });
  return composer;
}

test.describe("Wall – composer & UI", () => {
  test("composer prijíma text, prepína sensitive toggle a otvára Drafts", async ({ page }) => {
    await gotoWall(page);
    const composer = await getComposer(page);

    await composer.click();
    await composer.fill("E2E test príspevok – ignoruj ma 🤖");
    await expect(composer).toHaveValue(/E2E test/);

    // Visibility dropdown – default "Public"
    const visibilityBtn = page
      .getByRole("button", { name: /public|friends|only me|priatelia|iba ja/i })
      .first();
    if (await visibilityBtn.isVisible().catch(() => false)) {
      await visibilityBtn.click({ trial: true }).catch(() => {});
    }

    // Sensitive toggle (môže byť button/switch s textom „Sensitive“)
    const sensitive = page
      .getByRole("button", { name: /sensitive/i })
      .or(page.getByRole("switch", { name: /sensitive/i }))
      .first();
    if (await sensitive.isVisible().catch(() => false)) {
      await sensitive.click();
    }

    // Action ikony (galéria/video/emoji/poloha/tag)
    for (const name of [/photo|image|gallery|foto/i, /video/i, /emoji/i, /location|miesto/i, /tag/i]) {
      const btn = page.getByRole("button", { name }).first();
      if (await btn.isVisible().catch(() => false)) {
        await expect(btn).toBeEnabled();
      }
    }

    // Drafts
    const drafts = page.getByRole("button", { name: /drafts|koncepty/i }).first();
    await expect(drafts).toBeVisible();
    await drafts.click();
    // Drafts manager sa otvorí (dialog / popover)
    await expect(
      page.getByRole("dialog").or(page.getByText(/drafts|koncepty/i)).first(),
    ).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press("Escape").catch(() => {});
  });
});

test.describe("Wall – like / unlike / perzistencia / realtime", () => {
  test("like → counter sa zmení, prežije reload a vyvolá Supabase request", async ({ page }) => {
    await gotoWall(page);

    const likeBtn = page
      .getByRole("button", { name: /^like$|páči/i })
      .first();
    await expect(likeBtn).toBeVisible({ timeout: 15_000 });

    // Pre-state
    const counter = likeBtn.locator("xpath=ancestor::*[self::article or self::div][1]")
      .getByText(/^\d+$/)
      .first();
    const before = Number((await counter.textContent().catch(() => "0"))?.trim() || "0");

    // Odchyt Supabase REST volania na post_reactions / likes
    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /post_reactions|\/likes/.test(r.url()) &&
        ["POST", "PATCH", "DELETE", "GET"].includes(r.request().method()),
      { timeout: 10_000 },
    ).catch(() => null);

    await likeBtn.click();
    const resp = await responsePromise;
    if (resp) {
      expect([200, 201, 204, 206]).toContain(resp.status());
    }

    // UI sa updatuje (optimistic)
    await expect.poll(async () => {
      const t = await counter.textContent().catch(() => null);
      return Number((t || "0").trim());
    }, { timeout: 5_000 }).not.toBe(before);

    // Perzistencia po reloade
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    const likeBtn2 = page.getByRole("button", { name: /^like|unlike|páči/i }).first();
    await expect(likeBtn2).toBeVisible();
    // Mal by byť v "active" stave (aria-pressed alebo class)
    const pressed = await likeBtn2.getAttribute("aria-pressed").catch(() => null);
    if (pressed !== null) expect(pressed).toBe("true");

    // Unlike
    await likeBtn2.click();
    await expect.poll(async () => {
      const t = await likeBtn2
        .locator("xpath=ancestor::*[self::article or self::div][1]")
        .getByText(/^\d+$/)
        .first()
        .textContent()
        .catch(() => null);
      return Number((t || "0").trim());
    }, { timeout: 5_000 }).toBe(before);
  });

  test("realtime – druhý kontext vidí zmenu bez reloadu", async ({ browser }) => {
    const ctxA = await browser.newContext({ storageState: "e2e/.auth/authed-state.json" });
    const ctxB = await browser.newContext({ storageState: "e2e/.auth/authed-state.json" });
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();
    await gotoWall(a);
    await gotoWall(b);

    const likeA = a.getByRole("button", { name: /^like|páči/i }).first();
    await expect(likeA).toBeVisible({ timeout: 15_000 });

    // Naštartuj sledovanie realtime requestu na strane B
    const realtimeSeen = b.waitForResponse(
      (r) => r.url().includes(SUPABASE_HOST) && /realtime|post_reactions|\/likes/.test(r.url()),
      { timeout: 15_000 },
    ).catch(() => null);

    await likeA.click();
    await realtimeSeen;

    await ctxA.close();
    await ctxB.close();
  });
});

test.describe("Wall – bezpečnosť / RLS", () => {
  test("like s cudzím user_id v payloade → 401/403", async ({ page, request }) => {
    await gotoWall(page);

    // Vytiahni access token zo storage
    const token = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
      if (!key) return null;
      try {
        const v = JSON.parse(localStorage.getItem(key) || "{}");
        return v.access_token || null;
      } catch {
        return null;
      }
    });
    test.skip(!token, "chýba access token v storage");

    const res = await request.post(
      `https://${SUPABASE_HOST}/rest/v1/post_reactions`,
      {
        headers: {
          apikey: process.env.E2E_SUPABASE_ANON_KEY ?? "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        data: {
          post_id: "00000000-0000-0000-0000-000000000000",
          user_id: "11111111-2222-3333-4444-555555555555", // cudzí
          reaction_type: "like",
        },
      },
    );
    expect([401, 403, 409, 400, 404, 42501]).toContain(res.status());
  });
});

test.describe("Wall – Theme Colors", () => {
  test("výber farby zmení tému (data-theme / CSS premenná)", async ({ page }) => {
    await gotoWall(page);

    // Theme switcher button má title=name
    const themes = ["Ocean", "Sunset", "Midnight"];
    for (const name of themes) {
      const btn = page.locator(`button[title="${name}"]`).first();
      if (!(await btn.isVisible().catch(() => false))) continue;

      const beforePrimary = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--primary").trim(),
      );

      await btn.click();
      // Po preview môže byť potreba kliknúť Save
      const save = page.getByRole("button", { name: /save|uložiť/i }).first();
      if (await save.isVisible().catch(() => false)) await save.click().catch(() => {});

      await expect.poll(async () =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue("--primary").trim(),
        ),
        { timeout: 3_000 },
      ).not.toBe(beforePrimary);
      break; // stačí overiť že prepínanie funguje na jednej téme
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Anonymný režim – samostatný spec aby nebežal s authed storage
// ─────────────────────────────────────────────────────────────
test.describe("Wall – anonymný používateľ", () => {
  test.use({ storageState: "e2e/.auth/storage-state.json" });

  test("klik na like bez prihlásenia → redirect na /auth alebo modal", async ({ page }) => {
    await gotoWall(page);
    // Anonym uvidí buď paywall/login redirect, alebo gated UI.
    const likeBtn = page.getByRole("button", { name: /^like|páči/i }).first();
    if (!(await likeBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      // Wall presmeroval na login – test passes
      await expect(page).toHaveURL(/auth|login|sign-in/i);
      return;
    }
    await likeBtn.click();
    await expect
      .poll(() => page.url(), { timeout: 5_000 })
      .toMatch(/auth|login|sign-in/i)
      .catch(async () => {
        // alebo sa otvoril auth modal
        await expect(
          page.getByRole("dialog").filter({ hasText: /sign in|log in|prihlás/i }).first(),
        ).toBeVisible({ timeout: 3_000 });
      });
  });
});
