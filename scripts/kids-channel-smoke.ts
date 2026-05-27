#!/usr/bin/env bun
// Lightweight HTTP smoke for Kids Channel — verifies SPA serves 200 + HTML for every route.
const BASE = process.env.BASE_URL || "https://uniqueapp.lovable.app";
const HUB = ["children","age-filter","path","saved","reports","screen-time","curriculum","recommend","safety","approval","narration","phonics","math","difficulty","pet","economy","assignments","share"];
const ROUTES = [
  "/kids-channel","/kids-channel/hub","/kids-channel/fairy-castles","/kids-channel/certificate-gallery",
  "/kids","/kids-academy","/kids-homework","/kids-homework-pricing","/kids-story-creator","/kids-story-pricing",
  "/kids-science-lab","/kids-science-pricing","/kids-drawing-buddy","/kids-drawing-pricing",
  "/kids-reading-companion","/kids-reading-pricing","/kids-voice-chat","/kids-voice-chat-pricing","/kids-pricing",
  "/kids-stories/adventure","/kids-stories/educational","/kids-stories/bedtime","/kids-stories/games",
  "/kids-stories/character-gallery","/kids-channel/my-gallery","/kids-channel/parental-dashboard",
  "/kids-channel/disney-castles",
  ...HUB.map(s => `/kids-channel/hub/${s}`),
];
let pass = 0, fail = 0;
for (const p of ROUTES) {
  try {
    const r = await fetch(BASE + p);
    const ok = r.status < 500;
    const txt = await r.text();
    const hasShell = txt.includes("<div id=\"root\"") || txt.includes("id=root");
    if (ok && hasShell) { pass++; console.log("✅", r.status, p); }
    else { fail++; console.log("❌", r.status, p, "shell=" + hasShell); }
  } catch (e) { fail++; console.log("💥", p, e.message); }
}
console.log(`\n${pass}/${ROUTES.length} routes OK, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
