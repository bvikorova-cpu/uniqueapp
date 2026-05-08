#!/usr/bin/env node
/**
 * Static route checker.
 *
 * Extracts all <Route path="..."> from src/App.tsx and scans the codebase
 * for navigate("...") and to="..." literals. Reports any that do not
 * resolve to a defined route. Dynamic segments (e.g. /user/:id) and
 * wildcards (*) are matched against the patterns.
 *
 * Usage: node scripts/check-routes.mjs [--strict]
 *   --strict  exit with code 1 when unknown routes are found.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const APP = path.join(SRC, "App.tsx");

function readAllFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) readAllFiles(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function extractRoutes(appSource) {
  const routes = new Set(["/", "*"]);
  // <Route path="..."> — supports double or single quotes
  const re = /<Route[^>]*\spath\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(appSource))) routes.add(m[1].startsWith("/") ? m[1] : "/" + m[1]);
  // Navigate to="..."
  const re2 = /<Navigate[^>]*\sto\s*=\s*["']([^"']+)["']/g;
  while ((m = re2.exec(appSource))) routes.add(m[1].split("?")[0].split("#")[0]);
  return [...routes];
}

function toMatcher(pattern) {
  // Strip query/hash and trailing slash
  const clean = pattern.replace(/\/$/, "") || "/";
  if (clean === "*") return () => true;
  const segs = clean.split("/");
  return (pathStr) => {
    const p = (pathStr.split("?")[0].split("#")[0].replace(/\/$/, "") || "/");
    if (segs.includes("*")) {
      // wildcard suffix
      const idx = segs.indexOf("*");
      const prefix = segs.slice(0, idx).join("/") || "/";
      return p.startsWith(prefix);
    }
    const ps = p.split("/");
    if (ps.length !== segs.length) return false;
    return segs.every((s, i) => s.startsWith(":") || s === ps[i]);
  };
}

function isLikelyExternal(target) {
  return /^(https?:|mailto:|tel:|#|\?|\$\{|`)/.test(target);
}

function isTemplateOrDynamic(target) {
  return target.includes("${") || target.includes("`");
}

function scanFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const hits = [];
  // navigate("..."), navigate(`...`)
  const reNav = /\bnavigate\s*\(\s*(["'`])([^"'`]+)\1/g;
  // to="..." in JSX (skip dynamic to={...})
  const reTo = /\sto\s*=\s*(["'])([^"']+)\1/g;
  // href="/..." (internal-looking)
  const reHref = /\shref\s*=\s*(["'])(\/[^"']*)\1/g;
  let m;
  while ((m = reNav.exec(src))) hits.push({ kind: "navigate", target: m[2], file });
  while ((m = reTo.exec(src))) hits.push({ kind: "to", target: m[2], file });
  while ((m = reHref.exec(src))) hits.push({ kind: "href", target: m[2], file });
  return hits;
}

function main() {
  const strict = process.argv.includes("--strict");
  const appSrc = fs.readFileSync(APP, "utf8");
  const routes = extractRoutes(appSrc);
  const matchers = routes.map((r) => ({ pattern: r, match: toMatcher(r) }));

  const files = readAllFiles(SRC);
  const allHits = files.flatMap(scanFile);

  const unknown = new Map(); // target -> [{file, kind}]
  for (const h of allHits) {
    if (!h.target.startsWith("/")) continue;
    if (isLikelyExternal(h.target) || isTemplateOrDynamic(h.target)) continue;
    const target = h.target.split("?")[0].split("#")[0];
    const ok = matchers.some((r) => r.match(target));
    if (!ok) {
      const arr = unknown.get(target) || [];
      arr.push({ file: path.relative(ROOT, h.file), kind: h.kind });
      unknown.set(target, arr);
    }
  }

  console.log(`Route check: ${routes.length} routes defined, scanned ${files.length} files, ${allHits.length} link/navigate calls.`);

  if (unknown.size === 0) {
    console.log("✅ All internal links resolve to defined routes.");
    return;
  }

  console.warn(`⚠️  Found ${unknown.size} unknown route target(s):`);
  for (const [target, uses] of [...unknown.entries()].sort()) {
    console.warn(`\n  ${target}`);
    for (const u of uses.slice(0, 5)) console.warn(`    - ${u.kind} @ ${u.file}`);
    if (uses.length > 5) console.warn(`    … and ${uses.length - 5} more`);
  }

  if (strict) process.exit(1);
}

main();
