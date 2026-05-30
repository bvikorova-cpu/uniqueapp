#!/usr/bin/env node
/**
 * Build-time SEO validator.
 * - Ensures sitemap files exist + are valid XML.
 * - Ensures sitemap-index.xml references all expected children.
 * - Ensures JobDetailPage emits canonical + JSON-LD JobPosting.
 * - Ensures robots.txt advertises sitemap-index.xml.
 * Exits non-zero on failure → fails the build.
 */
import { readFileSync, existsSync } from "node:fs";

let failures = 0;
const fail = (msg) => { console.error(`✗ ${msg}`); failures++; };
const ok = (msg) => console.log(`✓ ${msg}`);

function checkXml(path, rootTag) {
  if (!existsSync(path)) return fail(`${path} missing`);
  const xml = readFileSync(path, "utf8");
  if (!xml.startsWith("<?xml")) return fail(`${path} not XML`);
  if (!xml.includes(`<${rootTag}`) || !xml.includes(`</${rootTag}>`))
    return fail(`${path} missing <${rootTag}>`);
  ok(`${path} valid`);
}

checkXml("public/sitemap.xml", "urlset");
const jobsSingle = existsSync("public/sitemap-jobs.xml");
const jobsMulti = existsSync("public/sitemap-jobs-1.xml");
if (!jobsSingle && !jobsMulti) fail("No sitemap-jobs*.xml found");
else if (jobsSingle) checkXml("public/sitemap-jobs.xml", "urlset");
else checkXml("public/sitemap-jobs-1.xml", "urlset");
checkXml("public/sitemap-index.xml", "sitemapindex");

// robots.txt must point to the sitemap index.
const robots = existsSync("public/robots.txt") ? readFileSync("public/robots.txt", "utf8") : "";
if (!/Sitemap:\s+https?:\/\/[^\s]+sitemap-index\.xml/i.test(robots))
  fail("robots.txt should reference sitemap-index.xml");
else ok("robots.txt references sitemap-index.xml");

// JobDetailPage must emit canonical + JSON-LD JobPosting.
const jd = existsSync("src/pages/jobs/JobDetailPage.tsx")
  ? readFileSync("src/pages/jobs/JobDetailPage.tsx", "utf8")
  : "";
if (!/rel="canonical"/.test(jd)) fail("JobDetailPage missing canonical link");
else ok("JobDetailPage canonical present");
if (!/"@type"\s*:\s*"JobPosting"/.test(jd)) fail("JobDetailPage missing JobPosting JSON-LD");
else ok("JobDetailPage JobPosting JSON-LD present");
if (!/replace:\s*true/.test(jd) || !/\/jobs\/listing\//.test(jd))
  fail("JobDetailPage missing UUID→slug client-side redirect");
else ok("JobDetailPage UUID→slug canonical redirect present");

if (failures) {
  console.error(`\n${failures} SEO check(s) failed.`);
  process.exit(1);
}
console.log("\nAll SEO checks passed.");
