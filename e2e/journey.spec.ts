/**
 * E2E user journey – Playwright skeleton
 *
 * Spustenie (lokálne alebo v CI):
 *   bunx playwright install chromium
 *   bunx playwright test e2e/journey.spec.ts
 *
 * Environment:
 *   BASE_URL=https://uniqueapp.lovable.app
 *   TEST_EMAIL=beata.vikorova@yandex.com
 *   TEST_PASSWORD=BiankaDominik25
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://uniqueapp.lovable.app";
const EMAIL = process.env.TEST_EMAIL ?? "beata.vikorova@yandex.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "BiankaDominik25";

test.describe("Critical user journey", () => {
  test("homepage renders without crash overlay", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE);
    await expect(page.locator("[data-unique-crash-overlay]")).toHaveCount(0);
    expect(errors, "no uncaught page errors").toEqual([]);
  });

  test("login flow works", async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    await page.getByLabel(/email/i).first().fill(EMAIL);
    await page.getByLabel(/password|heslo/i).first().fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|log in|prihlás/i }).first().click();
    await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 15_000 });
  });

  test("credits page loads when logged in", async ({ page }) => {
    await page.goto(`${BASE}/auth`);
    await page.getByLabel(/email/i).first().fill(EMAIL);
    await page.getByLabel(/password|heslo/i).first().fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|log in|prihlás/i }).first().click();
    await page.waitForURL((u) => !u.pathname.startsWith("/auth"));
    await page.goto(`${BASE}/credits`);
    await expect(page.locator("[data-unique-crash-overlay]")).toHaveCount(0);
    await expect(page.getByText(/credit/i).first()).toBeVisible();
  });

  for (const route of ["/dating", "/community", "/marketplace", "/megatalent", "/games", "/kids-channel"]) {
    test(`hub renders: ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(3000);
      await expect(page.locator("[data-unique-crash-overlay]")).toHaveCount(0);
      const text = await page.locator("#root").innerText();
      expect(text.length, `${route} should not be blank`).toBeGreaterThan(50);
      expect(errors.filter((e) => !e.includes("ResizeObserver")), `${route} no page errors`).toEqual([]);
    });
  }
});
