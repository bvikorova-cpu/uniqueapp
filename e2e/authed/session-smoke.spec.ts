import { test, expect } from "@playwright/test";

/**
 * Authenticated session sanity check — proves the storageState injected by
 * `auth.setup.ts` actually produces a signed-in user inside the SPA.
 *
 * If this test fails, every other spec under e2e/authed/** is meaningless,
 * so we keep the assertions narrow but strict.
 */
test.describe("authed session smoke", () => {
  test("homepage exposes a logged-in user (no Sign In CTA)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // The avatar / account menu should be reachable; the prominent "Sign in"
    // CTA that anonymous users see in the header MUST NOT be the only entry.
    const signIn = page.getByRole("link", { name: /^sign in$/i });
    // A header link literally labelled "Sign In" should not exist for an
    // authenticated user. Allow it inside footer/legal sections by limiting
    // to header role.
    const headerSignIn = page.locator("header").getByRole("link", { name: /^sign in$/i });
    await expect(headerSignIn).toHaveCount(0, { timeout: 10_000 });

    // Supabase token cookie / localStorage must be present.
    const hasSession = await page.evaluate(() => {
      return Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    });
    expect(hasSession, "supabase session key missing in localStorage").toBe(true);

    // Probe was useful while debugging.
    void signIn;
  });
});
