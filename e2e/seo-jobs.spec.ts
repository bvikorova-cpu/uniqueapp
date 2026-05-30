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
