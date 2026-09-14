import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = process.argv[2] || "/mnt/documents/Unique-Teaser-10s.mp4";
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/teaser-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "unique-teaser", puppeteerInstance: browser });
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  crf: 20,
  outputLocation: outFile,
  puppeteerInstance: browser,
  muted: false,
  concurrency: 8,
});
await browser.close({ silent: false });
console.log("Done:", outFile);
