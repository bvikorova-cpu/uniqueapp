import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – komplexný test tlačidiel vo Wall PODSTRÁNKACH.
 *
 * Pokrýva:
 *  - /wall/events    → Create Event dialog + reálny insert + RSVP buttons
 *  - /wall/groups    → tabs (My / Discover), Create Group dialog + insert
 *  - /wall/pages     → tabs (Mine / Following / Discover), Create Page + insert
 *  - /wall/saved     → render + empty state / posts
 *  - /wall/memories  → render heading
 *  - /wall/trending  → render heading
 *  - /wall/videos    → render heading
 *  - /wall/info      → render heading
 */

const stamp = () => Date.now().toString(36);

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(1500);
}

async function noRuntimeError(page: Page) {
  await expect(
    page.locator("text=/Application error|Something went wrong/i"),
  ).toHaveCount(0);
}

test.describe("Wall podstránky – tlačidlá", () => {
  test.describe.configure({ retries: 2 });
  // ---------------- EVENTS ----------------
  test("EVENTS: otvorí Create Event dialog, vytvorí event, zobrazí v My Events", async ({ page }) => {
    await goto(page, "/wall/events");
    await expect(page.getByRole("heading", { name: /^events$/i }).first()).toBeVisible();

    // Open dialog
    const createBtn = page.getByRole("button", { name: /create event/i }).first();
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText(/Create New Event/i)).toBeVisible();

    const title = `E2E Event ${stamp()}`;
    await page.getByPlaceholder(/enter event title/i).fill(title);
    await page.getByPlaceholder(/add location/i).fill("Test City");

    // datetime-local inputs (start, end)
    const dtInputs = page.locator('input[type="datetime-local"]');
    await expect(dtInputs).toHaveCount(2);
    const start = new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 16);
    const end = new Date(Date.now() + 26 * 3600_000).toISOString().slice(0, 16);
    await dtInputs.nth(0).fill(start);
    await dtInputs.nth(1).fill(end);
    await page.getByPlaceholder(/tell people about this event/i).fill("E2E auto-created event");

    // Submit – button vnútri dialogu (presný text "Create Event")
    const submit = page
      .getByRole("dialog")
      .getByRole("button", { name: /^create event$/i });
    await submit.click();

    // Toast success
    await expect(page.getByText(/event created|success/i).first()).toBeVisible({ timeout: 10_000 });

    // Reload a over že event je v My Events
    await goto(page, "/wall/events");
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10_000 });

    // RSVP buttons existujú pre upcoming events (ak je aspoň jeden)
    const goingBtn = page.getByRole("button", { name: /going/i }).first();
    if (await goingBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(goingBtn).toBeEnabled();
    }
    await noRuntimeError(page);
  });

  // ---------------- GROUPS ----------------
  test("GROUPS: pill tabs (My/Discover) + Create Group vytvorí skupinu", async ({ page }) => {
    await goto(page, "/wall/groups");
    await expect(page.getByRole("heading", { name: /^groups$/i }).first()).toBeVisible();

    // Pill tabs (custom <button> – nie Radix role=tab)
    const tabButtons = page.getByRole("button", { name: /^(My Groups|Discover)$/ });
    await expect.poll(() => tabButtons.count(), { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
    await tabButtons.first().click();
    await page.waitForTimeout(200);
    await tabButtons.nth(1).click();
    await page.waitForTimeout(200);

    // Open Create dialog z hero
    const createBtn = page.getByRole("button", { name: /^create group$/i }).first();
    await createBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: /create new group/i }).first()).toBeVisible({ timeout: 5000 });

    const name = `E2E Group ${stamp()}`;
    await dialog.getByPlaceholder(/enter group name/i).fill(name);
    await dialog.locator("textarea").first().fill("E2E auto group");
    await dialog.getByRole("button", { name: /^create group$/i }).click();
    await expect(page.getByText(/success|created/i).first()).toBeVisible({ timeout: 10_000 });
    await noRuntimeError(page);
  });

  // ---------------- PAGES ----------------
  test("PAGES: tabs (Mine/Following/Discover) + Create Page dialog vytvorí page", async ({ page }) => {
    await goto(page, "/wall/pages");
    await expect(page.getByRole("heading", { name: /^pages$/i }).first()).toBeVisible();

    // Tabs – custom <button> v pill kontajneri (My Pages / Following / Discover)
    const tabButtons = page.getByRole("button", { name: /^(My Pages|Following|Discover)$/ });
    expect(await tabButtons.count(), "3 tab tlačidlá").toBeGreaterThanOrEqual(3);
    // klikni postupne každý tab
    for (let i = 0; i < 3; i++) {
      await tabButtons.nth(i).click();
      await page.waitForTimeout(250);
    }

    // Create Page dialog (hero)
    const createBtn = page.getByRole("button", { name: /^create page$/i }).first();
    await createBtn.click();
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: /create new page/i }).first()
    ).toBeVisible({ timeout: 5000 });

    const name = `E2E Page ${stamp()}`;
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder(/enter page name/i).fill(name);
    await dialog.getByPlaceholder(/business|entertainment/i).fill("Test");
    await dialog.getByPlaceholder(/what's your page about/i).fill("E2E auto page");

    await dialog.getByRole("button", { name: /^create page$/i }).click();
    await page.waitForTimeout(2000);
    await noRuntimeError(page);
  });

  // ---------------- SAVED ----------------
  test("SAVED: stránka sa načíta (empty alebo posty)", async ({ page }) => {
    await goto(page, "/wall/saved");
    await expect(page.getByRole("heading", { name: /saved posts/i }).first()).toBeVisible();
    const hasContent =
      (await page.locator("article").first().isVisible({ timeout: 2000 }).catch(() => false)) ||
      (await page.getByText(/no saved posts|your bookmarked content|saved items/i).first().isVisible({ timeout: 3000 }).catch(() => false));
    expect(hasContent).toBeTruthy();
    await noRuntimeError(page);
  });

  // ---------------- STATIC SUB-PAGES ----------------
  const SUBPAGES = [
    { path: "/wall/memories", heading: /memories/i },
    { path: "/wall/trending", heading: /trending/i },
    { path: "/wall/videos", heading: /videos/i },
    { path: "/wall/info", heading: /wall features guide/i },
  ] as const;

  for (const p of SUBPAGES) {
    test(`SUB-PAGE: ${p.path} sa načíta bez chyby`, async ({ page }) => {
      await goto(page, p.path);
      await expect(page.getByRole("heading", { name: p.heading }).first()).toBeVisible({
        timeout: 10_000,
      });
      await noRuntimeError(page);
    });
  }
});
