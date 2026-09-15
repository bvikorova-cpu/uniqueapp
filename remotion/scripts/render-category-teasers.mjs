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
    kidschannel: "Kids-Channel",
    coloringpages: "Coloring-Pages",
    kidspuzzles: "Kids-Puzzles",
    homeworkhelper: "Homework-Helper",
    storycreator: "Story-Creator",
    sciencelab: "Science-Lab",
    drawingbuddy: "Drawing-Buddy",
    readingcompanion: "Reading-Companion",
    fairytalebook: "Fairytale-Book-Generator",
    kidscollectibles: "Kids-Collectibles",
    careercounselor: "Career-Counselor",
    creativeforge: "Creative-Forge",
    contentstudio: "Content-Studio",
    aigeneration: "AI-Generation",
    universalanalyzer: "Universal-Analyzer",
    flyerstudio: "Promotion-Flyer-Studio",
    videoadgen: "Video-Ad-Generator",
    aivideocreator: "AI-Video-Creator",
    photostyler: "Photo-Styler",
    reversevideo: "Reverse-Video",
    aitattoo: "AI-Tattoo-Designer",
    aiclone: "AI-Personality-Clone",
    pettranslator: "AI-Pet-Translator",
    handwriting: "Handwriting-Analyzer",
    futureface: "Future-Face",
    photorestoration: "Photo-Restoration",
    stocklibrary: "Stock-Content-Library",
    brandbuilder: "Brand-Builder",
    homedesigner: "Home-Designer",
    beautystudio: "Beauty-Studio",
    fashionstudio: "Fashion-Studio",
    guessage: "Guess-My-Age",
    faceinsight: "Face-Insight-Studio",
    pastlife: "Past-Life-Explorer",
    lottery: "Lottery-Numbers",
    astrology: "Astrology",
    dreamanalyzer: "Dream-Analyzer",
    crystalenergy: "Crystal-Energy-Network",
    timecapsule: "Time-Capsule-Network",
    timereversal: "Time-Reversal-Social",
    holographicavatars: "Holographic-Avatars",
    anondate: "Anonymous-Date",
    dating: "Dating",
    bestfriend: "Best-Friend",
    megaforum: "Mega-Forum",
    charactercompanions: "Character-Companions",
    brokenhearts: "Broken-Hearts",
    emotioneconomy: "Emotion-Economy",
    invitefriends: "Invite-Friends",
    wellness: "Wellness-Relaxation",
    aihealth: "AI-Health",
    psychologist: "Psychologist",
    firstaid: "First-Aid",
    fitslim: "Fit-Slim",
    nutrition: "Nutrition-Hub",
    phobia: "Phobia-Network",
    safety: "Safety-Bullying-Prevention",
    liedetector: "Lie-Detector-Chat",
    characterarena: "Character-Arena",
    collectiblecards: "Collectible-Cards",
    horseracing: "Horse-Racing-Arena",
    tutorialcourses: "Tutorial-Course-Platform",
    iqplatform: "IQ-Platform",
    uni: "Uni",
    propertymarketplace: "Property-Marketplace",
    skillsmarketplace: "Skills-Marketplace",
    bazaar: "Bazaar",
    coupons: "Coupon-Marketplace",
    auctions: "Online-Auctions",
    antiques: "Antique-Appraisal",
    liveconcerts: "Live-Concerts",
    kitchenstars: "KitchenStars-Competition",
    comedyclub: "Comedy-Club-Stand-Up",
    influking: "Influ-King",
    escaperoom: "Virtual-Escape-Room",
    mysterybox: "Mystery-Box",
    socialgifts: "Social-Gifts-Hub",
    vacationer: "Vacationer",
    cooking: "Cooking",
    coffeecommunity: "Coffee-Community",
    virtualpet: "Virtual-Pet",
    adultpuzzles: "Adult-Puzzles",
    spinsolve: "Spin-and-Solve",
    unlockvideos: "Unlock-Videos",
    shadowarena: "Shadow-Arena",
    clubcard: "VIP-Club-Card",
  };
  const name = NAMES[id] ?? `${id[0].toUpperCase()}${id.slice(1)}`;
  const secs = Math.round(composition.durationInFrames / composition.fps);
  const out = `/mnt/documents/Unique-${name}-${secs}s-EN.mp4`;
  await renderMedia({ composition, serveUrl: bundled, codec: "h264", crf: 20, outputLocation: out, puppeteerInstance: browser, muted: false, concurrency: 4 });
  console.log("Done:", out);
}

await browser.close({ silent: false });