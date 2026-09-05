import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const c = await selectComposition({ serveUrl: bundled, id: "showcase-20-en", puppeteerInstance: browser });
console.log("duration frames", c.durationInFrames, (c.durationInFrames/30).toFixed(1)+"s");
for (const f of [20, 60, 90, 120, 200, 400]) {
  await renderStill({ composition: c, serveUrl: bundled, output: `/tmp/qa-${f}.png`, frame: f, puppeteerInstance: browser, scale: 0.4 });
}
const c2 = await selectComposition({ serveUrl: bundled, id: "showcase-all-sk", puppeteerInstance: browser });
console.log("ALL sk frames", c2.durationInFrames, (c2.durationInFrames/30).toFixed(1)+"s");
await renderStill({ composition: c2, serveUrl: bundled, output: `/tmp/qa-sk.png`, frame: 130, puppeteerInstance: browser, scale: 0.4 });
await browser.close({ silent: false });
