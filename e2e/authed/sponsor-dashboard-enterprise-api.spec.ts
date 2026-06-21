import { test, expect } from "@playwright/test";

/**
 * Sponsor Dashboard — Enterprise "API Access" tab UI smoke.
 *
 * Authenticated as the standard QA user. The tab is only rendered for
 * enterprise-tier sponsors, so we skip gracefully when the logged-in user
 * does not have an active enterprise sponsor row. The hard-blocking check is
 * the API-level spec (e2e/brand-arena-enterprise-api.spec.ts).
 */

test.describe("Sponsor Dashboard — API Access tab (enterprise only)", () => {
  test("renders API Access tab with curl example + rotate button when enterprise", async ({ page }) => {
    const res = await page.goto("/sponsor-dashboard");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Non-sponsor / pending users get redirected to /sponsor-registration.
    if (!/\/sponsor-dashboard/.test(page.url())) {
      test.skip(true, "Logged-in user is not an active sponsor — nothing to assert.");
    }

    const apiTab = page.getByRole("tab", { name: /api access/i });
    if ((await apiTab.count()) === 0) {
      test.skip(true, "User is sponsor but not enterprise tier — API tab hidden by design.");
    }

    await apiTab.click();
    await expect(page.getByText(/X-API-Key/i).first()).toBeVisible();
    await expect(page.getByText(/brand-arena-router/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /rotate/i })).toBeVisible();
  });
});
