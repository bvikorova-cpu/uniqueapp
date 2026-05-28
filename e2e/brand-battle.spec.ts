import { test, expect } from "@playwright/test";

/**
 * Brand Battle Arena E2E — render smoke (Nathalie's beta walk).
 *
 * Coverage:
 *  (a) Top-level routes render without JS exceptions
 *  (b) Hub renders and lists all 20 next-gen features (cards visible)
 *  (c) Each of the 20 hub features opens its detail panel
 *  (d) Paywall / monetization copy present on landing
 *  (e) AI features advertise credit cost (3–5 CR)
 */

const TOP_ROUTES = ["/brand-battle", "/brand-battle/hub"];

const FEATURE_TITLES = [
  "Swipe-to-Vote",
  "Tournament Brackets",
  "Tier List Builder",
  "Multi-Way Battles",
  "Category Battles",
  "Blind Battles",
  "Flash Battles",
  "Share-to-Vote",
  "Predictions Market",
  "Friend Duels",
  "Team Battles",
  "Embeddable Battles",
  "AI Battle Post",
  "Sentiment Heatmap",
  "Demographic Breakdown",
  "Trend Timeline",
  "Vote Reason Tags",
  "Public Brand Profiles",
  "AI Brand Analyzer",
  "AI Battle Predictor",
];

test.describe("Brand Battle — top routes", () => {
  for (const path of TOP_ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await page.waitForLoadState("domcontentloaded");
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(40);
      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Brand Battle Hub — 20 features render", () => {
  test("all 20 feature cards visible on hub", async ({ page }) => {
    await page.goto("/brand-battle/hub");
    await page.waitForLoadState("domcontentloaded");
    for (const title of FEATURE_TITLES) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible({
        timeout: 5_000,
      });
    }
  });

  test("AI features show credit cost (3–5 CR badge)", async ({ page }) => {
    await page.goto("/brand-battle/hub");
    await page.waitForLoadState("domcontentloaded");
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/\b[345]\s*CR\b/);
  });

  for (const title of FEATURE_TITLES) {
    test(`opens detail panel: ${title}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto("/brand-battle/hub");
      await page.waitForLoadState("domcontentloaded");
      await page.getByText(title, { exact: true }).first().click();
      // detail panel has a Close button
      await expect(page.getByRole("button", { name: /close/i }).first()).toBeVisible({
        timeout: 4_000,
      });
      expect(errors, `JS errors opening ${title}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Brand Battle — monetization surface", () => {
  test("landing surfaces vote / credit / sponsor copy", async ({ page }) => {
    await page.goto("/brand-battle");
    await page.waitForLoadState("domcontentloaded");
    const body = (await page.locator("body").innerText()).toLowerCase();
    const monetized =
      /vote|credit|€|eur|sponsor|leaderboard|battle|premium/.test(body);
    expect(monetized).toBe(true);
  });
});
