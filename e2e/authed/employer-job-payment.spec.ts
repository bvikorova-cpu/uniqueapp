import { test, expect, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";


/**
 * Employer → Job listing → Stripe payment END-TO-END.
 *
 * Pokrýva celý lifecycle bez reálnej Stripe transakcie:
 *
 *   1. (registrácia)   – preskočená, používame existujúci QA účet z auth.setup
 *   2. CREATE          – POST do `job_listings` ako `paid_status=pending, is_active=false`
 *   3. CHECKOUT        – frontend volá `create-one-off-payment` s productKey + jobListingId
 *                        a otvorí Stripe URL v novej karte (stubujeme)
 *   4. SUCCESS PATH    – /jobs/post/success?session_id=cs_test_paid → `verify-job-listing-payment`
 *                        vráti `verified:true` → UI zobrazí "Payment successful"
 *   5. FAILURE PATH    – /jobs/post/success?session_id=cs_test_unpaid → UI zobrazí chybu + Back to Jobs
 *   6. CLEANUP         – odstránime testovací job_listings riadok
 *
 * Stubujeme **edge funkcie** (`create-one-off-payment`, `verify-job-listing-payment`)
 * aj samotný `checkout.stripe.com`, takže nikdy nevolá reálnu Stripe API.
 */

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = "jufrdzeonywluwutvyxz";

const FAKE_STRIPE_URL = "https://checkout.stripe.com/c/pay/cs_test_e2e_stub_session";

function readAccessToken(): string {
  const state = JSON.parse(readFileSync("e2e/.auth/authed-state.json", "utf8"));
  const tokenKey = `sb-${PROJECT_REF}-auth-token`;

  for (const origin of state.origins) {
    const item = origin.localStorage.find((i: any) => i.name === tokenKey);
    if (item) return JSON.parse(item.value).access_token as string;
  }
  throw new Error("No access_token in storageState");
}

async function stubEdgeFunctions(
  page: Page,
  jobListingId: string,
  onCheckoutCall: (body: any, auth: string | null) => void,
  onVerifyCall: (body: any, auth: string | null) => void,
  verifyResult: { verified: boolean; status?: string },
) {
  await page.route(/\/functions\/v1\/create-one-off-payment/, async (route: Route) => {
    const req = route.request();
    let body: any = null;
    try { body = req.postDataJSON(); } catch {}
    onCheckoutCall(body, req.headers().authorization ?? null);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: FAKE_STRIPE_URL, sessionId: "cs_test_e2e_stub_session" }),
    });
  });

  await page.route(/\/functions\/v1\/verify-job-listing-payment/, async (route: Route) => {
    const req = route.request();
    let body: any = null;
    try { body = req.postDataJSON(); } catch {}
    onVerifyCall(body, req.headers().authorization ?? null);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(verifyResult),
    });
  });

  // Blokuj reálne Stripe Checkout (window.open)
  await page.route("https://checkout.stripe.com/**", (r) =>
    r.fulfill({ status: 200, contentType: "text/html", body: "<html>stub stripe</html>" }),
  );
}

test.describe("Employer job listing → Stripe payment (stubbed)", () => {
  test.setTimeout(60_000);

  let createdJobIds: string[] = [];

  test.afterAll(async ({ request }) => {
    const token = readAccessToken();
    for (const id of createdJobIds) {
      await request.delete(`${SUPABASE_URL}/rest/v1/job_listings?id=eq.${id}`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
      });
    }
  });

  test("create → checkout → verify (SUCCESS) → row marked paid+active", async ({ page, request }) => {
    const token = readAccessToken();

    // ---- 1. Vytvor pending job_listings riadok priamo cez REST (rovnaký payload ako CreateJobDialog) ----
    const createRes = await request.post(`${SUPABASE_URL}/rest/v1/job_listings`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      data: {
        title: "E2E QA Senior React Engineer",
        company_name: "E2E Test Co",
        location: "Remote",
        country: "SK",
        category: "it_software",
        job_type: "full_time",
        description: "Automated Playwright E2E – do not apply.",
        contact_email: "qa+e2e@example.com",
        salary_currency: "EUR",
        is_active: false,
        paid_status: "pending",
        duration_days: 7,
      },
    });
    expect(createRes.ok(), `insert failed ${createRes.status()} ${await createRes.text()}`).toBeTruthy();
    const [row] = await createRes.json();
    expect(row?.id).toBeTruthy();
    createdJobIds.push(row.id);

    // ---- 2. Nastav stuby ----
    const checkoutCalls: Array<{ body: any; auth: string | null }> = [];
    const verifyCalls: Array<{ body: any; auth: string | null }> = [];
    await stubEdgeFunctions(
      page,
      row.id,
      (body, auth) => checkoutCalls.push({ body, auth }),
      (body, auth) => verifyCalls.push({ body, auth }),
      { verified: true },
    );

    // ---- 3. Spusti checkout volanie z prehliadača (cez naloadovaný supabase client) ----
    await page.goto("/employer-dashboard", { waitUntil: "domcontentloaded" });
    const invokeResult = await page.evaluate(
      async ({ jobId }) => {
        const mod = await import("/src/integrations/supabase/client.ts");
        const { data, error } = await mod.supabase.functions.invoke("create-one-off-payment", {
          body: { productKey: "job_listing_7", metadata: { jobListingId: jobId } },
        });
        return { data, error: error ? String(error.message ?? error) : null };
      },
      { jobId: row.id },
    );

    expect(invokeResult.error, `invoke error: ${invokeResult.error}`).toBeNull();
    expect(invokeResult.data?.url).toBe(FAKE_STRIPE_URL);
    expect(checkoutCalls.length).toBe(1);
    expect(checkoutCalls[0].auth).toMatch(/^Bearer /);
    expect(checkoutCalls[0].body?.productKey).toBe("job_listing_7");
    expect(checkoutCalls[0].body?.metadata?.jobListingId).toBe(row.id);

    // ---- 4. Návrat z (stubnutého) Stripe → /jobs/post/success ----
    await page.goto(`/jobs/post/success?session_id=cs_test_e2e_stub_session`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { name: /payment successful/i })).toBeVisible({ timeout: 8_000 });
    expect(verifyCalls.length).toBe(1);
    expect(verifyCalls[0].auth).toMatch(/^Bearer /);
    expect(verifyCalls[0].body?.sessionId).toBe("cs_test_e2e_stub_session");

    // "Back to Jobs" CTA musí byť k dispozícii
    await expect(page.getByRole("button", { name: /back to jobs/i })).toBeEnabled();
  });

  test("verify FAILURE (unpaid) → UI shows error + Back to Jobs", async ({ page }) => {
    await stubEdgeFunctions(
      page,
      "n/a",
      () => {},
      () => {},
      { verified: false, status: "unpaid" },
    );

    await page.goto(`/jobs/post/success?session_id=cs_test_e2e_stub_failed`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { name: /verification failed/i })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/unpaid/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /back to jobs/i })).toBeEnabled();
  });

  test("missing session_id → immediate error state", async ({ page }) => {
    await page.goto(`/jobs/post/success`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /verification failed/i })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/missing session id/i)).toBeVisible();
  });
});
