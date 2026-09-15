import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/earning-video-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

for (const [lang, frame, output] of [
  ["en", 60, "/tmp/earning-intro.png"],
  ["sk", 690, "/tmp/earning-market.png"],
  ["hu", 1600, "/tmp/earning-outro.png"],
]) {
  const composition = await selectComposition({ serveUrl: bundled, id: `earning-${lang}`, puppeteerInstance: browser });
  await renderStill({ composition, serveUrl: bundled, output, frame, imageFormat: "png", puppeteerInstance: browser });
  console.log(`Done: ${output}`);
}

await browser.close({ silent: false });