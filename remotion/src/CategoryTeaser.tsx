import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadBody } from "@remotion/google-fonts/Manrope";
import { CATEGORY_TEASERS, CategoryTeaserId } from "./categoryTeaserData";

const display = loadDisplay().fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;
const FPS = 30;
export const CATEGORY_TEASER_DURATION = 300;

// Longer, slower-narration versions (frames @30fps) for the newer teasers.
export const CATEGORY_TEASER_DURATIONS: Record<string, number> = {
  vip: 426,
  eco: 375,
  health: 395,
  clipbattles: 382,
  education: 420,
  mentor: 384,
  brainduel: 393,
  diceduel: 375,
  kidschannel: 450,
  coloringpages: 450,
  kidspuzzles: 450,
  homeworkhelper: 450,
  storycreator: 450,
  sciencelab: 450,
  drawingbuddy: 450,
  readingcompanion: 450,
  fairytalebook: 450,
  kidscollectibles: 450,
  careercounselor: 450,
  creativeforge: 450,
  contentstudio: 450,
  aigeneration: 450,
  universalanalyzer: 450,
  flyerstudio: 450,
  videoadgen: 450,
  aivideocreator: 450,
  photostyler: 450,
  reversevideo: 450,
  aitattoo: 450,
  aiclone: 450,
  pettranslator: 450,
  handwriting: 450,
  futureface: 450,
  photorestoration: 450,
  stocklibrary: 450,
  brandbuilder: 450,
  homedesigner: 450,
  beautystudio: 450,
  fashionstudio: 450,
  guessage: 450,
  faceinsight: 450,
  pastlife: 450,
  lottery: 450,
  astrology: 450,
  dreamanalyzer: 450,
  crystalenergy: 450,
  timecapsule: 450,
  timereversal: 450,
  holographicavatars: 450,
  anondate: 450,
  dating: 450,
  bestfriend: 450,
  megaforum: 450,
  charactercompanions: 450,
  brokenhearts: 450,
  emotioneconomy: 450,
  invitefriends: 450,
  wellness: 450,
  aihealth: 450,
  psychologist: 450,
  firstaid: 450,
  fitslim: 450,
  nutrition: 450,
  phobia: 450,
  safety: 450,
  liedetector: 450,
  characterarena: 450,
  collectiblecards: 450,
  horseracing: 450,
  tutorialcourses: 450,
  iqplatform: 450,
  uni: 450,
  propertymarketplace: 450,
  skillsmarketplace: 450,
  bazaar: 450,
  coupons: 450,
  auctions: 450,
  antiques: 450,
  liveconcerts: 450,
  kitchenstars: 450,
  comedyclub: 450,
  influking: 450,
  escaperoom: 450,
  mysterybox: 450,
  socialgifts: 450,
  vacationer: 450,
  cooking: 450,
  coffeecommunity: 450,
  virtualpet: 450,
  adultpuzzles: 450,
  spinsolve: 450,
  unlockvideos: 450,
  shadowarena: 450,
};

export const getCategoryTeaserDuration = (id: string) =>
  CATEGORY_TEASER_DURATIONS[id] ?? CATEGORY_TEASER_DURATION;

const Brand: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: compact ? 14 : 22 }}>
    <Img src={staticFile("home/logo.png")} style={{ width: compact ? 70 : 132, height: compact ? 70 : 132, borderRadius: compact ? 18 : 34 }} />
    <div style={{ fontFamily: body, fontWeight: 800, fontSize: compact ? 40 : 76, color: "#fff" }}>Unique</div>
  </div>
);

