#!/usr/bin/env node
/**
 * Reads the Playwright JSON report at e2e/crawler-report/authed-results.json
 * (produced by the "json" reporter in playwright.config.ts) and writes a
 * compact human-readable summary + machine-readable JSON next to the crawler
 * report so the AdminCrawler UI can surface authed suite health alongside
 * the click-crawler output.
 *
 * Outputs:
 *   e2e/crawler-report/authed-summary.json
 *   e2e/crawler-report/authed-summary.md
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const INPUT = "e2e/crawler-report/authed-results.json";
const OUT_JSON = "e2e/crawler-report/authed-summary.json";
const OUT_MD = "e2e/crawler-report/authed-summary.md";

if (!existsSync(INPUT)) {
  console.error(`[authed-summary] no ${INPUT} — run playwright first.`);
  process.exit(0);
}

const raw = JSON.parse(readFileSync(INPUT, "utf8"));

type Entry = { file: string; title: string; status: string; durationMs: number; error?: string };
const entries: Entry[] = [];

function walk(suite: any, file: string) {
  const f = suite.file || file || "";
  for (const spec of suite.specs || []) {
    for (const r of spec.tests || []) {
      const last = r.results?.[r.results.length - 1];
      entries.push({
        file: f,
        title: spec.title,
        status: last?.status || "unknown",
        durationMs: last?.duration || 0,
        error: last?.error?.message?.slice(0, 400),
      });
    }
  }
  for (const s of suite.suites || []) walk(s, f);
}
for (const s of raw.suites || []) walk(s, s.file);

const passed = entries.filter((e) => e.status === "passed").length;
const failed = entries.filter((e) => e.status === "failed" || e.status === "timedOut").length;
const skipped = entries.filter((e) => e.status === "skipped").length;

const byFile: Record<string, { pass: number; fail: number; skip: number }> = {};
for (const e of entries) {
  const k = e.file.replace(/^.*\/e2e\//, "e2e/");
  byFile[k] ||= { pass: 0, fail: 0, skip: 0 };
  if (e.status === "passed") byFile[k].pass++;
  else if (e.status === "failed" || e.status === "timedOut") byFile[k].fail++;
  else byFile[k].skip++;
}

const summary = {
  generatedAt: new Date().toISOString(),
  totals: { passed, failed, skipped, total: entries.length },
  byFile,
  failures: entries
    .filter((e) => e.status === "failed" || e.status === "timedOut")
    .map((e) => ({ file: e.file, title: e.title, error: e.error })),
};

writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));

const md = [
  "# Authed suite summary",
  "",
  `- Total: **${entries.length}** — passed: **${passed}** · failed: **${failed}** · skipped: **${skipped}**`,
  `- Generated: ${summary.generatedAt}`,
  "",
  "## By file",
  ...Object.entries(byFile)
    .sort()
    .map(([f, s]) => `- \`${f}\` — pass ${s.pass} · fail ${s.fail} · skip ${s.skip}`),
  "",
  "## Failures",
  ...(summary.failures.length === 0
    ? ["_None._"]
    : summary.failures.map((f) => `- **${f.title}** (${f.file})\n  \`${(f.error || "").replace(/\n/g, " ")}\``)),
];
writeFileSync(OUT_MD, md.join("\n"));

console.log(`[authed-summary] wrote ${OUT_JSON} & ${OUT_MD} — ${passed}/${entries.length} passed`);
