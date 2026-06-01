import { test, expect, Page } from "@playwright/test";

/**
 * AI Credits Store — anonymous smoke. Pack list visible, no JS errors.
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

const ROUTES = ["/ai-credits-store", "/ai-credits"];

test.describe("AI Credits Store — anonymous", () => {
  for (const path of ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await waitForHydration(page);

      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(80);

      // Should mention at least one of the known package surfaces or pack copy.
      expect(body).toMatch(/Ultimate|Choose your pack|credit|kredit/i);

      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});
