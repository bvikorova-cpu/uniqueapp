/**
 * Merge per-shard crawler reports into a single report.json + HTML/markdown summary.
 *
 * Expected layout after actions/download-artifact:
 *   shards/crawler-shard-0/e2e/crawler-report/report.json
 *   shards/crawler-shard-0/e2e/crawler-report/screenshots/*.png
 *   shards/crawler-shard-1/...
 *
 * Output:
 *   e2e/crawler-report/report.json
 *   e2e/crawler-report/screenshots/*.png
 *   e2e/crawler-report/report.html
 *   e2e/crawler-report/summary.md
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = "e2e/crawler-report";
const OUT_FILE = join(OUT_DIR, "report.json");
const SHOTS_DIR = join(OUT_DIR, "screenshots");
const SHARDS_BASE = "shards";

function findShardReports() {
  const paths = [];
  if (!existsSync(SHARDS_BASE)) return paths;
  for (const dir of readdirSync(SHARDS_BASE)) {
    const report = join(SHARDS_BASE, dir, "e2e/crawler-report/report.json");
    if (existsSync(report)) paths.push(report);
  }
  return paths;
}

function merge() {
  mkdirSync(SHOTS_DIR, { recursive: true });

  const shardReports = findShardReports();
  if (shardReports.length === 0) {
    console.log("No shard reports found in", SHARDS_BASE, "— looking for a single report.json");
    if (existsSync(OUT_FILE)) {
      console.log("Found", OUT_FILE, "— generating HTML only.");
      return;
    }
    console.error("No report.json to process.");
    process.exit(1);
  }

  console.log(`Merging ${shardReports.length} shard reports...`);

  const byRoute = new Map();
  let screenshotsCopied = 0;

  for (const reportPath of shardReports) {
    const shardDir = dirname(reportPath);
    const shardShots = join(shardDir, "screenshots");
    let entries = [];
    try {
      entries = JSON.parse(readFileSync(reportPath, "utf8"));
    } catch (e) {
      console.error("Failed to parse", reportPath, e.message);
      continue;
    }

    for (const entry of entries) {
      // Copy screenshot if present and update path to final location.
      if (entry.screenshot) {
        const src = entry.screenshot.startsWith("/")
          ? join(process.cwd(), entry.screenshot)
          : join(shardDir, entry.screenshot.replace(/^e2e\/crawler-report\//, ""));
        if (existsSync(src)) {
          const dest = join(SHOTS_DIR, basename(src));
          copyFileSync(src, dest);
          entry.screenshot = dest;
          screenshotsCopied++;
        } else {
          entry.screenshot = undefined;
        }
      }
      byRoute.set(entry.route, entry);
    }
  }

  const merged = Array.from(byRoute.values()).sort((a, b) => a.index - b.index);
  writeFileSync(OUT_FILE, JSON.stringify(merged, null, 2));
  console.log(
    `Merged ${merged.length} routes, copied ${screenshotsCopied} screenshots → ${OUT_FILE}`,
  );
}

merge();

// Generate the HTML + markdown summary from the merged report.
const generateReport = fileURLToPath(new URL("./generate-report.mjs", import.meta.url));
await import(generateReport).catch((e) => {
  console.error("generate-report failed:", e.message);
  process.exit(1);
});
