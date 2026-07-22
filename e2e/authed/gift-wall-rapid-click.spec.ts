// E2E: Rapid-click guard on SendGiftDialog.
// Verifies that hammering the "Send gift" button never fires more than one
// `send-creator-gift` invocation, so no duplicate pending rows or Stripe
// checkout sessions can be created from the client.
//
// Strategy:
//   1. Stub `send-creator-gift` with an artificial 1.5s delay so the button
//      stays in its `loading` state during the click burst.
//   2. Open a creator profile → Gift Wall → Send Gift dialog.
//   3. Pick the first gift, then click "Send" 10× within ~600ms.
//   4. Assert exactly ONE request reached the edge function.
//
// The dialog's button is `disabled={!selected || loading}`, so this test
// pins that contract. If a regression removes the guard, we see >1 request.
import { test, expect, type Route } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://www.uniqueapp.fun";
const SEND_FN = /\/functions\/v1\/send-creator-gift(\?|$)/;

test("Rapid-click SendGiftDialog fires exactly one send-creator-gift call", async ({ page }) => {
  const sendRequests: string[] = [];
  page.on("request", (req) => {
    if (SEND_FN.test(req.url())) sendRequests.push(req.url());
  });

  // Stub the edge function with a slow success so `loading` stays true
  // during the click burst.
  await page.route(SEND_FN, async (route: Route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "https://checkout.stripe.com/test_stub_rapid_click" }) });
  });
  // Block real Stripe navigation.
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, contentType: "text/html", body: "<html>stub</html>" }),
  );

  // Find any creator profile from InfluKing hub.
  await page.goto(`${BASE}/influ-king`, { waitUntil: "domcontentloaded" });
  const firstCreator = page.locator('a[href^="/creator/"]').first();
  if (!(await firstCreator.count())) test.skip(true, "No creators visible in InfluKing hub");
  const href = await firstCreator.getAttribute("href");
  await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });

  // Open the Send Gift dialog — look for a button that opens it.
  const openDialog = page
    .getByRole("button", { name: /send.*gift|gift/i })
    .first();
  await expect(openDialog).toBeVisible({ timeout: 15_000 });
  await openDialog.click();

  // Pick the first gift tile inside the dialog.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const firstGift = dialog.locator("button").filter({ hasText: /€/ }).first();
  await expect(firstGift).toBeVisible({ timeout: 10_000 });
  await firstGift.click();

  // The Send CTA — text starts with "Send" once a gift is picked.
  const sendBtn = dialog.getByRole("button", { name: /^send /i });
  await expect(sendBtn).toBeEnabled();

  // Rapid-fire 10 clicks in ~600ms. force:true bypasses actionability
  // (the button becomes disabled after click #1, which is exactly the guard
  // we want to prove).
  for (let i = 0; i < 10; i++) {
    await sendBtn.click({ force: true, noWaitAfter: true }).catch(() => {});
    await page.waitForTimeout(60);
  }

  // Wait for the stubbed edge fn to resolve.
  await page.waitForTimeout(2_000);

  expect(
    sendRequests.length,
    `Expected exactly 1 send-creator-gift call, got ${sendRequests.length}. ` +
      `Rapid-click guard is broken — this would create duplicate pending rows and Stripe sessions.`,
  ).toBe(1);
});
