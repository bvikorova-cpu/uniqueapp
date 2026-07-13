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
import { test, expect, Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://uniqueapp.lovable.app";
const EMAIL = process.env.TEST_EMAIL ?? "beata.vikorova@yandex.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "BiankaDominik25";

async function dismissOverlays(page: Page) {
  const candidates = [
    /accept all/i,
    /prijať všetko/i,
    /only necessary/i,
    /len nevyhnutné/i,
  ];
  for (const name of candidates) {
    const btn = page.getByRole("button", { name }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
    }
  }
  // Generic close (welcome modal etc.)
  const close = page.locator('[aria-label="Close" i], button:has-text("×")').first();
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
  }
}

async function doLogin(page: Page) {
  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  const loginTab = page.getByRole("tab", { name: /^login$/i }).first();
  if (await loginTab.isVisible().catch(() => false)) {
    await loginTab.click().catch(() => {});
  }
  await page.locator("#login-email").first().fill(EMAIL).catch(async () => {
    await page.getByLabel(/email/i).first().fill(EMAIL);
  });
  await page.locator("#login-password").first().fill(PASSWORD).catch(async () => {
    await page.getByLabel(/password|heslo/i).first().fill(PASSWORD);
  });
  await dismissOverlays(page);
  await page.getByRole("button", { name: /sign in|log in|prihlás/i }).first().click();
  await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 30_000 });
}

test.describe("Critical user journey", () => {
  test("homepage renders without crash overlay", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE);
    await expect(page.locator("[data-unique-crash-overlay]")).toHaveCount(0);
    expect(errors, "no uncaught page errors").toEqual([]);
  });

  test("login flow works", async ({ page }) => {
    await doLogin(page);
  });

  test("credits page loads when logged in", async ({ page }) => {
    await doLogin(page);
    await page.goto(`${BASE}/credits`);
    await dismissOverlays(page);
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
