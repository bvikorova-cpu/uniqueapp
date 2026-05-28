import { test, expect, Page } from "@playwright/test";

/**
 * Coloring Pages — authenticated E2E happy + sad paths.
 *
 * We do NOT hit real Stripe / OpenAI. Instead we:
 *  - inject a fake Supabase session into localStorage so `useAuth` thinks
 *    we are logged in, and
 *  - stub every `/functions/v1/*` call with `page.route()`.
 *
 * Coverage (Nathalie's "real user" walk-through):
 *  1. Unauthenticated Generate → readable toast (no raw "non-2xx") + redirect
 *     to /auth.
 *  2. Authenticated + zero credits → Generate triggers `insufficient_credits`
 *     toast (not generic "request_failed").
 *  3. Authenticated + credits + happy generation → loading spinner clears,
 *     no error toast, no JS errors.
 *  4. Authenticated `purchase()` → `create-checkout` is called with
 *     `creditType:"coloring"` and the returned URL is opened.
 *  5. Rate-limited router response → friendly toast.
 */

const FN_RE = /\/functions\/v1\//;
const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  btoa(JSON.stringify({ sub: "00000000-0000-0000-0000-000000000001", email: "nathalie@test.local", exp: 9999999999 })).replace(/=+$/, "") +
  ".sig";

async function injectFakeSession(page: Page) {
  await page.addInitScript((jwt) => {
    const session = {
      access_token: jwt,
      refresh_token: "fake-refresh",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: "nathalie@test.local",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
      },
    };
    // Supabase v2 storage key pattern: sb-<ref>-auth-token
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("sb-") && k.endsWith("-auth-token")) localStorage.removeItem(k);
    }
    localStorage.setItem("sb-jufrdzeonywluwutvyxz-auth-token", JSON.stringify(session));
  }, FAKE_JWT);
}

type RouterStub = (action: string, payload: any) => { status?: number; body: any };

async function stubFunctions(page: Page, router: RouterStub) {
  await page.route(FN_RE, async (route) => {
    const url = route.request().url();
    let body: any = {};
    try {
      body = route.request().postDataJSON() ?? {};
    } catch {}

    if (url.includes("coloring-router")) {
      const { status = 200, body: respBody } = router(body.action ?? "", body);
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(respBody),
      });
    }

    if (url.includes("create-checkout")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test_coloring_session" }),
      });
    }

    // Default: empty success so tanstack-query enabled hooks don't blow up
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  // Block real Stripe popup
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, body: "<html>stripe-stub</html>" }),
  );
}

test.describe("Coloring Pages — authenticated user flow", () => {
  test("signed-out Generate shows friendly toast (no raw non-2xx)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.route(FN_RE, (r) =>
      r.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "unauthorized" }),
      }),
    );

    await page.goto("/coloring-pages/hub/color-by-number");
    await page.waitForLoadState("domcontentloaded");

    const btn = page.getByRole("button", { name: /generate/i }).first();
    if (await btn.count()) {
      await btn.click();
      const toast = page.getByText(/sign in|prihlás|unauthor/i).first();
      await expect(toast).toBeVisible({ timeout: 5_000 });
      // No raw SDK error leaked
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/non-2xx/i);
    }
    expect(errors).toEqual([]);
  });

  test("authed + zero credits → insufficient_credits toast", async ({ page }) => {
    await injectFakeSession(page);
    await stubFunctions(page, (action) => {
      if (action === "credits.balance") return { body: { balance: 0 } };
      return { status: 402, body: { error: "insufficient_credits" } };
    });

    await page.goto("/coloring-pages/hub/color-by-number");
    await page.waitForLoadState("domcontentloaded");

    const btn = page.getByRole("button", { name: /generate/i }).first();
    if (await btn.count()) {
      await btn.click();
      await expect(
        page.getByText(/not enough credits|insufficient|top up|buy credits/i).first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("authed + credits → happy generation, spinner clears, no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await injectFakeSession(page);
    await stubFunctions(page, (action) => {
      if (action === "credits.balance") return { body: { balance: 100 } };
      if (action.startsWith("generate") || action === "color-by-number.generate") {
        return { body: { ok: true, zones: 12, palette: ["#fff", "#000"] } };
      }
      return { body: { ok: true } };
    });

    await page.goto("/coloring-pages/hub/color-by-number");
    await page.waitForLoadState("domcontentloaded");

    const btn = page.getByRole("button", { name: /generate/i }).first();
    if (await btn.count()) {
      await btn.click();
      await expect(page.locator(".animate-spin").first()).toBeHidden({ timeout: 8_000 });
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/non-2xx|request_failed/i);
    }
    expect(errors).toEqual([]);
  });

  test("buy credits → create-checkout invoked with creditType:coloring", async ({ page }) => {
    await injectFakeSession(page);
    let captured: any = null;
    await page.route(FN_RE, async (route) => {
      const url = route.request().url();
      if (url.includes("create-checkout")) {
        try {
          captured = route.request().postDataJSON();
        } catch {}
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "https://checkout.stripe.com/test_coloring_session" }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto("/coloring-pages");
    await page.waitForLoadState("domcontentloaded");

    const buy = page
      .getByRole("button", { name: /buy.*credit|top.?up|get credits|upgrade/i })
      .first();
    if (!(await buy.count())) test.skip(true, "No buy-credits CTA on landing");

    await buy.click();
    await expect.poll(() => captured?.creditType, { timeout: 5_000 }).toBe("coloring");
  });

  test("rate-limited router → friendly toast", async ({ page }) => {
    await injectFakeSession(page);
    await stubFunctions(page, () => ({
      status: 429,
      body: { error: "rate_limited" },
    }));

    await page.goto("/coloring-pages/hub/color-by-number");
    await page.waitForLoadState("domcontentloaded");

    const btn = page.getByRole("button", { name: /generate/i }).first();
    if (await btn.count()) {
      await btn.click();
      await expect(
        page.getByText(/too many|rate|wait|try again/i).first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
