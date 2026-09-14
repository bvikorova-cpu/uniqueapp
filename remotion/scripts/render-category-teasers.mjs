import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ids = ["wall", "messenger", "games", "jobs", "rewards", "promotions", "megatalent"];
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/category-teaser-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

for (const id of ids) {
  const composition = await selectComposition({ serveUrl: bundled, id: `category-${id}`, puppeteerInstance: browser });
  const out = `/mnt/documents/Unique-${id[0].toUpperCase()}${id.slice(1)}-10s-EN.mp4`;
  await renderMedia({ composition, serveUrl: bundled, codec: "h264", crf: 20, outputLocation: out, puppeteerInstance: browser, muted: false, concurrency: 4 });
  console.log("Done:", out);
}

await browser.close({ silent: false });