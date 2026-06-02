import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – komplexný test VŠETKÝCH tlačidiel vo WallTopNav.
 *
 * Pokrýva:
 *   - 3 hlavné nav itemy (Feed, Messages, Friends)
 *   - "More" dropdown trigger
 *   - 11 položiek v "More" dropdowne (Videos, Marketplace, Memories,
 *     Dating, Anonymous Dating, Groups, Pages, Events, Saved, Trending, Info)
 *
 * Pre každé tlačidlo overuje:
 *   1) je viditeľné a aktívne (enabled)
 *   2) klik prejde SPA navigáciou (bez full reloadu) na očakávaný URL
 *   3) cieľová stránka nehodí runtime chybu (žiadny "Application error")
 *   4) aktívne tlačidlo dostane primary stav (text-primary class), keď sme na route
 */

const MAIN_ITEMS = [
  { label: "Feed", path: "/wall" },
  { label: "Messages", path: "/wall/messages" },
  { label: "Friends", path: "/wall/friends" },
] as const;

const MORE_ITEMS = [
  { label: "Videos", path: "/wall/videos" },
  { label: "Marketplace", path: "/bazaar" },
  { label: "Memories", path: "/wall/memories" },
  { label: "Dating", path: "/dating" },
  { label: "Anonymous Dating", path: "/anonymous-date" },
  { label: "Groups", path: "/wall/groups" },
  { label: "Pages", path: "/wall/pages" },
  { label: "Events", path: "/wall/events" },
  { label: "Saved", path: "/wall/saved" },
  { label: "Trending", path: "/wall/trending" },
  { label: "Info", path: "/wall/info" },
] as const;

async function gotoWall(page: Page) {
  await page.goto("/wall", { waitUntil: "domcontentloaded" });
  // čakáme na WallTopNav (jeden z hlavných buttonov)
  await expect(page.getByRole("button", { name: "Feed", exact: true }).first())
    .toBeVisible({ timeout: 20_000 });
}

async function expectNoRuntimeError(page: Page) {
  // Heuristika – page nesmie zobrazovať generický error overlay.
  await expect(page.locator("text=/Application error|Something went wrong|Unexpected Application/i"))
    .toHaveCount(0);
}

test.describe("Wall – všetky tlačidlá v TopNav", () => {
  test.beforeEach(async ({ page }) => {
    await gotoWall(page);
  });

  for (const item of MAIN_ITEMS) {
    test(`hlavné tlačidlo: ${item.label} naviguje na ${item.path}`, async ({ page }) => {
      // ak sme už na ceste cieľa, najprv odíď preč, aby klik niečo robil
      if (new URL(page.url()).pathname === item.path) {
        await page.goto("/wall/info", { waitUntil: "domcontentloaded" });
        await gotoWall(page);
      }

      const btn = page.getByRole("button", { name: item.label, exact: true }).first();
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();

      // Zachyť, či došlo k full reloadu (nesmie).
      let didFullReload = false;
      page.on("load", () => { didFullReload = true; });

      await btn.click();

      await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
        .toBe(item.path);
      expect(didFullReload, "SPA nav, no full reload").toBe(false);

      await expectNoRuntimeError(page);

      // Aktívny stav: tlačidlo má text-primary triedu
      const activeBtn = page.getByRole("button", { name: item.label, exact: true }).first();
      await expect(activeBtn).toHaveClass(/text-primary/);
    });
  }

  test("More dropdown sa otvorí a obsahuje všetky položky", async ({ page }) => {
    const more = page.getByRole("button", { name: /^More$/ }).first();
    await expect(more).toBeVisible();
    await more.click();

    for (const item of MORE_ITEMS) {
      await expect(page.getByRole("menuitem", { name: item.label, exact: true })).toBeVisible();
    }

    // Zatvor dropdown (Escape)
    await page.keyboard.press("Escape");
  });

  for (const item of MORE_ITEMS) {
    test(`More položka: ${item.label} naviguje na ${item.path}`, async ({ page }) => {
      const more = page.getByRole("button", { name: /^More$/ }).first();
      await more.click();

      const menuItem = page.getByRole("menuitem", { name: item.label, exact: true });
      await expect(menuItem).toBeVisible();
      await expect(menuItem).toBeEnabled();

      let didFullReload = false;
      page.on("load", () => { didFullReload = true; });

      await menuItem.click();

      await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
        .toBe(item.path);
      expect(didFullReload, "SPA nav, no full reload").toBe(false);

      await expectNoRuntimeError(page);
    });
  }

  test("klávesnicová obsluha: Tab/Enter na Feed funguje", async ({ page }) => {
    // odíď preč zo /wall a vráť sa cez klávesnicu
    await page.goto("/wall/info", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Feed", exact: true }).first())
      .toBeVisible();

    const feedBtn = page.getByRole("button", { name: "Feed", exact: true }).first();
    await feedBtn.focus();
    await page.keyboard.press("Enter");

    await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
      .toBe("/wall");
  });
});
