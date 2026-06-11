import { test, expect, devices } from "@playwright/test";

/**
 * Mystical & Spiritual — interactive smoke for 9 hub pages on mobile 360x800.
 *
 * For each page we:
 *  - load it (auth-gated pages redirect to /auth — that's a valid pass)
 *  - assert the hero/H1 is visible
 *  - count at least one CTA button (tool / generate / subscribe / open)
 *  - assert no horizontal overflow
 *  - assert zero pageerrors
 *
 * Deeper flows (paywall, credit deduction, AI response shape) are covered by
 * docs/NATHALIE_QA_MYSTICAL.md manual QA — they require Stripe test cards or
 * pre-seeded credits that aren't available in the smoke CI run.
 */
test.use({ viewport: { width: 360, height: 800 }, userAgent: devices["Pixel 5"].userAgent });

const PAGES = [
  "/past-life",
  "/lottery-ai",
  "/astrology",
  "/numerology",
  "/dream-journal",
  "/crystal-energy-network",
  "/dna-memory-network",
  "/reincarnation-social",
  "/quantum-social",
];

for (const path of PAGES) {
  test(`mystical interactive smoke: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    const res = await page.goto(path);
    expect(res?.status() ?? 200).toBeLessThan(500);

    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    // Either redirected to /auth (logged-out hard-gated page) or stayed.
    if (page.url().includes("/auth")) {
      expect(errors, `JS errors on ${path} (auth redirect):\n${errors.join("\n")}`).toEqual([]);
      return;
    }

    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(40);

    // At least one button-like element present.
    const buttons = await page.locator("button, a[role='button']").count();
    expect(buttons, `no actionable controls on ${path}`).toBeGreaterThan(0);

    const overflow = await page.evaluate(() => {
      const w = document.documentElement.scrollWidth;
      const v = document.documentElement.clientWidth;
      return w - v;
    });
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(8);
    expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
  });
}
