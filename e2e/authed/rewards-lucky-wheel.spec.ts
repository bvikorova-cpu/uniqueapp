import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * E2E: real Lucky Wheel spin + cooldown enforcement.
 *
 * Flow:
 *  1) Pre-clean today's lucky_spin_log row for the authed user (RLS-safe DELETE).
 *  2) Open /rewards, click "Spin the Wheel".
 *  3) Expect win toast (Spin failed should NOT appear).
 *  4) Reload page → button must show "Come Back Tomorrow!" (cooldown UI).
 *  5) Direct RPC call to `spin_lucky_wheel` must return `{ error: "already_spun_today" }`.
 *
 * Requires storageState from auth.setup.ts (authenticated session).
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Rewards · Lucky Wheel real spin + cooldown", () => {
  test("spin once succeeds, second attempt is blocked by cooldown", async ({ page }) => {
    // --- 1) Grab the access token from the SPA session and clean today's spin log.
    await page.goto("/rewards");
    await page.waitForLoadState("domcontentloaded");

    const accessToken = await page.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
          try {
            const v = JSON.parse(localStorage.getItem(k) ?? "{}");
            return v?.access_token ?? v?.currentSession?.access_token ?? null;
          } catch {
            return null;
          }
        }
      }
      return null;
    });
    test.skip(!accessToken, "No authenticated session — auth.setup.ts must run first.");

    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userRes, error: userErr } = await sb.auth.getUser(accessToken!);
    expect(userErr, "auth.getUser failed").toBeNull();
    const userId = userRes.user!.id;

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { error: delErr } = await sb
      .from("lucky_spin_log")
      .delete()
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString());
    // If RLS forbids delete, the test still proceeds — server cooldown will just block spin.
    if (delErr) console.warn("[wheel-test] could not pre-clean lucky_spin_log:", delErr.message);

    // --- 2) Open Rewards → Lucky Wheel tab and spin.
    await page.goto("/rewards");
    await page.waitForLoadState("networkidle");

    // Try to reveal Lucky Wheel section (tabs may use either text).
    const wheelTab = page.getByRole("tab", { name: /lucky\s*(wheel|spin)/i }).first();
    if (await wheelTab.count()) {
      await wheelTab.click().catch(() => {});
    }

    const spinBtn = page.getByRole("button", { name: /spin the wheel/i });
    await expect(spinBtn, "Spin button should be enabled after pre-clean").toBeEnabled({
      timeout: 15_000,
    });

    // --- 3) Click + assert success toast within reveal window (~3s animation + grace).
    await spinBtn.click();
    const winToast = page.getByText(/you won:/i).first();
    const failToast = page.getByText(/spin failed/i).first();
    await expect(winToast, "expected win toast, got spin failed").toBeVisible({ timeout: 10_000 });
    await expect(failToast).toHaveCount(0);

    // --- 4) Reload → button must reflect cooldown.
    await page.reload();
    await page.waitForLoadState("networkidle");
    if (await wheelTab.count()) await wheelTab.click().catch(() => {});
    const cooldownBtn = page.getByRole("button", { name: /come back tomorrow/i });
    await expect(cooldownBtn).toBeVisible({ timeout: 10_000 });
    await expect(cooldownBtn).toBeDisabled();

    // --- 5) Server-side guard: direct RPC must refuse.
    const { data: rpcData, error: rpcErr } = await sb.rpc("spin_lucky_wheel");
    expect(rpcErr, "RPC transport error").toBeNull();
    const payload = rpcData as { error?: string; prize?: string } | null;
    expect(payload?.error, `expected already_spun_today, got ${JSON.stringify(payload)}`).toBe(
      "already_spun_today"
    );
  });
});
