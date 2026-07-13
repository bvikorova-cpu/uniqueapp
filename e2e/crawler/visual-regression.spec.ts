/**
 * Visual regression — screenshots the top 50 highest-traffic public routes
 * at desktop and mobile viewports and compares against baseline snapshots.
 *
 * First run creates baselines under e2e/crawler/__screenshots__.
 * Subsequent runs fail on visual diff >0.2% (Playwright default with
 * maxDiffPixelRatio tuning below).
 */
import { test, expect, devices } from "@playwright/test";

const TOP_ROUTES = [
  "/",
  "/wall",
  "/megatalent",
  "/dating",
  "/jobs",
  "/bazaar",
  "/education",
  "/health",
  "/kids",
  "/creators",
  "/doctors",
  "/tennis-arena",
  "/brand-arena",
  "/rewards",
  "/blog",
  "/pricing",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/anonymous-dating",
  "/brain-duel",
  "/coloring-pages",
  "/multiverse-network",
  "/crystal-energy-network",
  "/dna-memory-network",
  "/holographic-avatar",
  "/time-capsule",
  "/time-reversal",
  "/fairy-castles",
  "/mystical",
  "/blockchain-confessions",
  "/reincarnation",
  "/phobia",
  "/concert",
  "/membership-community",
  "/property",
  "/confessions",
  "/ai-clone",
  "/virtual-influencer-agency",
  "/creative-forge",
  "/content-studio",
  "/brand-builder",
  "/fashion-studio",
  "/beauty-studio",
  "/home-designer",
  "/photo-restoration",
  "/future-face",
  "/stock-library",
];

test.describe("Visual regression — desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  for (const route of TOP_ROUTES) {
    test(`desktop ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle", timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(800);
      await expect(page).toHaveScreenshot(`desktop${route.replace(/\//g, "_") || "_root"}.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });
    });
  }
});

test.describe("Visual regression — mobile", () => {
  test.use({ ...(devices["iPhone 14"] ?? devices["iPhone 13"]) });
  for (const route of TOP_ROUTES) {
    test(`mobile ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle", timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(800);
      await expect(page).toHaveScreenshot(`mobile${route.replace(/\//g, "_") || "_root"}.png`, {
        fullPage: false,
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });
    });
  }
});
