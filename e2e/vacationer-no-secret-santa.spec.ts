import { test, expect } from "@playwright/test";

/**
 * Verifies that the Vacationer page does not leak any Secret Santa UI,
 * does not trigger Secret Santa API/Stripe requests, and does not open
 * any Secret Santa modal.
 */

const SANTA_PATTERNS = [
  /secret[_-]?santa/i,
  /santa[_-]?credits/i,
  /send[_-]?secret[_-]?santa[_-]?gift/i,
  /create[_-]?secret[_-]?santa[_-]?payment/i,
];

test.describe("Vacationer isolation from Secret Santa", () => {
  test("no Secret Santa UI, requests, or modals on /vacationer", async ({ page }) => {
    const matchedRequests: string[] = [];
    const pageErrors: string[] = [];

    page.on("pageerror", (e) => pageErrors.push(String(e)));
    page.on("request", (req) => {
      const url = req.url();
      if (SANTA_PATTERNS.some((p) => p.test(url))) {
        matchedRequests.push(`${req.method()} ${url}`);
      }
    });

    await page.goto("/vacationer");
    await page.waitForLoadState("networkidle");

    // 1. No Secret Santa text anywhere on the page
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    expect(bodyText).not.toContain("secret santa");
    expect(bodyText).not.toContain("santa credits");

    // 2. No Secret Santa related elements rendered (by attribute scan)
    const html = await page.content();
    for (const pattern of SANTA_PATTERNS) {
      expect(html, `Found Secret Santa marker (${pattern}) in DOM`).not.toMatch(pattern);
    }

    // 3. No Secret Santa API / Stripe requests fired
    expect(matchedRequests, `Unexpected Santa requests: ${matchedRequests.join(", ")}`).toEqual([]);

    // 4. No dialog/modal open at load
    const openDialogs = await page.locator('[role="dialog"][data-state="open"]').count();
    expect(openDialogs).toBe(0);

    // 5. No JS errors
    expect(pageErrors, `JS errors: ${pageErrors.join("\n")}`).toEqual([]);

    // 6. Vacationer hero/feature should be present
    expect(bodyText).toMatch(/vacationer|destination|travel/);
  });

  test("clicking each AI tool card does not surface Secret Santa", async ({ page }) => {
    const matchedRequests: string[] = [];
    page.on("request", (req) => {
      if (SANTA_PATTERNS.some((p) => p.test(req.url()))) {
        matchedRequests.push(req.url());
      }
    });

    await page.goto("/vacationer");
    await page.waitForLoadState("networkidle");

    const tools = ["AI Travel Planner", "AI Packing List", "AI Local Guide", "Budget Calculator", "Cultural Guide", "Food Explorer"];
    for (const label of tools) {
      const card = page.getByText(label, { exact: false }).first();
      if (await card.count()) {
        await card.click().catch(() => {});
        await page.waitForTimeout(300);
        const html = (await page.content()).toLowerCase();
        expect(html, `Secret Santa appeared after opening ${label}`).not.toContain("secret santa");
        // Back to hub if a Back button exists
        const back = page.getByRole("button", { name: /back/i }).first();
        if (await back.count()) await back.click().catch(() => {});
        await page.waitForTimeout(200);
      }
    }

    expect(matchedRequests, `Santa requests fired: ${matchedRequests.join(", ")}`).toEqual([]);
  });
});
