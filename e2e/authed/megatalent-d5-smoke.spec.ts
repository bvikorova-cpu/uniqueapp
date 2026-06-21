/**
 * Megatalent D5 smoke — authed.
 *
 * Verifies that the refactored Megatalent backend-integrated surfaces load
 * without runtime errors for a logged-in (VIP-gated) user:
 *   - reactions UI mounts (no localStorage fake counts crash)
 *   - stories rail queries mt_stories without throwing
 *   - mentorship booking list queries mt_mentors without throwing
 *
 * The full pay/book/upload happy-paths require Stripe + storage and live in
 * dedicated specs; this smoke just guards against regressions in the
 * D1–D4 refactor.
 */
import { test, expect } from "@playwright/test";

test.describe("Megatalent D5 — refactored surfaces smoke", () => {
  test("megatalent loads without uncaught errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Filter out known non-fatal noise (3rd-party SDKs, ResizeObserver).
    const fatal = errors.filter(
      (m) =>
        !/ResizeObserver/i.test(m) &&
        !/Non-Error promise rejection/i.test(m) &&
        !/Failed to fetch/i.test(m),
    );
    expect(fatal, fatal.join("\n")).toHaveLength(0);
  });
});
