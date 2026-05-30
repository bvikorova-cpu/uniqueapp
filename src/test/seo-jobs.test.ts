/**
 * SEO regression suite. CI fails if a refactor breaks:
 *  - sitemap files (existence + valid XML + sitemap-index references)
 *  - robots.txt sitemap-index pointer
 *  - JobDetailPage canonical + JSON-LD JobPosting + slug redirect logic
 *
 * Mirrors scripts/validate-seo.mjs (prebuild) so failures surface from
 * `bun run test` too, not only from `bun run build`.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

describe("SEO build pipeline", () => {
  it("validate-seo.mjs script passes", () => {
    // Regenerate sitemaps first (offline-safe; writes empty jobs file if DB unreachable).
    execSync("node scripts/generate-sitemap.mjs", { stdio: "pipe" });
    execSync("node scripts/generate-jobs-sitemap.mjs", { stdio: "pipe" });
    const out = execSync("node scripts/validate-seo.mjs", { stdio: "pipe" }).toString();
    expect(out).toMatch(/All SEO checks passed/);
  });

  it("sitemap-index references main sitemap + jobs sitemap", () => {
    const xml = readFileSync("public/sitemap-index.xml", "utf8");
    expect(xml).toMatch(/<sitemapindex/);
    expect(xml).toMatch(/sitemap\.xml/);
    expect(xml).toMatch(/sitemap-jobs(-\d+)?\.xml/);
  });

  it("main sitemap excludes dynamic param routes", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    expect(xml).not.toMatch(/:[a-zA-Z]+/);
    expect(xml).toMatch(/<urlset/);
  });

  it("robots.txt points to sitemap-index", () => {
    const r = readFileSync("public/robots.txt", "utf8");
    expect(r).toMatch(/Sitemap:\s+https?:\/\/[^\s]+sitemap-index\.xml/i);
  });

  it("JobDetailPage emits canonical + JSON-LD JobPosting + UUID→slug redirect", () => {
    const src = readFileSync("src/pages/jobs/JobDetailPage.tsx", "utf8");
    expect(src).toMatch(/rel="canonical"/);
    expect(src).toMatch(/"@type"\s*:\s*"JobPosting"/);
    expect(src).toMatch(/\/jobs\/listing\//);
    expect(src).toMatch(/replace:\s*true/);
  });

  it("JobPosting JSON-LD shape is structurally valid", () => {
    const src = readFileSync("src/pages/jobs/JobDetailPage.tsx", "utf8");
    // Spot-check required JobPosting fields per schema.org.
    for (const field of ["title", "description", "datePosted", "hiringOrganization", "jobLocation"]) {
      expect(src).toMatch(new RegExp(`\\b${field}\\b`));
    }
  });

  it("job-redirect edge function exists and returns 301", () => {
    const path = "supabase/functions/job-redirect/index.ts";
    expect(existsSync(path)).toBe(true);
    const src = readFileSync(path, "utf8");
    expect(src).toMatch(/status:\s*active\s*\?\s*301/);
    expect(src).toMatch(/Location:/);
  });
});
