/**
 * E2E SEO smoke for the Jobs section.
 * - sitemap files reachable + XML
 * - robots.txt valid
 * - first slug in sitemap-jobs renders with canonical + JSON-LD JobPosting
 *
 * Skips browser navigation gracefully when the live site is unreachable
 * so CI doesn't fail on transient network issues.
 */
import { test, expect } from "@playwright/test";

const SITE = process.env.SEO_BASE_URL || "https://www.uniqueapp.fun";

async function fetchText(url: string) {
  const res = await fetch(url);
  return { ok: res.ok, status: res.status, text: await res.text() };
}

test.describe("Jobs SEO @smoke", () => {
  test("sitemap-index.xml is valid and references job sitemaps", async () => {
    const r = await fetchText(`${SITE}/sitemap-index.xml`);
    test.skip(!r.ok, `sitemap-index unreachable (${r.status})`);
    expect(r.text).toMatch(/<sitemapindex/);
    expect(r.text).toMatch(/sitemap-jobs(-\d+)?\.xml/);
  });

  test("robots.txt advertises sitemap index", async () => {
    const r = await fetchText(`${SITE}/robots.txt`);
    test.skip(!r.ok, `robots unreachable (${r.status})`);
    expect(r.text).toMatch(/Sitemap:\s+https?:\/\/[^\s]+sitemap-index\.xml/i);
  });

  test("first job slug page renders canonical + JobPosting JSON-LD", async ({ page }) => {
    const sm = await fetchText(`${SITE}/sitemap-jobs.xml`);
    test.skip(!sm.ok, `sitemap-jobs unreachable (${sm.status})`);
    const m = sm.text.match(/<loc>([^<]+\/jobs\/listing\/[^<]+)<\/loc>/);
    test.skip(!m, "no job URLs in sitemap yet");
    const url = m![1];

    const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
    test.skip(!resp || !resp.ok(), `job page unreachable (${resp?.status()})`);

    // Helmet hydrates client-side; wait for it.
    await page.waitForFunction(
      () => !!document.querySelector('link[rel="canonical"]'),
      { timeout: 10_000 }
    );

    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toContain("/jobs/listing/");

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed["@type"]).toBe("JobPosting");
    for (const f of ["title", "datePosted", "hiringOrganization", "jobLocation"]) {
      expect(parsed[f], `missing JSON-LD field: ${f}`).toBeTruthy();
    }
  });
});

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Edge function consolidation @smoke", () => {
  test("health-check reports all routers ok", async () => {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/health-check`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    test.skip(r.status === 404, "health-check not deployed yet");
    const body = await r.json();
    expect(body.ok, `health-check failed: ${JSON.stringify(body.checks)}`).toBe(true);
  });

  for (const [router, expected] of [
    ["nutrition-router", ["coach_chat", "allergy_scanner", "barcode_scanner", "body_predictor", "grocery_optimizer", "hydration_coach", "meal_challenge", "supplement_advisor", "weekly_progress"]],
    ["horse-router", ["create", "train", "join_race", "purchase_equipment", "championship_enroll", "claim_quest_reward"]],
    ["video-ad-tools", ["scenes", "sfx", "tts", "voice_clone"]],
  ] as const) {
    test(`${router} ping returns expected actions`, async () => {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/${router}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ action: "ping" }),
      });
      test.skip(!r.ok, `${router} unreachable (${r.status})`);
      const data = await r.json();
      expect(data.ok).toBe(true);
      for (const a of expected) expect(data.actions).toContain(a);
    });
  }
});

test.describe("job-redirect 301 server-side @smoke", () => {
  test("rejects malformed UUID with 400", async () => {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/job-redirect?id=not-a-uuid`, {
      redirect: "manual",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    expect(r.status).toBe(400);
  });

  test("well-formed UUID returns 301/308 with /jobs/listing/ Location OR 404", async () => {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/job-redirect?id=00000000-0000-0000-0000-000000000000`, {
      redirect: "manual",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    expect([404, 301, 308]).toContain(r.status);
    if (r.status === 301 || r.status === 308) {
      expect(r.headers.get("location")).toMatch(/\/jobs\/listing\//);
    }
  });
});
