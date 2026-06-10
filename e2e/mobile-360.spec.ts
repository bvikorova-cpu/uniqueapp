import { test, expect, Page, devices } from "@playwright/test";

/**
 * Mobile 360x800 smoke — ensures key public pages render without horizontal
 * overflow or JS exceptions on the smallest mainstream Android viewport.
 */

test.use({ viewport: { width: 360, height: 800 }, userAgent: devices["Pixel 5"].userAgent });

async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () => {
        const body = document.body;
        if (!body) return false;
        const txt = (body.innerText || "").toLowerCase();
        if (txt.includes("loading unique")) return false;
        return (
          !!document.querySelector("header") ||
          !!document.querySelector("main") ||
          (body.innerText || "").length > 80
        );
      },
      undefined,
      { timeout: 15_000 }
    )
    .catch(() => {});
}

const PAGES = [
  "/",
  "/ai-credits-store",
  "/brand-battle/hub",
  "/kids-channel",
  "/coloring-pages",
  // Mystical & Spiritual hub (public landing surfaces)
  "/past-life",
  "/lottery-ai",
  "/astrology",
  "/dream-journal",
  "/crystal-energy-network",
  "/dna-memory-network",
  "/reincarnation-social",
  "/blockchain-confessions",
  "/multiverse-network",
  "/quantum-social",
  "/time-capsule",
  "/time-reversal",
  "/holographic-avatars",
];

test.describe("Mobile 360px smoke", () => {
  for (const path of PAGES) {
    test(`renders ${path} on 360x800`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));

      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await waitForHydration(page);

      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(40);

      // No horizontal overflow > 8px (allow small rounding).
      const overflow = await page.evaluate(() => {
        const w = document.documentElement.scrollWidth;
        const v = document.documentElement.clientWidth;
        return w - v;
      });
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(8);

      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});
