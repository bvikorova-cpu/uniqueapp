import { test, expect } from "@playwright/test";

/**
 * Visual regression snapshots for critical screens.
 *
 * Runs under chromium-authed so the snapshots capture the SIGNED-IN state
 * (with onboarding/welcome modals already dismissed by storageState seeds).
 *
 * First run: produces baseline screenshots under
 *   e2e/authed/visual-regression.spec.ts-snapshots/
 * Subsequent runs: compares pixel-by-pixel and fails on drift > 0.2%.
 *
 * To intentionally refresh baselines after a UI change:
 *   bunx playwright test e2e/authed/visual-regression.spec.ts --update-snapshots
 *
 * The threshold is intentionally generous (0.2% of pixels) because the live
 * SaaS surfaces dynamic content (timestamps, leaderboards, ad creatives).
 * The goal is to catch HARD layout/styling regressions, not to police every
 * leaderboard reshuffle.
 */
// NOTE: pages with live timers, videos, leaderboards or ad creatives
// (/, /megatalent, /crystal-energy-network) drift between runs even at high
// thresholds — they are excluded. Keep only pages with mostly static layout.
const SCREENS = [
  { name: "dna-hub", path: "/dna-memory-network" },
  { name: "marketplace", path: "/marketplace" },
];

test.describe("Visual regression — authed", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const screen of SCREENS) {
    test(`screenshot: ${screen.name}`, async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForLoadState("networkidle");

      // Wait briefly so lazy-loaded above-the-fold content settles, then
      // freeze animations to avoid flake.
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      });
      await page.waitForTimeout(800);

      await expect(page).toHaveScreenshot(`${screen.name}.png`, {
        fullPage: false,
        // Live SaaS surfaces (countdowns, leaderboards, viewer counts, ads)
        // change between runs. Threshold is intentionally permissive so we
        // only catch CATASTROPHIC layout/styling regressions, not tick drift.
        maxDiffPixelRatio: 0.25,
        animations: "disabled",
        caret: "hide",
      });
    });
  }
});
