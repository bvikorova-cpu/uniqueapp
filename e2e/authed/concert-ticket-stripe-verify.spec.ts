/**
 * End-to-end: real Stripe test-card checkout for a concert ticket.
 *
 * Flow:
 *   1. Authenticate via Supabase (reuse E2E account) → get JWT.
 *   2. DELETE any previous purchases for (user, concert) to keep test idempotent
 *      (relies on the "Users can delete their own ticket purchases" RLS policy).
 *   3. POST /functions/v1/create-concert-ticket-checkout → { url, sessionId }.
 *   4. Assert a `pending` row exists with 80/20 split.
 *   5. Drive Playwright through the real Stripe Checkout page with test card
 *      4242 4242 4242 4242 → wait for redirect back to success_url.
 *   6. POST /functions/v1/verify-concert-ticket-payment { sessionId }.
 *   7. Assert the row is `completed` and purchased_at is set.
 *
 * Requires Stripe to be in test mode. Uses stable QA seed IDs from the
 * 20260706055733 migration.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const EMAIL = process.env.E2E_TEST_EMAIL ?? "beata.vikorova@yandex.com";
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? "BiankaDominik25";

// Seeded by supabase/migrations/20260706055733_*.sql
const CONCERT_ID = "0d46571f-ea6e-4fd2-83b4-77f00e23da44";
const TICKET_TYPE_ID = "bd67c3c0-3b95-42f3-a67c-3027727dffe6"; // standard €5

async function signIn(request: APIRequestContext) {
  const res = await request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      data: { email: EMAIL, password: PASSWORD },
    },
  );
  expect(res.ok(), `sign-in failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const json = await res.json();
  return { accessToken: json.access_token as string, userId: json.user.id as string };
}

function authHeaders(token: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const;
}

test.describe("Concert ticket — real Stripe test card checkout + verify", () => {
  test.setTimeout(120_000);

  test("checkout → pay with 4242 → verify flips row to completed", async ({
    browser,
    request,
  }) => {
    // 1. Auth
    const { accessToken, userId } = await signIn(request);

    // 2. Cleanup any prior purchases for this (user, concert)
    const del = await request.delete(
      `${SUPABASE_URL}/rest/v1/concert_ticket_purchases?user_id=eq.${userId}&concert_id=eq.${CONCERT_ID}`,
      { headers: authHeaders(accessToken) },
    );
    expect(del.ok(), `cleanup failed: ${del.status()} ${await del.text()}`).toBeTruthy();

    // 3. Create checkout session
    const createRes = await request.post(
      `${SUPABASE_URL}/functions/v1/create-concert-ticket-checkout`,
      {
        headers: authHeaders(accessToken),
        data: { concertId: CONCERT_ID, ticketTypeId: TICKET_TYPE_ID },
      },
    );
    expect(
      createRes.ok(),
      `create-checkout failed: ${createRes.status()} ${await createRes.text()}`,
    ).toBeTruthy();
    const { url: checkoutUrl, sessionId } = await createRes.json();
    expect(checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    expect(sessionId).toMatch(/^cs_/);
    console.log(`[concert-verify] Stripe session=${sessionId}`);

    // 4. Verify pending row + 80/20 split
    const pendingRes = await request.get(
      `${SUPABASE_URL}/rest/v1/concert_ticket_purchases?stripe_session_id=eq.${sessionId}&select=*`,
      { headers: authHeaders(accessToken) },
    );
    expect(pendingRes.ok()).toBeTruthy();
    const [pending] = await pendingRes.json();
    expect(pending, "pending row missing").toBeTruthy();
    expect(pending.payment_status).toBe("pending");
    expect(Number(pending.musician_amount)).toBeCloseTo(4.0, 2);
    expect(Number(pending.platform_commission)).toBeCloseTo(1.0, 2);
    expect(Number(pending.commission_rate)).toBeCloseTo(0.2, 2);

    // 5. Drive Stripe Checkout with test card 4242 4242 4242 4242
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(checkoutUrl, { waitUntil: "domcontentloaded" });

    // Stripe Checkout may offer multiple payment methods (Card / Bancontact / EPS /
    // Link). Select "Card" if the radio is present so the card fields render.
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    const cardRadio = page
      .getByRole("radio", { name: /card/i })
      .or(page.locator('input[type="radio"][value="card"]'))
      .first();
    if (await cardRadio.count()) {
      await cardRadio.click({ force: true }).catch(() => {});
    }

    const cardInput = page.locator("#cardNumber");
    await expect(cardInput).toBeVisible({ timeout: 30_000 });
    await cardInput.fill("4242 4242 4242 4242");
    await page.locator("#cardExpiry").fill("12 / 34");
    await page.locator("#cardCvc").fill("123");

    const nameInput = page.locator("#billingName");
    if (await nameInput.count()) {
      await nameInput.fill("QA Beata Test");
    }

    // Email is prefilled from checkout session (customer_email); skip if hidden.
    const emailInput = page.locator("#email");
    if (await emailInput.count()) {
      const val = await emailInput.inputValue().catch(() => "");
      if (!val) await emailInput.fill(EMAIL);
    }

    // Country/postal may be required — fill if visible
    const country = page.locator("#billingCountry");
    if (await country.count()) {
      await country.selectOption({ label: "Slovakia" }).catch(() => {});
    }
    const postal = page.locator("#billingPostalCode");
    if (await postal.count()) {
      await postal.fill("81101").catch(() => {});
    }

    // Submit — Stripe uses a button with data-testid="hosted-payment-submit-button"
    const submit = page
      .locator('[data-testid="hosted-payment-submit-button"]')
      .or(page.locator('button[type="submit"]'))
      .first();
    await submit.click();

    // 6. Wait for redirect back to our success URL (contains session_id param
    // or /concert-watch/... success route from oneOffCheckout).
    await page.waitForURL(
      (u) => !u.host.includes("stripe.com") && !u.host.includes("checkout.stripe"),
      { timeout: 60_000 },
    );
    console.log(`[concert-verify] returned to ${page.url()}`);
    await context.close();

    // 7. Call verify endpoint
    const verifyRes = await request.post(
      `${SUPABASE_URL}/functions/v1/verify-concert-ticket-payment`,
      { headers: authHeaders(accessToken), data: { sessionId } },
    );
    expect(
      verifyRes.ok(),
      `verify failed: ${verifyRes.status()} ${await verifyRes.text()}`,
    ).toBeTruthy();
    const verifyJson = await verifyRes.json();
    expect(verifyJson.status).toBe("paid");
    expect(verifyJson.activated).toBe(true);

    // 8. Confirm DB row flipped to completed
    const finalRes = await request.get(
      `${SUPABASE_URL}/rest/v1/concert_ticket_purchases?stripe_session_id=eq.${sessionId}&select=*`,
      { headers: authHeaders(accessToken) },
    );
    const [final] = await finalRes.json();
    expect(final.payment_status).toBe("completed");
    expect(final.purchased_at).toBeTruthy();
    expect(Number(final.musician_amount)).toBeCloseTo(4.0, 2);
    expect(Number(final.platform_commission)).toBeCloseTo(1.0, 2);
  });
});
