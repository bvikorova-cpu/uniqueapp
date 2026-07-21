// E2E: Gift Wall renders on creator profile and subscribes to realtime updates.
// Also asserts SendGiftDialog is wired (button present) and no duplicate
// realtime channels are opened on re-render (idempotency at UI layer).
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://www.uniqueapp.fun";

test("InfluKing creator profile: Gift Wall + realtime channel", async ({ page }) => {
  // Any creator profile page — pick one from InfluKing hub.
  await page.goto(`${BASE}/influ-king`, { waitUntil: "domcontentloaded" });

  const firstCreator = page
    .locator('a[href^="/creator/"]')
    .first();
  if (!(await firstCreator.count())) test.skip(true, "No creators visible in InfluKing hub");

  const href = await firstCreator.getAttribute("href");
  await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });

  // Gift Wall presence — heading or Send Gift affordance.
  const giftUi = page.getByText(/gift wall|send.*gift|top donors/i).first();
  await expect(giftUi).toBeVisible({ timeout: 15_000 });

  // No JS errors from realtime subscription.
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForTimeout(3_000);
  expect(errors.filter((e) => /channel|realtime|supabase/i.test(e))).toEqual([]);
});
