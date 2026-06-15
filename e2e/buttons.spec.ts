/**
 * Button smoke test – klikne na všetky viditeľné tlačidlá/odkazy
 * na hlavných hub stránkach a overí, že nespôsobia crash ani runtime error.
 *
 * Skipuje destruktívne akcie (delete, logout, pay, withdraw, refund...).
 */
import { test, expect, Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://uniqueapp.lovable.app";

const ROUTES = [
  "/",
  "/dating",
  "/community",
  "/marketplace",
  "/megatalent",
  "/games",
  "/kids-channel",
  "/credits",
];

const SKIP_PATTERNS = [
  /delete|zmaz|remove|odstrán/i,
  /logout|odhlás|sign out/i,
  /pay|zaplatiť|buy|kúpiť|checkout|withdraw|výber|refund/i,
  /report|nahlás|block|zabloko/i,
  /confirm|potvrd/i,
];

async function dismissOverlays(page: Page) {
  const names = [/accept all/i, /prijať všetko/i, /only necessary/i, /len nevyhnutné/i];
  for (const n of names) {
    const b = page.getByRole("button", { name: n }).first();
    if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
  }
}

test.describe("Button smoke test", () => {
  for (const route of ROUTES) {
    test(`buttons on ${route} do not crash`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => {
        if (!e.message.includes("ResizeObserver")) errors.push(e.message);
      });

      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      await dismissOverlays(page);

      const buttons = await page.locator("button:visible, a[role=button]:visible").all();
      const maxClicks = Math.min(buttons.length, 15);
      let clicked = 0;

      for (let i = 0; i < buttons.length && clicked < maxClicks; i++) {
        const btn = buttons[i];
        const label = (await btn.innerText().catch(() => "")).trim().slice(0, 60);
        const aria = (await btn.getAttribute("aria-label").catch(() => "")) ?? "";
        const text = `${label} ${aria}`.trim();

        if (!text) continue;
        if (SKIP_PATTERNS.some((p) => p.test(text))) continue;

        const before = page.url();
        await btn.click({ timeout: 2000, trial: false }).catch(() => {});
        clicked++;
        await page.waitForTimeout(400);

        // crash check
        const crash = await page.locator("[data-unique-crash-overlay]").count();
        expect(crash, `crash after click "${text}" on ${route}`).toBe(0);

        // ak nás navigovalo preč, vráťme sa späť
        if (page.url() !== before) {
          await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(1500);
          await dismissOverlays(page);
        } else {
          // zatvor prípadné modaly cez Escape
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(200);
        }
      }

      expect(errors, `runtime errors on ${route}: ${errors.join(" | ")}`).toEqual([]);
    });
  }
});
