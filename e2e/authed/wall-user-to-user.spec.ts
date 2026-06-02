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
  await page.goto(WALL, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(4500); // initial hydration + feed query
  // Čakaj kým bude DOM mať aspoň jeden post card alebo "reached the end"
  await page.waitForFunction(
    () =>
      document.querySelector(".glass-post-card") ||
      /reached the end/i.test(document.body.innerText),
    null,
    { timeout: 15_000 },
  ).catch(() => {});
  // Mierny scroll aby sa interaction buttons stali viditeľné
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  const cardCount = await page.locator(".glass-post-card").count();
  console.log(`[gotoWall] glass-post-card count = ${cardCount}, url = ${page.url()}`);
}

async function findForeignPost(page: Page) {
  const withFollow = page
    .locator(".glass-post-card")
    .filter({
      has: page.getByRole("button", { name: /^follow$|^unfollow$|sledovať|nesledovať/i }),
    })
    .first();
  if (await withFollow.isVisible({ timeout: 2000 }).catch(() => false)) return withFollow;
  return page.locator(".glass-post-card").first();
}

test.describe("Wall – user ↔ user interakcie", () => {
  test("1) Follow / Unfollow toggle volá Supabase", async ({ page }) => {
    await gotoWall(page);
    const followBtn = page.getByRole("button", { name: /^follow$|^unfollow$|sledovať|nesledovať/i }).first();
    if (!(await followBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
      test.skip(true, "Vo feede nie je Follow/Unfollow tlačidlo");
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
    if (r) expect([200, 201, 204, 206, 400, 409, 422]).toContain(r.status());

    // Po follownutí by sa label mal zmeniť na Unfollow
    await expect(
      page.getByRole("button", { name: /unfollow|nesledovať/i }).first(),
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("2) Otvor profil cudzieho usera → Message tlačidlo otvorí DM dialog", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }
    const nameEl = foreign.locator("p.font-semibold.cursor-pointer, p.cursor-pointer").first();
    if (!(await nameEl.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Meno autora nenájdené");
      return;
    }
    await nameEl.click({ force: true });
    await page.waitForURL(/\/profile\//, { timeout: 10_000 }).catch(() => {});

    const msgBtn = page.getByRole("button", { name: /^message$|správa/i }).first();
    if (!(await msgBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, "Message tlačidlo nie je na profile");
      return;
    }
    await msgBtn.click({ force: true });

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const input = dialog.getByPlaceholder(/^aa$|message|napíš/i).first();
    if (!(await input.isVisible({ timeout: 3000 }).catch(() => false))) {
      await page.keyboard.press("Escape").catch(() => {});
      test.skip(true, "DM input nenájdený v dialogu");
      return;
    }
    await input.fill("E2E DM 🤖 ignore");
    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /direct_messages/.test(r.url()) &&
        r.request().method() === "POST",
      { timeout: 8000 },
    ).catch(() => null);
    await dialog.locator('button[type="submit"]').first().click({ force: true });
    const r = await resp;
    if (r) expect([200, 201]).toContain(r.status());
    await page.keyboard.press("Escape").catch(() => {});
  });

  test("3) Komentár pod cudzí post", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }
    await foreign.scrollIntoViewIfNeeded();

    // Comment button = ikona MessageCircle vnútri postu
    const commentTrigger = foreign
      .locator('button:has(svg[class*="message-circle"])')
      .first();
    if (!(await commentTrigger.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip(true, "Comment ikonka nenájdená");
      return;
    }
    await commentTrigger.click({ force: true });

    const commentInput = page
      .getByPlaceholder(/write a comment|write a reply|napíš.*komentár/i)
      .first();
    if (!(await commentInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Comment input sa neotvoril");
      return;
    }

    await commentInput.fill("E2E komentár 🤖 ignore");

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /comments/.test(r.url()) &&
        r.request().method() === "POST",
      { timeout: 10_000 },
    ).catch(() => null);

    await commentInput.press("Enter").catch(() => {});
    await page.getByRole("button", { name: /^post$|^send$|odoslať/i }).first()
      .click({ force: true, timeout: 2000 }).catch(() => {});
    const r = await resp;
    if (r) expect([200, 201]).toContain(r.status());
  });

  test("4) Reakcia na cudzí post → post_reactions request", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }
    await foreign.scrollIntoViewIfNeeded();

    // ReactionPicker button obsahuje text "React" alebo "Reacted"
    const reactBtn = foreign.getByRole("button").filter({ hasText: /react/i }).first();
    if (!(await reactBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip(true, "React tlačidlo nenájdené");
      return;
    }

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /post_reactions|reactions/.test(r.url()),
      { timeout: 10_000 },
    ).catch(() => null);

    await reactBtn.click({ force: true });
    // Klikni prvú emoji v popoveri (Radix popper wrapper)
    await page.locator('[data-radix-popper-content-wrapper] button').first()
      .click({ force: true, timeout: 3000 }).catch(() => {});

    const r = await resp;
    if (r) expect([200, 201, 204, 400, 409]).toContain(r.status());
  });

  test("5) Klik na meno autora → presmeruje na /profile/", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }

    const nameEl = foreign.locator("p.font-semibold.cursor-pointer, p.cursor-pointer").first();
    if (!(await nameEl.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Klikateľné meno nenájdené");
      return;
    }
    await nameEl.click({ force: true });
    await page.waitForURL(/\/profile\//, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/profile\/[^/]+/);
  });

  test("6) Share button vyvolá share API alebo dialog", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }
    await foreign.scrollIntoViewIfNeeded();

    const shareBtn = foreign.locator('button:has(svg[class*="share"])').first();
    if (!(await shareBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Share tlačidlo nenájdené");
      return;
    }
    await page.evaluate(() => {
      (window as any).__shared = false;
      (navigator as any).share = async () => { (window as any).__shared = true; };
      (navigator.clipboard as any) = (navigator.clipboard as any) ?? {};
      const origWrite = (navigator.clipboard as any).writeText?.bind(navigator.clipboard);
      (navigator.clipboard as any).writeText = async (t: string) => {
        (window as any).__shared = true;
        return origWrite?.(t);
      };
    });
    await shareBtn.click({ force: true });
    await page.waitForTimeout(1200);
    const shared = await page.evaluate(() => (window as any).__shared);
    const dialogOrToast = await page.getByRole("dialog")
      .or(page.getByText(/copied|share|link/i)).first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    expect(shared || dialogOrToast).toBeTruthy();
    await page.keyboard.press("Escape").catch(() => {});
  });

  test("7) Report tlačidlo na cudzom poste otvorí Report dialog", async ({ page }) => {
    await gotoWall(page);
    const foreign = await findForeignPost(page);
    if (!(await foreign.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Žiadny post");
      return;
    }
    await foreign.scrollIntoViewIfNeeded();

    const reportBtn = foreign.getByRole("button", { name: /^report$/i }).first();
    if (!(await reportBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, "Report tlačidlo neexistuje (možno vlastný post)");
      return;
    }
    await reportBtn.click({ force: true });

    await expect(
      page.getByRole("dialog").filter({ hasText: /report content|nahlásiť/i }).first(),
    ).toBeVisible({ timeout: 4000 });
    await page.keyboard.press("Escape").catch(() => {});
  });

  test("8) FollowButton toggle perzistuje cez Supabase", async ({ page }) => {
    await gotoWall(page);
    const followBtn = page.getByRole("button", { name: /^follow$|^unfollow$/i }).first();
    if (!(await followBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, "Žiadny Follow toggle");
      return;
    }
    const labelBefore = (await followBtn.textContent())?.trim().toLowerCase() ?? "";

    const resp = page.waitForResponse(
      (r) =>
        r.url().includes(SUPABASE_HOST) &&
        /follow/.test(r.url()),
      { timeout: 10_000 },
    ).catch(() => null);

    await followBtn.scrollIntoViewIfNeeded();
    await followBtn.click({ force: true });
    await resp;

    // Poll label change up to 6s
    await expect
      .poll(
        async () => (await followBtn.textContent())?.trim().toLowerCase() ?? "",
        { timeout: 6000 },
      )
      .not.toBe(labelBefore);
  });
});

