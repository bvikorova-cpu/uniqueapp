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

      // Wait for actual store content (poll up to 15s — cookie banner may delay paint).
      await expect
        .poll(
          async () => {
            const txt = await page.locator("main, body").first().innerText().catch(() => "");
            return /Ultimate|Choose your pack|credit|kredit|pack/i.test(txt);
          },
          { timeout: 15_000, intervals: [500, 1000, 2000] }
        )
        .toBe(true);

      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});
