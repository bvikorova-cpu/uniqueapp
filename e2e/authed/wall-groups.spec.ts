import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – WallGroups (/wall/groups)
 *
 * Pokrýva:
 *  - Render hero + pill tabs (My Groups / Discover)
 *  - Validácia: prázdny názov → submit nič neurobí, dialog ostane otvorený
 *  - Create Group → toast "Success", skupina sa zjaví v My Groups (admin = je member)
 *  - Leave Group → tlačidlo Leave, toast "Left", skupina zmizne z My Groups
 *  - Join Group v Discover (ak existuje cudzia skupina)
 *  - Navigácia z karty na /wall/groups/:id
 */

const stamp = () => Date.now().toString(36);

async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(1200);
}

test.describe("WallGroups – tvorba, validácia, join/leave", () => {
  test("Validácia: prázdny názov nevytvorí skupinu", async ({ page }) => {
    await goto(page, "/wall/groups");
    await page.getByRole("button", { name: /^create group$/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: /create new group/i })).toBeVisible();

    // Submit bez vyplnenia – createGroup() vráti hneď return
    await dialog.getByRole("button", { name: /^create group$/i }).click();
    await page.waitForTimeout(800);

    // Dialog ostáva otvorený, žiadny success toast
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/group created successfully/i)).toHaveCount(0);
    await page.keyboard.press("Escape");
  });

  test("Create + Leave: vytvorí skupinu, zobrazí v My Groups, opustí ju", async ({ page }) => {
    await goto(page, "/wall/groups");

    // Switch to My Groups tab
    await page.getByRole("button", { name: /^my groups$/i }).first().click();

    // Create
    await page.getByRole("button", { name: /^create group$/i }).first().click();
    const dialog = page.getByRole("dialog");
    const name = `E2E Group ${stamp()}`;
    await dialog.getByPlaceholder(/enter group name/i).fill(name);
    await dialog.locator("textarea").first().fill("E2E description");
    await dialog.getByRole("button", { name: /^create group$/i }).click();

    await expect(page.getByText(/group created successfully/i).first()).toBeVisible({ timeout: 10_000 });

    // Wait for refetch + reload to ensure new group renders
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const groupCard = page.locator(`div:has(> div h4:has-text("${name}"))`).first();
    await expect(groupCard).toBeVisible({ timeout: 10_000 });

    const leaveBtn = groupCard.getByRole("button", { name: /leave/i }).first();
    await leaveBtn.scrollIntoViewIfNeeded();
    await leaveBtn.click();
    await expect(page.getByText(/left group successfully/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Discover tab + Join na cudzej skupine (ak existuje)", async ({ page }) => {
    await goto(page, "/wall/groups");
    await page.getByRole("button", { name: /^discover$/i }).first().click();
    await page.waitForTimeout(600);

    const joinBtn = page.getByRole("button", { name: /^join$/i }).first();
    if (await joinBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await joinBtn.click();
      await expect(
        page.getByText(/joined group successfully|already a member|duplicate/i).first(),
      ).toBeVisible({ timeout: 10_000 });
    } else {
      test.info().annotations.push({ type: "skip-reason", description: "No discoverable groups" });
    }
  });

  test("Navigácia z karty vedie na /wall/groups/:id", async ({ page }) => {
    await goto(page, "/wall/groups");

    // Vytvor rýchlu skupinu, aby sme mali na čo kliknúť
    await page.getByRole("button", { name: /^create group$/i }).first().click();
    const dialog = page.getByRole("dialog");
    const name = `E2E Nav ${stamp()}`;
    await dialog.getByPlaceholder(/enter group name/i).fill(name);
    await dialog.getByRole("button", { name: /^create group$/i }).click();
    await expect(page.getByText(/group created successfully/i).first()).toBeVisible({ timeout: 10_000 });

    await page.locator(`text=${name}`).first().click();
    await expect(page).toHaveURL(/\/wall\/groups\/[0-9a-f-]+/i, { timeout: 10_000 });
  });
});
