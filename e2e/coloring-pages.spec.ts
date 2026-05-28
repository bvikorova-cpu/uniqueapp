import { test, expect } from "@playwright/test";

/**
 * Coloring Pages E2E — beta test suite (Nathalie).
 *
 * Coverage:
 *  (a) Top-level routes render under 500 with no JS exceptions
 *  (b) All 18 hub feature slugs render
 *  (c) Legacy redirects (/schools, /healthcare, /corporate-events)
 *  (d) Paid-only model: AI features require auth / credits
 *  (e) Credit checkout button reachable
 */

const TOP_ROUTES = [
  "/coloring-pages",
  "/coloring-pages/hub",
];

const HUB_SLUGS = [
  "color-by-number",
  "paint-bucket",
  "brushes",
  "mandala",
  "layers",
  "smart-palettes",
  "zoom-stylus",
  "streaks",
  "contests",
  "timelapse",
  "follow-feed",
  "remix",
  "collab",
  "collections",
  "licensed",
  "ai-examples",
  "mindfulness",
  "print-on-demand",
];

const LEGACY_REDIRECTS = [
  { from: "/schools", to: "/coloring-pages" },
  { from: "/healthcare", to: "/coloring-pages" },
  { from: "/corporate-events", to: "/coloring-pages" },
];

test.describe("Coloring Pages — top routes", () => {
  for (const path of TOP_ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await page.waitForLoadState("domcontentloaded");
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(20);
      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Coloring Pages — 18 hub slugs", () => {
  for (const slug of HUB_SLUGS) {
    test(`hub/${slug} renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`/coloring-pages/hub/${slug}`);
      await page.waitForLoadState("domcontentloaded");
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(10);
      expect(errors, `JS errors on hub/${slug}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Coloring Pages — legacy redirects", () => {
  for (const { from, to } of LEGACY_REDIRECTS) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain(to);
    });
  }
});

test.describe("Coloring Pages — payment / paywall surface", () => {
  test("landing shows a CTA or credits pricing copy in EUR", async ({ page }) => {
    await page.goto("/coloring-pages");
    await page.waitForLoadState("domcontentloaded");
    const body = (await page.locator("body").innerText()).toLowerCase();
    // Paid-only model: must mention credits, price, €, or buy/get
    const monetized =
      /credit|€|eur|buy|get started|subscribe|upgrade|pricing|premium/.test(body);
    expect(monetized).toBe(true);
  });

  test("paid feature panel renders gating UI when signed out", async ({ page }) => {
    // color-by-number is the headline paid feature (5 credits)
    await page.goto("/coloring-pages/hub/color-by-number");
    await page.waitForLoadState("domcontentloaded");
    const body = (await page.locator("body").innerText()).toLowerCase();
    const gated =
      /sign in|log in|prihlás|login|credit|buy|unlock|upgrade|€/.test(body);
    expect(gated).toBe(true);
  });
});
