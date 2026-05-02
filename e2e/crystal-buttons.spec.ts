import { test, expect, request } from "@playwright/test";

/**
 * Crystal Energy Network — automated button + redirect + edge-function RLS audit.
 *
 * Verifies, without requiring an authenticated user:
 *  1. Every tool card from the hub is rendered and clickable.
 *  2. Clicking "Crystal Marketplace" redirects to /crystal-marketplace.
 *  3. Opening a non-routing tool swaps the hub for the tool view, and "Back to Hub" returns.
 *  4. All crystal edge functions reject anonymous calls with 401 (RLS / JWT gate).
 *
 * Pure smoke — does NOT execute Stripe checkout (no real payment).
 */

const CRYSTAL_TOOLS = [
  "AI Energy Reading",
  "Energy Healing",
  "Chakra Balancing",
  "Crystal Encyclopedia",
  "Crystal Marketplace",
  "Crystal Scanner",
  "Crystal Collection",
  "Daily Crystal Oracle",
  "Crystal Compatibility",
  "Meditation Timer",
  "Aura Analysis",
  "Crystal Guide",
  "Energy Analytics",
  "Moon Phase Crystals",
  "Third Eye Training",
  "Energy Cleansing",
  "Live Crystal ID",
  "Crystal Sound Bath",
  "Crystal Origin Map",
  "Crystal Community",
  "Energy Leaderboard",
  "Crystal Sub Box",
] as const;

const CRYSTAL_EDGE_FUNCTIONS = [
  "create-crystal-purchase",
  "verify-crystal-payment",
  "verify-crystal-purchase",
  "crystal-ai-tool",
  // Note: analyze-crystal-energy is routed through the proxy router on the
  // client (resolveProxy in src/integrations/supabase/client.ts), not deployed
  // as a standalone edge function — so it 404s on direct HTTP and is excluded.
];

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Crystal Energy Network — buttons + redirects", () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    (page as any)._jsErrors = errors;
    await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
  });

  test("renders all 22 crystal tool buttons", async ({ page }) => {
    for (const name of CRYSTAL_TOOLS) {
      const card = page.getByText(name, { exact: true }).first();
      await expect(card, `tool "${name}" must be visible`).toBeVisible({ timeout: 10_000 });
    }
    const errors = (page as any)._jsErrors as string[];
    expect(errors, `no JS errors on hub: ${errors.join("\n")}`).toEqual([]);
  });

  test('clicking "Crystal Marketplace" redirects to /crystal-marketplace', async ({ page }) => {
    await page.getByText("Crystal Marketplace", { exact: true }).first().click();
    await page.waitForURL(/\/crystal-marketplace/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/crystal-marketplace$/);
  });

  test('opening "Daily Crystal Oracle" swaps hub for tool view + back works', async ({ page }) => {
    await page.getByText("Daily Crystal Oracle", { exact: true }).first().click();
    const back = page.getByRole("button", { name: /back to hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });
    await back.click();
    await expect(page.getByText("AI Energy Reading", { exact: true }).first()).toBeVisible();
  });
});

test.describe("Crystal edge functions — anonymous calls must be rejected", () => {
  test("each crystal edge function returns 401 without JWT", async () => {
    const ctx = await request.newContext();
    for (const fn of CRYSTAL_EDGE_FUNCTIONS) {
      const res = await ctx.post(`${SUPABASE_URL}/functions/v1/${fn}`, {
        headers: {
          "Content-Type": "application/json",
          // anon key is required to reach the function; missing JWT -> 401 inside handler
          apikey: ANON_KEY,
        },
        data: {},
      });
      expect(
        [401, 403],
        `${fn} must reject anonymous (got ${res.status()})`,
      ).toContain(res.status());
      await res.body();
    }
    await ctx.dispose();
  });
});
