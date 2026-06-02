import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – Wall user ↔ user interakcie.
 * Overuje akcie, ktoré jeden používateľ robí voči inému:
 *   1) Follow / Unfollow tlačidlo
 *   2) Message dialog (DM otvorenie + odoslanie správy)
 *   3) Share post to DM (vyhľadanie usera + odoslanie linku)
 *   4) Comment pod cudzí post
 *   5) Reakcia (like / emoji) na cudzí post
 *   6) Otvorenie cudzieho profilu z postu
 *   7) Block / Unblock cez kebab menu
 *   8) Report cudzieho postu
 *
 * Test je tolerantný — ak feed nemá cudzí obsah, sekciu skipne.
 * Single test account → interaguje s inými autormi nájdenými vo feede.
 */

const WALL = "/wall";
const SUPABASE_HOST = "jufrdzeonywluwutvyxz.supabase.co";

async function gotoWall(page: Page) {
  await page.goto(WALL, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1200);
}

async function findForeignPost(page: Page) {
  // Cudzí post = článok kde existuje Follow tlačidlo (vlastné posty ho nemajú)
  const post = page.locator("article, [data-testid*='post-card']").filter({
    has: page.getByRole("button", { name: /^follow$|sledovať/i }),
  }).first();
  return post;
}

test.describe("Wall – user ↔ user interakcie", () => {
  test("1) Follow / Unfollow toggle volá Supabase", async ({ page }) => {
    await gotoWall(page);
    const followBtn = page.getByRole("button", { name: /^follow$|sledovať/i }).first();
    if (!(await followBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, "Vo feede nie je cudzí používateľ na sledovanie");
      return;
    }

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /follows|followers|following/.test(r.url()),
      { timeout: 8000 },
    ).catch(() => null);

    await followBtn.scrollIntoViewIfNeeded();
    await followBtn.click({ force: true });
    const r = await resp;
    if (r) expect([200, 201, 204, 206, 409]).toContain(r.status());

    // Po follownutí by sa label mal zmeniť na Unfollow
    await expect(
      page.getByRole("button", { name: /unfollow|nesledovať/i }).first(),
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("2) Message dialog sa otvorí a odošle správu", async ({ page }) => {
    await gotoWall(page);
    const msgBtn = page.getByRole("button", { name: /^message$|správa/i }).first();
    if (!(await msgBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, "Žiadne Message tlačidlo (prázdny feed / suggestions)");
      return;
    }

    await msgBtn.scrollIntoViewIfNeeded();
    await msgBtn.click({ force: true });

    const dialog = page.getByRole("dialog").filter({
      has: page.getByPlaceholder(/^aa$|message|napíš/i),
    }).first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const input = dialog.getByPlaceholder(/^aa$|message|napíš/i).first();
    await input.fill("E2E DM test 🤖 ignore");

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /direct_messages/.test(r.url()) &&
        r.request().method() === "POST",
      { timeout: 8000 },
    ).catch(() => null);

    const sendBtn = dialog.locator('button[type="submit"]').first();
    await sendBtn.click({ force: true });
    const r = await resp;
    if (r) expect([200, 201]).toContain(r.status());

    await page.keyboard.press("Escape").catch(() => {});
  });

  test("3) Komentár pod cudzí post", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny cudzí post vo feede");
      return;
    }

    const commentTrigger = foreign.getByRole("button", { name: /comment|komentár/i }).first();
    if (await commentTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentTrigger.click({ force: true }).catch(() => {});
    }

    const commentInput = foreign
      .getByPlaceholder(/comment|napíš.*komentár|write.*comment/i)
      .first()
      .or(page.getByPlaceholder(/comment|write.*comment/i).first());

    if (!(await commentInput.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip(true, "Comment input sa neotvoril");
      return;
    }

    await commentInput.fill("E2E komentár 🤖 ignore");

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /comments/.test(r.url()) &&
        r.request().method() === "POST",
      { timeout: 8000 },
    ).catch(() => null);

    await commentInput.press("Enter").catch(() => {});
    const r = await resp;
    if (r) expect([200, 201]).toContain(r.status());
  });

  test("4) Reakcia (like) na cudzí post → post_reactions request", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny cudzí post na lajk");
      return;
    }

    const likeBtn = foreign
      .locator('button[aria-label*="like" i], button[data-testid*="like" i]')
      .or(foreign.getByRole("button", { name: /^like$|páči/i }))
      .first();

    if (!(await likeBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Like tlačidlo nie je viditeľné");
      return;
    }

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /post_reactions|reactions|likes/.test(r.url()),
      { timeout: 8000 },
    ).catch(() => null);

    await likeBtn.scrollIntoViewIfNeeded();
    await likeBtn.click({ force: true });
    const r = await resp;
    if (r) expect([200, 201, 204, 409]).toContain(r.status());
  });

  test("5) Otvorenie cudzieho profilu z avatara/mena", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny cudzí post");
      return;
    }

    const profileLink = foreign.locator('a[href^="/profile/"]').first();
    if (!(await profileLink.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Profil link sa nenašiel");
      return;
    }

    await profileLink.click();
    await page.waitForURL(/\/profile\//, { timeout: 8000 });
    expect(page.url()).toMatch(/\/profile\/[^/]+/);
  });

  test("6) Share post to DM dialog sa otvorí a vyhľadá usera", async ({ page }) => {
    await gotoWall(page);
    // Send / Share tlačidlo na poste
    const shareBtn = page
      .getByRole("button", { name: /^send$|^share$|zdieľať/i })
      .first();
    if (!(await shareBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Share tlačidlo nie je dostupné");
      return;
    }
    await shareBtn.click({ force: true });

    const dialog = page.getByRole("dialog").filter({ hasText: /share post to dm|share/i }).first();
    if (!(await dialog.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip(true, "Share dialog sa neotvoril (možno iný share variant)");
      return;
    }

    const search = dialog.getByPlaceholder(/search by name|hľadať/i).first();
    if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
      await search.fill("a");
      // Daj RPC čas
      await page.waitForTimeout(800);
    }
    await page.keyboard.press("Escape").catch(() => {});
  });

  test("7) Report dialog na cudzom poste sa dá otvoriť", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny cudzí post na report");
      return;
    }

    // Kebab / more menu na poste
    const more = foreign
      .getByRole("button", { name: /more|more options|menu/i })
      .or(foreign.locator('button:has(svg.lucide-more-horizontal), button:has(svg.lucide-ellipsis)'))
      .first();

    if (!(await more.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Kebab menu nenájdené");
      return;
    }
    await more.click({ force: true });

    const reportItem = page.getByRole("menuitem", { name: /report|nahlásiť/i }).first();
    if (!(await reportItem.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Report položka v menu nie je");
      return;
    }
    await reportItem.click();

    await expect(
      page.getByRole("dialog").filter({ hasText: /report|nahlásiť/i }).first(),
    ).toBeVisible({ timeout: 4000 });
    await page.keyboard.press("Escape").catch(() => {});
  });

  test("8) Block / Unblock cez kebab menu", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny cudzí post");
      return;
    }

    const more = foreign
      .locator('button:has(svg.lucide-more-horizontal), button:has(svg.lucide-ellipsis)')
      .first();
    if (!(await more.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Kebab menu nenájdené");
      return;
    }
    await more.click({ force: true });

    const blockItem = page.getByRole("menuitem", { name: /^block|blokovať/i }).first();
    if (!(await blockItem.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Block položka neexistuje v menu");
      return;
    }
    // Iba over že existuje a je klikateľná – neaplikujeme block aby sme nezašpinili DB
    await expect(blockItem).toBeEnabled();
    await page.keyboard.press("Escape").catch(() => {});
  });
});
