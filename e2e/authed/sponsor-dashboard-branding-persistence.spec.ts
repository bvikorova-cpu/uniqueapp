import { test, expect, type Page } from "@playwright/test";

/**
 * Sponsor Dashboard — Branding tab (persistence).
 *
 * Logs in as the configured QA user, opens the Branding tab, edits tagline +
 * primary color (+ optional logo upload), clicks "Save branding" and verifies
 * the toast. Then reloads the page and asserts the values are still present
 * in the form inputs AND reflected in the live preview.
 *
 * Hard skips when the user is not a Platinum/Enterprise sponsor (RLS would
 * reject the write and inputs are disabled in the UI).
 *
 * Cleanup: restores the original tagline + color after the test so repeated
 * runs in CI don't accumulate noise on the live row.
 */

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function openBrandingTab(page: Page): Promise<"ok" | "skip"> {
  await page.goto("/sponsor-dashboard");
  await page.waitForLoadState("networkidle");
  if (!/\/sponsor-dashboard/.test(page.url())) return "skip";

  const tab = page.getByRole("tab", { name: /branding/i });
  if ((await tab.count()) === 0) return "skip";
  await tab.click();
  await expect(page.getByTestId("branding-panel")).toBeVisible();

  const disabled = await page.getByTestId("branding-primary_color-hex").isDisabled();
  if (disabled) return "skip";
  return "ok";
}

test.describe("Sponsor Dashboard — Branding persistence", () => {
  test("Save persists tagline + primary color and survives reload", async ({ page }) => {
    if ((await openBrandingTab(page)) === "skip") {
      test.skip(true, "User is not Platinum/Enterprise sponsor.");
    }

    const taglineInput = page.getByTestId("branding-tagline");
    const primaryHex = page.getByTestId("branding-primary_color-hex");
    const primaryPicker = page.getByTestId("branding-primary_color-picker");
    const saveBtn = page.getByTestId("branding-save-btn");

    // Snapshot originals so we can restore.
    const originalTagline = (await taglineInput.inputValue()) || "";
    const originalPrimary = (await primaryHex.inputValue()) || "";

    const unique = `QA brand ${Date.now()}`;
    const newColor = "#22c55e"; // tailwind green-500 — distinct from defaults

    await taglineInput.fill(unique);
    await primaryPicker.fill(newColor);
    await expect(primaryHex).toHaveValue(newColor);

    // Preview reacts immediately (sanity check before save).
    await expect(page.getByTestId("branding-preview-title")).toHaveText(unique);

    await saveBtn.click();
    await expect(page.getByText(/branding saved/i)).toBeVisible({ timeout: 10_000 });

    // --- Reload and verify persistence ---
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: /branding/i }).click();
    await expect(page.getByTestId("branding-panel")).toBeVisible();

    await expect(page.getByTestId("branding-tagline")).toHaveValue(unique);
    await expect(page.getByTestId("branding-primary_color-hex")).toHaveValue(newColor);

    // Preview reflects persisted values after fresh load.
    await expect(page.getByTestId("branding-preview-title")).toHaveText(unique);
    const titleColor = await page
      .getByTestId("branding-preview-title")
      .evaluate((el) => getComputedStyle(el).color);
    expect(titleColor).toBe("rgb(34, 197, 94)"); // #22c55e

    // --- Cleanup: restore originals so CI runs stay idempotent ---
    await page.getByTestId("branding-tagline").fill(originalTagline);
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(originalPrimary)) {
      await page.getByTestId("branding-primary_color-picker").fill(originalPrimary);
    } else {
      await page.getByTestId("branding-primary_color-hex").fill("");
    }
    await page.getByTestId("branding-save-btn").click();
    await expect(page.getByText(/branding saved/i)).toBeVisible({ timeout: 10_000 });
  });

  test("Logo upload + Save persists logo_url and renders in preview after reload", async ({ page }) => {
    if ((await openBrandingTab(page)) === "skip") {
      test.skip(true, "User is not Platinum/Enterprise sponsor.");
    }

    const logoUrl = page.getByTestId("branding-logo-url");
    const originalLogoUrl = (await logoUrl.inputValue()) || "";

    await page.getByTestId("branding-logo-file").setInputFiles({
      name: "logo.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });

    // Wait for upload to populate URL field.
    await expect(logoUrl).toHaveValue(/^https?:\/\/.+\.(png|jpg|jpeg|webp)(\?.*)?$/i, {
      timeout: 15_000,
    });
    const uploadedUrl = await logoUrl.inputValue();

    await page.getByTestId("branding-save-btn").click();
    await expect(page.getByText(/branding saved/i)).toBeVisible({ timeout: 10_000 });

    // Reload + verify the logo URL is the same one we just uploaded and the
    // preview <img> renders it.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: /branding/i }).click();

    await expect(page.getByTestId("branding-logo-url")).toHaveValue(uploadedUrl);
    const previewLogo = page.getByTestId("branding-preview-logo");
    await expect(previewLogo).toBeVisible();
    await expect(previewLogo).toHaveAttribute("src", uploadedUrl);

    // Cleanup: restore original logo URL.
    await page.getByTestId("branding-logo-url").fill(originalLogoUrl);
    await page.getByTestId("branding-save-btn").click();
    await expect(page.getByText(/branding saved/i)).toBeVisible({ timeout: 10_000 });
  });
});
