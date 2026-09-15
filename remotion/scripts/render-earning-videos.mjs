import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requested = process.argv.slice(2);
const langs = requested.length ? requested : ["en", "sk", "hu"];
const labels = { en: "EN", sk: "SK", hu: "HU" };
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/earning-video-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

for (const lang of langs) {
  const composition = await selectComposition({ serveUrl: bundled, id: `earning-${lang}`, puppeteerInstance: browser });
  const outputLocation = `/mnt/documents/Unique-Ways-To-Earn-${labels[lang] ?? lang.toUpperCase()}.mp4`;
  await renderMedia({ composition, serveUrl: bundled, codec: "h264", crf: 19, outputLocation, puppeteerInstance: browser, muted: false, concurrency: 2 });
  console.log(`Done: ${outputLocation}`);
}

await browser.close({ silent: false });