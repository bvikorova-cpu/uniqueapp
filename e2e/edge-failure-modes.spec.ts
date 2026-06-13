import { test, expect, Route } from "@playwright/test";

/**
 * Failure-mode e2e tests — make sure that when a tool's edge-function call
 * fails (HTTP 500) or times out, the UI:
 *   1. clears any loading spinner (`.animate-spin`, `aria-busy`),
 *   2. surfaces a user-visible error state (toast or inline error text),
 *   3. keeps the page interactive (Back-to-Hub button + retry possible).
 *
 * We intercept Supabase Edge Function calls via page.route() and either:
 *   - reply with HTTP 500 + JSON error, or
 *   - never resolve (simulating timeout) — Playwright still allows the test
 *     to assert the spinner disappears once the client-side timeout fires
 *     OR within a reasonable window.
 *
 * No real edge functions are called and no auth is required.
 */

const SUPABASE_FN = /\/functions\/v1\//;

async function expectNoStuckSpinner(page: any, label: string) {
  // No element should keep aria-busy=true forever
  await expect(
    page.locator('[aria-busy="true"]'),
    `${label}: aria-busy must clear`,
  ).toHaveCount(0, { timeout: 15_000 });

  // No animate-spin should remain visible after the failure surfaces
  await expect(
    page.locator(".animate-spin").first(),
    `${label}: .animate-spin must hide`,
  ).toBeHidden({ timeout: 15_000 });
}

async function expectErrorSurface(page: any, label: string) {
  // Accept either a toast (sonner / shadcn) OR inline error text containing
  // common failure keywords. Match case-insensitively across the page.
  const errorRegex =
    /(error|failed|something went wrong|try again|nepodarilo|chyba|timeout)/i;
  await expect(
    page.getByText(errorRegex).first(),
    `${label}: must show a user-facing error`,
  ).toBeVisible({ timeout: 15_000 });
}

test.describe.skip("Crystal hub — edge function failures don't deadlock the UI", () => {
  test("HTTP 500 from any crystal edge function clears spinner + shows error", async ({
    page,
  }) => {
    // Force every supabase edge call to fail with 500
    await page.route(SUPABASE_FN, (route: Route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated upstream failure" }),
      }),
    );

    await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });

    // Open a tool that performs an edge call shortly after mount.
    // "AI Energy Reading" mounts CrystalEnergyUpload which only fires on
    // upload, so use "Crystal Sub Box" which has a Subscribe button and
    // also "Daily Crystal Oracle" which fetches on mount.
    await page.getByText("Daily Crystal Oracle", { exact: true }).first().click();

    const back = page.getByRole("button", { name: /back to hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });

    await expectNoStuckSpinner(page, "Daily Crystal Oracle");
    await expectErrorSurface(page, "Daily Crystal Oracle");

    // Page must still be interactive
    await back.click();
    await expect(
      page.getByText("AI Energy Reading", { exact: true }).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("Stalled (timeout) edge call still allows back-navigation", async ({
    page,
  }) => {
    // Hang every edge call — never fulfill. The test ensures the UI doesn't
    // block the user: Back-to-Hub button stays clickable and the spinner
    // either disappears (client-side timeout) or at least never blocks UX.
    await page.route(SUPABASE_FN, async (_route: Route) => {
      // Intentionally never call route.fulfill / route.continue
      await new Promise((r) => setTimeout(r, 25_000));
    });

    await page.goto("/crystal-energy-network", { waitUntil: "domcontentloaded" });
    await page.getByText("Daily Crystal Oracle", { exact: true }).first().click();

    const back = page.getByRole("button", { name: /back to hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });
    await expect(back).toBeEnabled();

    // Even if a spinner is still spinning during the stall, Back-to-Hub
    // must remain usable (no overlay blocking pointer events).
    await back.click();
    await expect(
      page.getByText("AI Energy Reading", { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("DNA hub — edge function failures don't deadlock the UI", () => {
  test("HTTP 500 from create-checkout shows error toast + clears spinner", async ({
    page,
  }) => {
    await page.route(SUPABASE_FN, (route: Route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated checkout failure" }),
      }),
    );

    await page.goto("/dna-memory-network", { waitUntil: "domcontentloaded" });

    // Click the first "Get Started" pricing button. Without a session the
    // app should toast "Authentication Required" BEFORE hitting the edge
    // function — so we also verify the alternative path: the loading state
    // never sticks regardless of which branch fires.
    const getStarted = page.getByRole("button", { name: /get started/i }).first();
    await expect(getStarted).toBeVisible({ timeout: 10_000 });
    await getStarted.click();

    // Some user-facing message must appear (auth required OR error)
    await expect(
      page
        .getByText(
          /(authentication required|error|failed|try again|nepodarilo|chyba)/i,
        )
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // Button label must NOT be stuck on "Processing..."
    await expect(
      page.getByRole("button", { name: /processing/i }),
    ).toHaveCount(0, { timeout: 10_000 });

    // Button must be re-enabled for retry
    await expect(getStarted).toBeEnabled({ timeout: 10_000 });
  });

  test("HTTP 500 inside a DNA tool view clears spinner + stays navigable", async ({
    page,
  }) => {
    await page.route(SUPABASE_FN, (route: Route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated tool failure" }),
      }),
    );

    await page.goto("/dna-memory-network", { waitUntil: "domcontentloaded" });
    // "Digital Offspring" runs an edge call (create-digital-offspring /
    // chat-with-offspring) shortly after mount.
    await page.getByText("Digital Offspring", { exact: true }).first().click();

    const back = page.getByRole("button", { name: /back to dna hub/i });
    await expect(back).toBeVisible({ timeout: 10_000 });

    await expectNoStuckSpinner(page, "Digital Offspring");

    // Either an error toast OR an empty/error state — but Back must work.
    await back.click();
    await expect(
      page.getByText("DNA Analysis", { exact: true }).first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});