const Intro: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 150 } });
  const exit = interpolate(frame, [45, 56], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: exit, background: "linear-gradient(145deg,#09040f,#27102e 54%,#0b0610)", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%,${accent}70,transparent 56%)` }} />
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.55, 1])})`, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
        <Brand />
        <div style={{ marginTop: 30, fontFamily: body, fontWeight: 800, fontSize: 50, color: "#fff", padding: "14px 34px", borderRadius: 40, background: accent }}>
          uniqueapp.fun
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Feature: React.FC<{ id: CategoryTeaserId; len?: number }> = ({ id, len = 196 }) => {
  const frame = useCurrentFrame();
  const item = CATEGORY_TEASERS[id];
  const title = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const zoom = interpolate(frame, [0, len - 6], [1.03, 1.15], { extrapolateRight: "clamp" });
  const pan = interpolate(frame, [0, len - 6], [0, -34], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#09050c", overflow: "hidden" }}>
      <Img src={staticFile(`category-teasers/${id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateY(${pan}px)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(8,3,12,.78),rgba(8,3,12,.05) 38%,rgba(8,3,12,.68) 68%,rgba(8,3,12,.98))" }} />
      <div style={{ position: "absolute", top: 54, left: 54, right: 54, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Brand compact />
        <div style={{ fontFamily: body, fontWeight: 800, fontSize: 29, color: "#fff", border: `2px solid ${item.accent}`, borderRadius: 28, padding: "10px 20px", background: "rgba(8,3,12,.55)" }}>uniqueapp.fun</div>
      </div>
      <div style={{ position: "absolute", left: 62, right: 62, bottom: 150 }}>
        <div style={{ display: "inline-block", fontFamily: body, fontWeight: 800, fontSize: 31, color: "#111", background: item.accent, padding: "10px 22px", borderRadius: 10, opacity: interpolate(frame, [3, 14], [0, 1], { extrapolateRight: "clamp" }) }}>{item.label}</div>
        <div style={{ marginTop: 18, fontFamily: display, fontSize: 122, lineHeight: .92, color: "#fff", transform: `translateY(${interpolate(title, [0, 1], [60, 0])}px)`, textShadow: "0 10px 42px rgba(0,0,0,.72)" }}>{item.hook}</div>
        <div style={{ marginTop: 28, display: "grid", gap: 12 }}>
          {item.lines.map((line, i) => {
            const enter = spring({ frame: frame - 18 - i * 12, fps: FPS, config: { damping: 20, stiffness: 160 } });
            return <div key={line} style={{ display: "flex", alignItems: "center", gap: 15, opacity: enter, transform: `translateX(${interpolate(enter, [0, 1], [-45, 0])}px)`, fontFamily: body, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,.9)" }}><span style={{ color: item.accent }}>●</span>{line}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ id: CategoryTeaserId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const item = CATEGORY_TEASERS[id];
  const pop = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg,#0a050e,#321136 58%,#0a050e)", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 70 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 42%,${item.accent}66,transparent 58%)` }} />
      <div style={{ zIndex: 2, opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [.72, 1])})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("home/logo.png")} style={{ width: 250, height: 250, borderRadius: 64, boxShadow: `0 30px 90px ${item.accent}88` }} />
        <div style={{ marginTop: 24, fontFamily: body, fontWeight: 800, fontSize: 70, color: "#fff" }}>Unique</div>
        <div style={{ marginTop: 10, fontFamily: body, fontWeight: 700, fontSize: 38, color: "#fff" }}>{item.outro}</div>
        <div style={{ marginTop: 26, fontFamily: body, fontWeight: 800, fontSize: 48, color: "#111", background: item.accent, padding: "15px 34px", borderRadius: 40 }}>uniqueapp.fun</div>
      </div>
    </AbsoluteFill>
  );
};

export const CategoryTeaser: React.FC<{ id: CategoryTeaserId }> = ({ id }) => {
  const total = getCategoryTeaserDuration(id);
  const outroLen = 62;
  const featureFrom = 50;
  const featureLen = total - outroLen - featureFrom + 12;
  return (
    <AbsoluteFill style={{ background: "#09050c" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.13} loop />
      <Audio src={staticFile(`category-teasers/voice/${id}.mp3`)} volume={1} />
      <Sequence from={0} durationInFrames={56}><Intro accent={CATEGORY_TEASERS[id].accent} /></Sequence>
      <Sequence from={featureFrom} durationInFrames={featureLen}><Feature id={id} len={featureLen} /></Sequence>
      <Sequence from={total - outroLen} durationInFrames={outroLen}><Outro id={id} /></Sequence>
    </AbsoluteFill>
  );
};
