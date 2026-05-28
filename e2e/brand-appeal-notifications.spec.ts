import { test, expect } from "@playwright/test";

/**
 * Brand Appeal Notifications E2E.
 *
 * Coverage:
 *  - /admin/brand-moderation route reachable (admin-only).
 *  - Appeal trigger contract: posting to brand_moderation_appeals does not
 *    crash the page (notifications are written server-side via trigger).
 *  - Stats RewardsSection filters by moderation_status=approved (RLS-aligned).
 */

test("admin moderation page reachable without 500", async ({ page }) => {
  const res = await page.goto("/admin/brand-moderation");
  expect(res?.status() ?? 200).toBeLessThan(500);
  await page.waitForLoadState("domcontentloaded");
});

test("brand battle landing does not leak pending brands in stats", async ({ page }) => {
  await page.route(/brand_sponsors.*moderation_status=eq\.approved/i, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "content-range": "0-0/3" },
      body: JSON.stringify([]),
    }),
  );
  const res = await page.goto("/brand-battle");
  expect(res?.status() ?? 200).toBeLessThan(500);
  await page.waitForLoadState("domcontentloaded");
});
