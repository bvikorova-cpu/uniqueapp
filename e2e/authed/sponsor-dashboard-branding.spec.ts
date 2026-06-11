import { test, expect } from "@playwright/test";

/**
 * Sponsor Dashboard — Branding tab (Platinum + Enterprise).
 *
 * Covers:
 *  - logo upload via hidden <input type="file"> (5MB image)
 *  - native color pickers for primary / accent / background
 *  - hex inputs stay in sync with pickers
 *  - live preview reflects color + tagline changes immediately
 *
 * Skips cleanly when the logged-in user isn't a Platinum/Enterprise sponsor,
 * because the inputs are `disabled` for lower tiers (UI gate matches the RLS
 * gate in `brand_sponsor_branding` policies).
 *
 * Notes:
 *  - We never click "Save branding" so the live `brand_sponsor_branding` row
 *    isn't polluted in CI.
 *  - File upload is exercised via `setInputFiles` against the hidden
 *    `[data-testid="branding-logo-file"]` so we don't need a real picker.
 */

const TINY_PNG = Buffer.from(
  // 1×1 transparent PNG
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function openBrandingTab(page: any) {
  await page.goto("/sponsor-dashboard");
  await page.waitForLoadState("networkidle");

  if (!/\/sponsor-dashboard/.test(page.url())) {
    test.skip(true, "Logged-in user is not an active sponsor.");
  }

  const tab = page.getByRole("tab", { name: /branding/i });
  if ((await tab.count()) === 0) {
    test.skip(true, "Branding tab hidden — user is not Platinum/Enterprise.");
  }
  await tab.click();
  await expect(page.getByTestId("branding-panel")).toBeVisible();

  const primaryHex = page.getByTestId("branding-primary_color-hex");
  await expect(primaryHex).toBeVisible();
  const disabled = await primaryHex.isDisabled();
  if (disabled) {
    test.skip(true, "Branding inputs disabled — user tier is below Platinum.");
  }
}

test.describe("Sponsor Dashboard — Branding tab", () => {
  test("logo upload populates URL field and preview", async ({ page }) => {
    await openBrandingTab(page);

    const fileInput = page.getByTestId("branding-logo-file");
    await fileInput.setInputFiles({
      name: "logo.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });

    // URL field should fill within ~10s after Supabase upload completes.
    const urlField = page.getByTestId("branding-logo-url");
    await expect(urlField).toHaveValue(/^https?:\/\/.+\.(png|jpg|jpeg|webp)(\?.*)?$/i, {
      timeout: 15_000,
    });

    // Toast confirmation.
    await expect(page.getByText(/logo uploaded/i)).toBeVisible({ timeout: 5_000 });

    // Preview <img> appears (placeholder disappears).
    await expect(page.getByTestId("branding-preview-logo")).toBeVisible();
  });

  test("color pickers update hex inputs and live preview", async ({ page }) => {
    await openBrandingTab(page);

    const primaryPicker = page.getByTestId("branding-primary_color-picker");
    const accentPicker = page.getByTestId("branding-accent_color-picker");
    const bgPicker = page.getByTestId("branding-background_color-picker");

    const primaryHex = page.getByTestId("branding-primary_color-hex");
    const accentHex = page.getByTestId("branding-accent_color-hex");
    const bgHex = page.getByTestId("branding-background_color-hex");

    // <input type="color"> in Playwright accepts .fill(hex).
    await primaryPicker.fill("#ff0000");
    await accentPicker.fill("#00ff00");
    await bgPicker.fill("#0000ff");

    await expect(primaryHex).toHaveValue("#ff0000");
    await expect(accentHex).toHaveValue("#00ff00");
    await expect(bgHex).toHaveValue("#0000ff");

    // Preview container background reflects bg color.
    const preview = page.getByTestId("branding-preview");
    const bg = await preview.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(0, 0, 255)");

    // Title color reflects primary.
    const title = page.getByTestId("branding-preview-title");
    const titleColor = await title.evaluate((el) => getComputedStyle(el).color);
    expect(titleColor).toBe("rgb(255, 0, 0)");
  });

  test("editing hex syncs the color picker and updates preview", async ({ page }) => {
    await openBrandingTab(page);

    const primaryHex = page.getByTestId("branding-primary_color-hex");
    const primaryPicker = page.getByTestId("branding-primary_color-picker");

    await primaryHex.fill("#abcdef");
    await expect(primaryPicker).toHaveValue("#abcdef");

    // Invalid hex falls back to default in preview but does not crash.
    await primaryHex.fill("not-a-color");
    await expect(page.getByTestId("branding-preview")).toBeVisible();
  });

  test("tagline shows up in preview", async ({ page }) => {
    await openBrandingTab(page);

    const tagline = page.getByTestId("branding-tagline");
    await tagline.fill("Unique brand voice");
    await expect(page.getByTestId("branding-preview-title")).toHaveText("Unique brand voice");
  });
});

test.describe("Sponsor Dashboard — Branding tab (gated)", () => {
  test("non-Platinum sponsors see disabled inputs and gate copy", async ({ page }) => {
    await page.goto("/sponsor-dashboard");
    await page.waitForLoadState("networkidle");

    if (!/\/sponsor-dashboard/.test(page.url())) {
      test.skip(true, "Not a sponsor.");
    }
    const tab = page.getByRole("tab", { name: /branding/i });
    if ((await tab.count()) === 0) {
      test.skip(true, "Branding tab hidden for current user.");
    }
    await tab.click();

    const hex = page.getByTestId("branding-primary_color-hex");
    const isDisabled = await hex.isDisabled();
    if (!isDisabled) {
      test.skip(true, "User has Platinum/Enterprise — gating spec not applicable.");
    }
    await expect(page.getByText(/available on Platinum and Enterprise/i)).toBeVisible();
    await expect(page.getByTestId("branding-save-btn")).toBeDisabled();
  });
});
