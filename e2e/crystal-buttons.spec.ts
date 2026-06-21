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
  "verify-crystal-payment",
  "verify-crystal-purchase",
  "crystal-ai-tool",
  // Excluded: create-crystal-purchase (routed via proxy 'n'), analyze-crystal-energy (proxy).
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

  // Sequentially click EVERY crystal tool, assert it either opens its tool
  // view (Back-to-Hub button visible) or redirects (Crystal Marketplace),
  // verify no JS errors fired, then return to the hub and continue.
  test("clicks every crystal tool sequentially without errors", async ({ page }) => {
    const errors = (page as any)._jsErrors as string[];
    const failures: string[] = [];

    for (const name of CRYSTAL_TOOLS) {
      const before = errors.length;
      await page.getByText(name, { exact: true }).first().click();

      try {
        if (name === "Crystal Marketplace") {
          await page.waitForURL(/\/crystal-marketplace/, { timeout: 8_000 });
          await page.goBack();
          await expect(
            page.getByText("AI Energy Reading", { exact: true }).first(),
          ).toBeVisible({ timeout: 8_000 });
        } else {
          const back = page.getByRole("button", { name: /back to hub/i });
          await expect(back).toBeVisible({ timeout: 8_000 });
          await back.click();
          await expect(
            page.getByText("AI Energy Reading", { exact: true }).first(),
          ).toBeVisible({ timeout: 8_000 });
        }
      } catch (e: any) {
        failures.push(`${name}: ${e.message?.split("\n")[0] ?? e}`);
        // Recover: navigate back to hub for the next iteration
        await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
      }

      const newErrors = errors.slice(before);
      if (newErrors.length) {
        failures.push(`${name} JS errors: ${newErrors.join(" | ")}`);
      }
    }

    expect(failures, `Per-tool failures:\n${failures.join("\n")}`).toEqual([]);
  });

  // After each click, ensure no loading spinner is left behind and the page
  // is interactive again (no aria-busy=true, no .animate-spin elements,
  // and the underlying tool button is clickable for re-entry).
  test("loading spinners clear after each tool click and page stays interactive", async ({
    page,
  }) => {
    // Tools that route to a separate page — covered by the "redirects" test;
    // skip them here so we focus on in-hub spinner behavior.
    const inHubTools = CRYSTAL_TOOLS.filter((n) => n !== "Crystal Marketplace");
    const failures: string[] = [];

    for (const name of inHubTools) {
      await page.getByText(name, { exact: true }).first().click();

      // Wait for the tool view to mount (Back-to-Hub button is its sentinel).
      const back = page.getByRole("button", { name: /back to hub/i });
      try {
        await expect(back).toBeVisible({ timeout: 10_000 });
      } catch {
        failures.push(`${name}: tool view never mounted`);
        await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
        continue;
      }

      // 1) No element should remain in aria-busy state once the view is shown.
      const busy = page.locator('[aria-busy="true"]');
      try {
        await expect(busy).toHaveCount(0, { timeout: 8_000 });
      } catch {
        failures.push(`${name}: aria-busy element still present after load`);
      }

      // 2) No .animate-spin spinner should still be visible on the tool view.
      //    Tools may render brief spinners during async work; we wait up to
      //    8s for them to disappear before failing.
      const spinner = page.locator(".animate-spin").first();
      try {
        await expect(spinner).toBeHidden({ timeout: 8_000 });
      } catch {
        failures.push(`${name}: .animate-spin still visible after load`);
      }

      // 3) Page must be interactive: clicking "Back to Hub" returns to hub
      //    and the hub re-renders so the same tool button is clickable again.
      try {
        await back.click();
        const hubBtn = page.getByText(name, { exact: true }).first();
        await expect(hubBtn).toBeVisible({ timeout: 8_000 });
        await expect(hubBtn).toBeEnabled();
      } catch {
        failures.push(`${name}: hub not interactive after back-navigation`);
        await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
      }
    }

    expect(failures, `Spinner / interactivity failures:\n${failures.join("\n")}`).toEqual([]);
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
