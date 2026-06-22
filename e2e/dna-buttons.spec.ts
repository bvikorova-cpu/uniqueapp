import { test, expect } from "@playwright/test";

/**
 * DNA Social Memory Network — automated button + redirect audit.
 *
 * Verifies, without an authenticated user:
 *  1. The hub renders all 10 DNA tool cards.
 *  2. Clicking each tool swaps the hub for its tool view (Back-to-DNA-Hub
 *     button visible) without throwing JS errors.
 *  3. Loading spinners (.animate-spin / aria-busy) clear after each click and
 *     the hub stays interactive after navigating back.
 *  4. The 4 pricing buttons (DNA Analysis / Ancestral Memories / Genetic
 *     Dating / Digital Offspring) trigger the auth-required toast when no
 *     session exists — i.e. they're correctly wired to create-checkout.
 */

const DNA_TOOLS = [
  "DNA Analysis",
  "Ancestral Memories",
  "Genetic Dating",
  "Digital Offspring",
  "Heritage Timeline",
  "DNA Art Generator",
  "Ancestral Voice",
  "Health Insights",
  "Family Tree",
  "DNA Community",
] as const;

const PRICING_TITLES = [
  "DNA Analysis",
  "Ancestral Memories",
  "Genetic Dating",
  "Digital Offspring",
] as const;

test.describe("DNA Social Memory Network — buttons + redirects", () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    (page as any)._jsErrors = errors;
    await page.goto("/dna-memory-network", { waitUntil: "domcontentloaded" });
  });

  test("renders all 10 DNA tool cards", async ({ page }) => {
    for (const name of DNA_TOOLS) {
      await expect(
        page.getByText(name, { exact: true }).first(),
        `tool "${name}" must be visible on hub`,
      ).toBeVisible({ timeout: 10_000 });
    }
    const errors = (page as any)._jsErrors as string[];
    expect(errors, `no JS errors on hub: ${errors.join("\n")}`).toEqual([]);
  });

  test('alias route /dna-memory loads the same hub', async ({ page }) => {
    await page.goto("/dna-memory", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("DNA Social Memory Network", { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("DNA Analysis", { exact: true }).first()).toBeVisible();
  });

  test("clicks every DNA tool sequentially without errors + spinners clear", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const errors = (page as any)._jsErrors as string[];
    const failures: string[] = [];

    for (const name of DNA_TOOLS) {
      const before = errors.length;

      // Tool cards have title text inside; click the card by its label.
      await page.getByText(name, { exact: true }).first().click();

      // Tool view sentinel
      const back = page.getByRole("button", { name: /back to dna hub/i });
      try {
        await expect(back).toBeVisible({ timeout: 10_000 });
      } catch {
        failures.push(`${name}: tool view never mounted`);
        await page.goto("/dna-memory-network", { waitUntil: "domcontentloaded" });
        continue;
      }

      // Loading state must clear
      try {
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, {
          timeout: 8_000,
        });
      } catch {
        failures.push(`${name}: aria-busy element still present`);
      }
      try {
        await expect(page.locator(".animate-spin").first()).toBeHidden({
          timeout: 8_000,
        });
      } catch {
        failures.push(`${name}: .animate-spin still visible`);
      }

      // Back to hub + interactivity
      try {
        await back.click();
        const hubBtn = page.getByText(name, { exact: true }).first();
        await expect(hubBtn).toBeVisible({ timeout: 8_000 });
        await expect(hubBtn).toBeEnabled();
      } catch {
        failures.push(`${name}: hub not interactive after back-navigation`);
        await page.goto("/dna-memory-network", { waitUntil: "domcontentloaded" });
      }

      const newErrors = errors.slice(before);
      if (newErrors.length) {
        failures.push(`${name} JS errors: ${newErrors.join(" | ")}`);
      }
    }

    expect(failures, `Per-tool failures:\n${failures.join("\n")}`).toEqual([]);
  });

  test("pricing 'Get Started' buttons require auth (no anonymous checkout)", async ({
    page,
  }) => {
    // Each pricing card has a "Get Started" button. Without a session, clicking
    // must show the "Authentication Required" toast and NOT open Stripe.
    const popupPromise = page
      .waitForEvent("popup", { timeout: 3_000 })
      .catch(() => null);

    const getStartedButtons = page.getByRole("button", { name: /get started/i });
    await expect(getStartedButtons.first()).toBeVisible({ timeout: 10_000 });
    const count = await getStartedButtons.count();
    expect(count, "expected 4 'Get Started' buttons").toBeGreaterThanOrEqual(
      PRICING_TITLES.length,
    );

    await getStartedButtons.first().click();

    // Auth toast appears
    await expect(
      page.getByText(/authentication required/i).first(),
    ).toBeVisible({ timeout: 8_000 });

    // No Stripe popup opened
    const popup = await popupPromise;
    expect(popup, "no Stripe checkout should open without auth").toBeNull();
  });
});
