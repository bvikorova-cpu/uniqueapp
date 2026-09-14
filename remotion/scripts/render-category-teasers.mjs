import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["wall", "messenger", "games", "jobs", "rewards", "promotions", "megatalent"];
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/category-teaser-index.ts") });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

for (const id of ids) {
  const composition = await selectComposition({ serveUrl: bundled, id: `category-${id}`, puppeteerInstance: browser });
  const NAMES = {
    vip: "VIP-Membership-Group",
    eco: "Eco-Challenge",
    health: "Health-Challenge",
    clipbattles: "Clip-Battles",
    education: "Education-Hub",
    mentor: "Personal-Mentor",
    brainduel: "Brain-Duel",
    diceduel: "Dice-Trail-Duel",
  };
  const name = NAMES[id] ?? `${id[0].toUpperCase()}${id.slice(1)}`;
  const out = `/mnt/documents/Unique-${name}-10s-EN.mp4`;
  await renderMedia({ composition, serveUrl: bundled, codec: "h264", crf: 20, outputLocation: out, puppeteerInstance: browser, muted: false, concurrency: 4 });
  console.log("Done:", out);
}

await browser.close({ silent: false });