import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
const ids = process.argv.slice(2);
const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
for (const id of ids) {
  const c = await selectComposition({ serveUrl: bundled, id, puppeteerInstance: browser });
  const out = `/mnt/documents/unique-${id}.mp4`;
  const t = Date.now();
  await renderMedia({ composition: c, serveUrl: bundled, codec: "h264", outputLocation: out, puppeteerInstance: browser, muted: true, concurrency: 4, crf: 22 });
  console.log("DONE", out, c.durationInFrames, "frames", ((Date.now()-t)/1000).toFixed(0)+"s");
}
await browser.close({ silent: false });
