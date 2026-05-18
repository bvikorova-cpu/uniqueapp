import { test, expect } from "@playwright/test";

/**
 * Verifies that genuinely unknown URLs render the NotFound page (with the
 * "404" heading and "Return to Home" CTA) instead of being silently
 * redirected to /, /subscription, or /premium by the legacy-alias table
 * in src/pages/NotFound.tsx.
 */
test.describe("404 page (no silent redirect)", () => {
  const unknownPaths = [
    "/this-route-truly-does-not-exist-xyz",
    "/random/nested/garbage/path",
    "/foobar-123",
  ];

  for (const path of unknownPaths) {
    test(`shows 404 UI for ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      // URL must NOT have been rewritten to a known canonical page
      const finalUrl = new URL(page.url()).pathname.replace(/\/$/, "") || "/";
      expect(finalUrl, "should not silently redirect").toBe(path);
      expect(finalUrl).not.toBe("/");
      expect(finalUrl).not.toBe("/subscription");
      expect(finalUrl).not.toBe("/premium");

      // 404 hero
      await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
      await expect(page.getByText(/page not found/i)).toBeVisible();

      // Return-to-Home CTA must exist and point at /
      const home = page.getByRole("link", { name: /return to home/i });
      await expect(home).toBeVisible();
      await expect(home).toHaveAttribute("href", "/");
    });
  }

  test("legacy alias /pricing IS redirected (control case)", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");
    const pathname = new URL(page.url()).pathname.replace(/\/$/, "") || "/";
    expect(pathname).toBe("/subscription");
  });
});
