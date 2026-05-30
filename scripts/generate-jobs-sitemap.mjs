#!/usr/bin/env node
/**
 * Generates paginated sitemap files for /jobs/listing/:slug URLs and a
 * sitemap index that ties the main route sitemap + job sitemaps together.
 *
 * - Reads active job listings from the Supabase Data API (anon key, RLS-safe view).
 * - Splits into chunks of MAX_URLS_PER_FILE (Google limit is 50k; we use 10k).
 * - Writes public/sitemap-jobs-N.xml + public/sitemap-index.xml.
 * - Falls back gracefully (writes an empty jobs sitemap) when Supabase is
 *   unreachable so the build never breaks offline.
 */
import { writeFileSync, existsSync } from "node:fs";

const SITE_URL = "https://uniqueapp.fun";
const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const MAX_URLS_PER_FILE = 10_000;
const PAGE_SIZE = 1000; // PostgREST default cap

async function fetchAllJobs() {
  const all = [];
  let from = 0;
  // Hard ceiling to avoid runaway loops.
  for (let page = 0; page < 100; page++) {
    const to = from + PAGE_SIZE - 1;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/job_listings_public?select=slug,id,updated_at&order=updated_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          Range: `${from}-${to}`,
          "Range-Unit": "items",
        },
      }
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildJobsSitemap(rows) {
  const urls = rows
    .filter((r) => r.slug || r.id)
    .map((r) => {
      const slug = r.slug || r.id;
      const lastmod = (r.updated_at || new Date().toISOString()).slice(0, 10);
      return `  <url><loc>${SITE_URL}/jobs/listing/${encodeURIComponent(slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

function buildSitemapIndex(files) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = files.map(
    (f) =>
      `  <sitemap><loc>${SITE_URL}/${f}</loc><lastmod>${today}</lastmod></sitemap>`
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</sitemapindex>",
    "",
  ].join("\n");
}

(async () => {
  let rows = [];
  try {
    rows = await fetchAllJobs();
    console.log(`✓ Fetched ${rows.length} active job listings`);
  } catch (err) {
    console.warn(`⚠ Jobs sitemap: skipping live fetch (${err.message}). Writing empty file.`);
  }

  const parts = rows.length ? chunk(rows, MAX_URLS_PER_FILE) : [[]];
  const jobFiles = [];
  parts.forEach((part, i) => {
    const name = parts.length > 1 ? `sitemap-jobs-${i + 1}.xml` : "sitemap-jobs.xml";
    writeFileSync(`public/${name}`, buildJobsSitemap(part), "utf8");
    jobFiles.push(name);
    console.log(`✓ Wrote ${part.length} job URLs to public/${name}`);
  });

  // Sitemap index: main routes + paginated job files.
  const indexFiles = [];
  if (existsSync("public/sitemap.xml")) indexFiles.push("sitemap.xml");
  indexFiles.push(...jobFiles);
  writeFileSync("public/sitemap-index.xml", buildSitemapIndex(indexFiles), "utf8");
  console.log(`✓ Wrote sitemap index (${indexFiles.length} files) to public/sitemap-index.xml`);
})();
