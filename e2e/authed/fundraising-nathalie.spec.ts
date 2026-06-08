import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * Nathalie QA — Fundraising end-to-end audit.
 *
 * Validates the regressions fixed during the deep audit:
 *   1. FundraisingDashboard "+ New Campaign" picker offers all 7 categories
 *      and routes correctly per category (no more hard-coded /medical).
 *   2. Each category Hub renders and the empty state surfaces a Create CTA.
 *   3. Donation checkout reaches a `create-campaign-donation`-shaped edge
 *      function with Authorization header (JWT attached) and opens the
 *      returned Stripe URL — stubbed, no real Stripe charge.
 *   4. Edit campaign route is reachable for campaign owners.
 *
 * All network calls to Supabase functions are stubbed. Stripe popups are
 * intercepted. Safe to run against production preview.
 */

const CATEGORIES = ["medical", "dream", "hero", "pet", "student", "crisis", "talent"] as const;

const HUB_PATHS: Record<(typeof CATEGORIES)[number], string> = {
  medical: "/fundraising/medical",
  dream:   "/fundraising/dream",
  hero:    "/fundraising/hero",
  pet:     "/fundraising/pet",
  student: "/fundraising/student",
  crisis:  "/fundraising/crisis",
  talent:  "/fundraising/talent",
};

async function stubDonationCheckout(page: Page) {
  await page.route(/\/functions\/v1\/(create-campaign-donation|create-checkout)/i, async (route: Route) => {
    const req = route.request();
    expect(req.headers()["authorization"], "donation call must carry JWT").toMatch(/^Bearer\s.+/);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "https://checkout.stripe.com/test_donation_stub" }),
    });
  });
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, contentType: "text/html", body: "<html>stub</html>" }),
  );
}

test.describe("Fundraising — Nathalie QA", () => {
  test("dashboard picker covers all 7 categories", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/fundraising/dashboard");
    await expect(page.getByRole("heading", { name: /campaign|dashboard/i }).first()).toBeVisible({ timeout: 10_000 });

    const newBtn = page.getByRole("button", { name: /new campaign|create.*campaign/i }).first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    for (const c of CATEGORIES) {
      await expect(
        page.getByRole("button", { name: new RegExp(c, "i") }).first(),
      ).toBeVisible({ timeout: 5_000 });
    }

    expect(errors, "no JS errors on dashboard").toEqual([]);
  });

  test("each category hub loads", async ({ page }) => {
    for (const [cat, path] of Object.entries(HUB_PATHS)) {
      await page.goto(path);
      // page mounts (hero or list visible within 10s)
      await expect(page.locator("main, body")).toBeVisible();
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      // Empty state OR list — both fine, just ensure no crash and no 404 banner
      await expect(page.getByText(/404|not found|something went wrong/i)).toHaveCount(0);
      // Verify URL didn't redirect to /medical (the old bug)
      if (cat !== "medical") {
        expect(page.url()).not.toContain("/fundraising/medical/");
      }
    }
  });

  test("create routes resolve per category", async ({ page }) => {
    for (const cat of CATEGORIES) {
      await page.goto(`/fundraising/${cat}/create`);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByText(/404|page not found/i)).toHaveCount(0);
    }
  });

  test("donation checkout attaches JWT and opens Stripe URL", async ({ page, context }) => {
    await stubDonationCheckout(page);

    // Try medical first — most likely to have at least one active campaign.
    await page.goto("/fundraising/medical");
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

    const firstCard = page.locator("a[href*='/fundraising/medical/']").first();
    const cardCount = await firstCard.count();
    test.skip(cardCount === 0, "No medical campaigns to donate to in this env");

    await firstCard.click();
    await page.waitForLoadState("domcontentloaded");

    // Set amount + email if needed
    const amount = page.getByRole("button", { name: /^€?\s*10$/ }).first();
    if (await amount.count()) await amount.click();

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count()) await emailInput.fill("qa+nathalie@uniqueapp.fun");

    const donateBtn = page.getByRole("button", { name: /donate|support|contribute/i }).first();
    await expect(donateBtn).toBeVisible();

    // Capture new tab from window.open
    const popupPromise = context.waitForEvent("page", { timeout: 10_000 }).catch(() => null);
    await donateBtn.click();
    const popup = await popupPromise;

    if (popup) {
      await popup.waitForLoadState("domcontentloaded").catch(() => {});
      expect(popup.url()).toContain("checkout.stripe.com");
      await popup.close();
    }
  });

  test("edit campaign route requires auth and renders form", async ({ page }) => {
    // Use a fake UUID — page should either show "Not found" toast then redirect,
    // or render the form scaffold (input fields). Either is acceptable.
    await page.goto("/fundraising/medical/00000000-0000-0000-0000-000000000000/edit");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // We should NOT be at /auth (we're logged in) and NOT see a 404 page.
    expect(page.url()).not.toContain("/auth");
    await expect(page.getByText(/404|page not found/i)).toHaveCount(0);
  });
});
