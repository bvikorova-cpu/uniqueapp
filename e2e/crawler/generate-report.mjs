/**
 * Post-process the raw crawler report into:
 *   - report.html  (browsable, sorted by failure count, with screenshots)
 *   - summary.md   (top failing routes + counts, for PR comments)
 *
 * Run after the crawler spec finishes:
 *   node e2e/crawler/generate-report.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = "e2e/crawler-report";
const RAW = join(DIR, "report.json");
if (!existsSync(RAW)) {
  console.error("No crawler report found at", RAW);
  process.exit(1);
}

const results = JSON.parse(readFileSync(RAW, "utf8"));

const totalRoutes = results.length;
const failedRoutes = results.filter((r) => !r.ok);
const totalClicks = results.reduce((n, r) => n + (r.clicksAttempted || 0), 0);
const totalClickFails = results.reduce(
  (n, r) => n + (r.clicks || []).filter((c) => !c.ok).length,
  0,
);
const totalPageErrors = results.reduce((n, r) => n + r.pageErrors.length, 0);
const totalFailedResponses = results.reduce((n, r) => n + r.failedResponses.length, 0);

const worst = [...failedRoutes]
  .map((r) => ({
    ...r,
    _score:
      r.pageErrors.length * 3 +
      r.failedResponses.length * 2 +
      r.clicks.filter((c) => !c.ok && c.reason !== "skipped_destructive").length,
  }))
  .sort((a, b) => b._score - a._score);

const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const rowsHtml = worst
  .map(
    (r) => `<tr>
      <td><code>${escape(r.route)}</code></td>
      <td>${r.elementsFound}</td>
      <td>${r.clicksAttempted}</td>
      <td>${r.clicks.filter((c) => !c.ok).length}</td>
      <td>${r.pageErrors.length}</td>
      <td>${r.failedResponses.length}</td>
      <td>${r.screenshot ? `<a href="${escape(r.screenshot.replace(DIR + "/", ""))}">screenshot</a>` : ""}</td>
      <td><details><summary>details</summary>
        <pre>${escape(JSON.stringify({
          pageErrors: r.pageErrors,
          failedResponses: r.failedResponses,
          failedClicks: r.clicks.filter((c) => !c.ok),
        }, null, 2))}</pre>
      </details></td>
    </tr>`,
  )
  .join("\n");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>All-buttons crawler report</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:24px;max-width:1400px}
h1{margin-top:0}.k{color:#666}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:6px 8px;vertical-align:top;text-align:left}
th{background:#f6f6f6}pre{white-space:pre-wrap;max-width:700px;font-size:12px}
tr:nth-child(even){background:#fafafa}</style></head><body>
<h1>All-buttons crawler report</h1>
<p class="k">
  Routes: <b>${totalRoutes}</b> ·
  OK: <b>${totalRoutes - failedRoutes.length}</b> ·
  Failed: <b>${failedRoutes.length}</b> ·
  Clicks attempted: <b>${totalClicks}</b> ·
  Click failures: <b>${totalClickFails}</b> ·
  Page errors: <b>${totalPageErrors}</b> ·
  5xx / network fails: <b>${totalFailedResponses}</b>
</p>
<table>
<thead><tr><th>Route</th><th>Elements</th><th>Clicks</th><th>Click fails</th><th>JS errors</th><th>Net fails</th><th>Shot</th><th>Details</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
</body></html>`;

writeFileSync(join(DIR, "report.html"), html);

const md = `# Crawler summary

- Routes: **${totalRoutes}** (failed: **${failedRoutes.length}**)
- Clicks attempted: **${totalClicks}** (failed: **${totalClickFails}**)
- Uncaught JS errors: **${totalPageErrors}**
- 5xx / network fails: **${totalFailedResponses}**

## Top failing routes
${worst
  .slice(0, 30)
  .map(
    (r) =>
      `- \`${r.route}\` — clickFails=${r.clicks.filter((c) => !c.ok).length}, jsErr=${r.pageErrors.length}, netFail=${r.failedResponses.length}`,
  )
  .join("\n")}
`;
writeFileSync(join(DIR, "summary.md"), md);

console.log(`Wrote ${join(DIR, "report.html")} and ${join(DIR, "summary.md")}`);
