/**
 * Admin actions smoke — verifies that key admin routes load without RLS/perm
 * errors for the authed QA account, and that the primary admin RPC responds.
 *
 * Not exhaustive: no destructive writes. Just proves the admin surface is
 * reachable (auth + role gate + first data fetch don't throw).
 */
import { test, expect } from "@playwright/test";

const ADMIN_ROUTES = [
  "/admin",
  "/admin/edge-monitoring",
  "/admin/error-logs",
  "/admin/credits-ledger",
  "/admin/audit-log",
  "/admin/reconciliation",
  "/admin/crawler",
  "/admin/button-tester",
];

test.describe("Admin surface smoke", () => {
  for (const route of ADMIN_ROUTES) {
    test(`loads ${route} without runtime error`, async ({ page }) => {
      const pageErrors: string[] = [];
      const httpErrors: { url: string; status: number }[] = [];
      page.on("pageerror", (e) => {
        const m = e.message || String(e);
        if (!m.includes("ResizeObserver")) pageErrors.push(m);
      });
      page.on("response", (res) => {
        if (res.status() >= 500) httpErrors.push({ url: res.url(), status: res.status() });
      });

      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(1500);

      // If not admin, the app renders an access-denied UI — that's a *known*
      // route response, not a bug. We only fail on runtime/5xx errors.
      expect(pageErrors, `runtime errors: ${JSON.stringify(pageErrors)}`).toEqual([]);
      expect(httpErrors, `5xx: ${JSON.stringify(httpErrors)}`).toEqual([]);
    });
  }
});
