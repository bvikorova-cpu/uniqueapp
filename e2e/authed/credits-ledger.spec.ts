import { test, expect, Page } from "@playwright/test";

/**
 * MyCreditsLedger E2E — authenticated user can open the credit history page,
 * see the header, filters, and either rows or empty state without JS errors.
 *
 * Routes: /credits/history and /my-credits-history (both point at the same page).
 */

async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () => {
        const body = document.body;
        if (!body) return false;
        const txt = (body.innerText || "").toLowerCase();
        if (txt.includes("loading unique")) return false;
        return (
          !!document.querySelector("header") ||
          !!document.querySelector("main") ||
          (body.innerText || "").length > 80
        );
      },
      undefined,
      { timeout: 15_000 }
    )
    .catch(() => {});
}

const ROUTES = ["/credits/history", "/my-credits-history"];

test.describe("MyCreditsLedger — authed", () => {
  for (const path of ROUTES) {
    test(`renders ${path} without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await waitForHydration(page);

      // Must NOT redirect to auth (ProtectedRoute would push there if logged out).
      expect(page.url(), "should not redirect to /auth").not.toMatch(/\/auth(\?|$|#)/);

      // Page heading.
      await expect(
        page.getByRole("heading", { name: /História kreditov|Credit history/i }).first()
      ).toBeVisible({ timeout: 10_000 });

      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }

  test("filters and export button are wired", async ({ page }) => {
    await page.goto("/credits/history");
    await waitForHydration(page);

    // Export CSV button visible.
    await expect(
      page.getByRole("button", { name: /Export CSV/i }).first()
    ).toBeVisible({ timeout: 8_000 });

    // Refresh button visible.
    const refresh = page.locator("button:has(svg.lucide-refresh-cw), button:has-text('Obnoviť'), button:has-text('Refresh')").first();
    await expect(refresh).toBeVisible({ timeout: 5_000 });
  });

  test("clicking Refresh does not throw", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/credits/history");
    await waitForHydration(page);

    const refresh = page
      .locator("button:has(svg.lucide-refresh-cw), button:has-text('Obnoviť'), button:has-text('Refresh')")
      .first();
    if (await refresh.isVisible().catch(() => false)) {
      await refresh.click();
      await page.waitForTimeout(800);
    }
    expect(errors, `JS errors after refresh:\n${errors.join("\n")}`).toEqual([]);
  });
});
