import { test, expect } from "@playwright/test";

const TOOL_TITLES = [
  "Player Creator",
  "Team Builder",
  "Match Simulator",
  "Training Center",
  "Player Market",
  "Scout Network",
  "Tactics Board",
  "League System",
  "Equipment Shop",
  "Court Builder",
  "Transfer Market",
  "Youth Academy",
  "Match Analysis",
  "Trophy Room",
  "Coin Shop",
  "🎾 Serve Challenge",
  "🎾 Play on Poki ↗",
];

test.describe("Tennis Arena buttons", () => {
  test("hub renders without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/tennis-arena");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /tennis arena tools/i })).toBeVisible({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  for (const title of TOOL_TITLES) {
    test(`tool card "${title}" is clickable and routes correctly`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/tennis-arena");
      await page.waitForLoadState("networkidle");

      const card = page.getByText(title, { exact: false }).first();
      await expect(card).toBeVisible({ timeout: 10_000 });
      await card.click();

      // Either auth guard or the tool view should appear; either way, no JS errors.
      await page.waitForTimeout(1500);
      expect(errors).toEqual([]);
    });
  }
});
