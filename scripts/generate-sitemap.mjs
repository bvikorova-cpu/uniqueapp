#!/usr/bin/env node
/**
 * Auto-generate public/sitemap.xml from <Route path="..."> declarations in src/App.tsx.
 * - Excludes private/admin/dynamic routes
 * - Run manually or as a prebuild step: `node scripts/generate-sitemap.mjs`
 */
import { readFileSync, writeFileSync } from "node:fs";

const APP_TSX = "src/App.tsx";
const OUT = "public/sitemap.xml";
const SITE_URL = "https://uniqueapp.fun";

const EXCLUDE_PATTERNS = [
  /:[\w]+/,                    // dynamic params
  /^\/admin/,
  /^\/messenger/,
  /^\/settings/,
  /^\/auth/,
  /^\/reset-password/,
  /^\/verify/,
  /^\/onboarding/,
  /^\/checkout/,
  /^\/billing/,
  /^\/profile\//,
  /\*$/,
  /^\*$/,
];

const HIGH_PRIORITY = new Set(["/", "/discover", "/marketplace", "/bazaar", "/pricing", "/ai-credits-store", "/ai-generation"]);

const src = readFileSync(APP_TSX, "utf8");
const matches = [...src.matchAll(/<Route\s+path=["']([^"']+)["']/g)];
const seen = new Set();
const routes = [];

for (const m of matches) {
  const p = m[1];
  if (!p.startsWith("/")) continue;
  if (EXCLUDE_PATTERNS.some((rx) => rx.test(p))) continue;
  if (seen.has(p)) continue;
  seen.add(p);
  routes.push(p);
}
routes.sort();

const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((p) => {
    const priority = p === "/" ? "1.0" : HIGH_PRIORITY.has(p) ? "0.8" : "0.6";
    const freq = p === "/" || HIGH_PRIORITY.has(p) ? "daily" : "weekly";
    return `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
  }),
  "</urlset>",
  "",
].join("\n");

writeFileSync(OUT, xml, "utf8");
console.log(`✓ Wrote ${routes.length} URLs to ${OUT}`);
