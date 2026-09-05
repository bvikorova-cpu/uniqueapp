import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const ids = process.argv.slice(2);
if (ids.length === 0) throw new Error("Pass at least one showcase composition ID");
const bundled = await bundle({
  entryPoint: path.join(projectRoot, "src/showcase-index.tsx"),
  webpackOverride: (c) => c,
});
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
for (const id of ids) {
  const c = await selectComposition({ serveUrl: bundled, id, puppeteerInstance: browser });
  const out = `/mnt/documents/unique-${id}.mp4`;
  const t = Date.now();
  await renderMedia({ composition: c, serveUrl: bundled, codec: "h264", outputLocation: out, puppeteerInstance: browser, muted: true, concurrency: 14, crf: 23, scale: 2/3, imageFormat: "jpeg", jpegQuality: 90,
    onProgress: (pr) => { if (pr.renderedFrames % 300 === 0) console.log("PROG", id, pr.renderedFrames, "/", c.durationInFrames, ((Date.now()-t)/1000).toFixed(0)+"s"); } });
  console.log("DONE", out, c.durationInFrames, "frames", ((Date.now()-t)/1000).toFixed(0)+"s");
}
await browser.close({ silent: false });
