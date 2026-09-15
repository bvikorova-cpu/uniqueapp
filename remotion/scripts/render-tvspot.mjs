import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compId = process.argv[2] || "tv-spot-sk";
const outFile = process.argv[3] || `/mnt/documents/Unique-TV-Spot-30s-${compId.endsWith("en") ? "EN" : "SK"}.mp4`;

const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/tv-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: compId, puppeteerInstance: browser });
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  crf: 18,
  outputLocation: outFile,
  puppeteerInstance: browser,
  muted: false,
  concurrency: 8,
});
await browser.close({ silent: false });
console.log("Done:", outFile);
