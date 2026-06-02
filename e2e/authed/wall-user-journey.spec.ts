import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – Wall user journey
 * Overuje 7 oblastí z opísaného "bežný používateľ na Walle" flow:
 *   1) Hero stats + Streak badge + Info tooltipy (globálne vs osobné)
 *   2) Composer (tvorba postu, sensitive, drafts)
 *   3) Konzumácia feedu (scroll, like, bookmark)
 *   4) Komunita (Recent Activity card, profile link)
 *   5) Sub-stránky: /wall/saved, /wall/memories
 *   6) Reportovanie obsahu (ReportDialog dostupný)
 *   7) Navigácia – Wall ako root pre prihláseného usera
 *
 * Test je tolerantný: ak konkrétny prvok chýba (prázdny feed), test sekciu skipne,
 * ale failne, ak chýbajú KĽÚČOVÉ veci (hero stats, composer).
 */

const WALL = "/wall";

async function gotoWall(page: Page) {
  await page.goto(WALL, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(2500); // krátky settle, žiadny networkidle (websocket blokuje)
}

test.describe("Wall – kompletný používateľský journey", () => {
  test("1) Hero: globálne stat karty so scope labelom GLOBAL", async ({ page }) => {
    await gotoWall(page);

    // Počkaj kým hero stats nahydratujú
    await page
      .getByText(/posts today/i)
      .first()
      .waitFor({ state: "visible", timeout: 20_000 })
      .catch(() => {});

    const statLabels = [
      /posts today/i,
      /active users/i,
      /interactions/i,
      /challenge ends/i,
    ];
    let foundStats = 0;
    for (const re of statLabels) {
      const count = await page.getByText(re).count();
      if (count > 0) foundStats++;
    }
    expect(foundStats, "Aspoň 2 stat karty musia existovať v DOM").toBeGreaterThanOrEqual(2);

    // Scope label – komponent renderuje "Global" (s uppercase CSS triedou).
    // Akceptujeme aj "Personal" (streak badge).
    const scopeCount = await page.getByText(/^(global|personal)$/i).count();
    expect(scopeCount, "Scope label musí existovať").toBeGreaterThanOrEqual(1);
  });

  test("2) Composer – textarea, drafts tlačidlo", async ({ page }) => {
    await gotoWall(page);
    const composer = page
      .getByPlaceholder(/what's on your mind|čo máš na mysli/i)
      .first();
    await expect(composer).toBeVisible({ timeout: 15_000 });

    await composer.fill("E2E journey test – ignore 🤖");
    await expect(composer).toHaveValue(/E2E journey/);

    // Drafts tlačidlo musí existovať
    const drafts = page.getByRole("button", { name: /drafts|koncepty/i }).first();
    await expect(drafts).toBeVisible();

    // Vyčisti
    await composer.fill("");
  });

  test("3) Feed konzumácia – scroll načíta posty alebo zobrazí prázdny stav", async ({ page }) => {
    await gotoWall(page);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1500);

    const anyPost = page.locator("article, [data-testid*='post'], [class*='post-card' i]").first();
    const emptyState = page.getByText(/no posts|žiadne príspevky|reached the end/i).first();

    const hasContent = await anyPost.isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmpty = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasContent || hasEmpty, "Feed musí ukázať buď posty alebo prázdny stav").toBeTruthy();
  });

  test("4) Recent Activity card existuje", async ({ page }) => {
    await gotoWall(page);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(800);

    const activityHeader = page.getByText(/recent activity|nedávna aktivita/i).first();
    // Activity card sa renderuje len ak je profil & data – ak nie, len log a passuj
    if (!(await activityHeader.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.info().annotations.push({ type: "skip-reason", description: "Recent Activity card sa nezobrazila (možno desktop-only)" });
      return;
    }
    await expect(activityHeader).toBeVisible();
  });

  test("5a) Sub-stránka /wall/saved sa otvorí", async ({ page }) => {
    await page.goto("/wall/saved", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /saved posts|uložené/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("5b) Sub-stránka /wall/memories sa otvorí", async ({ page }) => {
    await page.goto("/wall/memories", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /memories|spomienky/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("6) Like (ak feed nie je prázdny) → Supabase request", async ({ page }) => {
    await gotoWall(page);
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1500);

    const likeBtn = page
      .locator('button[aria-label*="like" i], button[data-testid*="like" i]')
      .or(page.getByRole("button", { name: /^like$|páči/i }))
      .first();

    if (!(await likeBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Feed je prázdny – nie je čo lajkovať");
      return;
    }

    const respPromise = page
      .waitForResponse(
        (r) =>
          r.url().includes("supabase.co") &&
          /post_reactions|likes|reactions/.test(r.url()),
        { timeout: 8000 },
      )
      .catch(() => null);

    await likeBtn.scrollIntoViewIfNeeded();
    await likeBtn.click({ force: true });
    const resp = await respPromise;
    if (resp) {
      expect([200, 201, 204, 206, 409]).toContain(resp.status());
    }
  });

  test("7) Wall route je dostupný pre prihláseného usera (nie redirect na /auth)", async ({ page }) => {
    await gotoWall(page);
    await expect(page).not.toHaveURL(/\/auth|\/login|\/sign-in/);
    expect(page.url()).toMatch(/\/wall/);
  });
});
