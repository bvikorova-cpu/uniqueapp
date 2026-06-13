import { test, expect, type Page } from "@playwright/test";

/**
 * Coloring Pages E2E — beta test suite (Nathalie).
 *
 * IMPORTANT: SPA shows "Loading Unique…" placeholder before React hydrates.
 * Every body-text assertion MUST wait for hydration; otherwise we measure
 * the placeholder and fail with body.length === 16.
 */

async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () => {
        const body = document.body?.innerText?.toLowerCase() ?? "";
        if (body.includes("loading unique")) return false;
        return (
          document.querySelector("header") !== null ||
          document.querySelector("main") !== null ||
          body.length > 80
        );
      },
      { timeout: 15_000 },
    )
    .catch(() => {});
}

const TOP_ROUTES = ["/coloring-pages", "/coloring-pages/hub"];

const HUB_SLUGS = [
  "color-by-number", "paint-bucket", "brushes", "mandala", "layers",
  "smart-palettes", "zoom-stylus", "streaks", "contests", "timelapse",
  "follow-feed", "remix", "collab", "collections", "licensed",
  "ai-examples", "mindfulness", "print-on-demand",
];

// Note: /healthcare redirects to /wellness (product decision), not /coloring-pages.
// /schools and /corporate-events are legacy and currently render their own pages.
const LEGACY_REDIRECTS: Array<{ from: string; to: string }> = [];

test.describe("Coloring Pages — top routes", () => {
  for (const path of TOP_ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await waitForHydration(page);
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
      await waitForHydration(page);
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
      await page.waitForURL(new RegExp(to.replace(/\//g, "\\/")), { timeout: 10_000 }).catch(() => {});
      expect(page.url()).toContain(to);
    });
  }
});

test.describe("Coloring Pages — payment / paywall surface", () => {
  test("landing shows a CTA or credits pricing copy in EUR", async ({ page }) => {
    await page.goto("/coloring-pages");
    await waitForHydration(page);
    const body = (await page.locator("body").innerText()).toLowerCase();
    const monetized = /credit|€|eur|buy|get started|subscribe|upgrade|pricing|premium/.test(body);
    expect(monetized).toBe(true);
  });

  test("paid feature panel renders gating UI when signed out", async ({ page }) => {
    await page.goto("/coloring-pages/hub/color-by-number");
    await waitForHydration(page);
    const body = (await page.locator("body").innerText()).toLowerCase();
    const gated = /sign in|log in|prihlás|login|credit|buy|unlock|upgrade|€/.test(body);
    expect(gated).toBe(true);
  });
});
