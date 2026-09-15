import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadBody } from "@remotion/google-fonts/Manrope";
import { EARNING_COPY } from "./earningVideoText";
import type { EarningLang, EarningSceneCopy } from "./earningVideoText";

const display = loadDisplay().fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;
export const EARNING_FPS = 30;
const INTRO = 105;
const SCENE = 180;
const OUTRO = 165;
export const EARNING_DURATION = INTRO + SCENE * 8 + OUTRO;

const Brand: React.FC<{ small?: boolean }> = ({ small = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: small ? 14 : 20 }}>
    <Img src={staticFile("home/logo.png")} style={{ width: small ? 66 : 126, height: small ? 66 : 126, borderRadius: small ? 18 : 34 }} />
    <div style={{ fontFamily: body, fontWeight: 800, fontSize: small ? 39 : 72, color: "#fff" }}>Unique</div>
  </div>
);

const Intro: React.FC<{ headline: string; subhead: string }> = ({ headline, subhead }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 17, stiffness: 105 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg,#110717,#35113d 56%,#120713)", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 900, height: 900, border: "2px solid rgba(255,111,174,.35)", borderRadius: "50%", transform: `scale(${0.84 + frame / 1200}) rotate(${frame / 5}deg)` }} />
      <div style={{ position: "absolute", width: 620, height: 620, border: "1px solid rgba(244,200,90,.35)", borderRadius: "50%", transform: `scale(${1.1 - frame / 1800}) rotate(${-frame / 6}deg)` }} />
      <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: 70, transform: `translateY(${interpolate(rise, [0, 1], [80, 0])}px)`, opacity: rise }}>
        <Brand />
        <div style={{ marginTop: 58, fontFamily: display, fontSize: 138, lineHeight: .92, color: "#fff", maxWidth: 920 }}>{headline}</div>
        <div style={{ marginTop: 32, fontFamily: body, fontWeight: 700, fontSize: 43, color: "#F4C85A" }}>{subhead}</div>
      </div>
    </AbsoluteFill>
  );
};

const PhotoLayer: React.FC<{ scene: EarningSceneCopy; duration: number }> = ({ scene, duration }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, duration], [1.03, 1.13]);
  const hasTwo = scene.images.length > 1;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", transform: `scale(${zoom})` }}>
      {scene.images.map((image, index) => (
        <div key={image} style={{ width: hasTwo ? "50%" : "100%", height: "100%", overflow: "hidden", position: "relative" }}>
          <Img src={staticFile(`category-teasers/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: index === 0 ? "45% center" : "55% center", transform: `translateY(${interpolate(frame, [0, duration], [14, -20])}px)` }} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

const FeatureScene: React.FC<{ scene: EarningSceneCopy; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const exit = interpolate(frame, [SCENE - 18, SCENE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const divider = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0710", opacity: exit, overflow: "hidden" }}>
      <PhotoLayer scene={scene} duration={SCENE} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(10,5,13,.48) 0%,rgba(10,5,13,.06) 36%,rgba(10,5,13,.72) 63%,rgba(10,5,13,.98) 100%)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(${index % 2 ? 215 : 145}deg,transparent 35%,${scene.accent}35 100%)` }} />
      <div style={{ position: "absolute", top: 52, left: 50, right: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Brand small />
        <div style={{ fontFamily: body, fontWeight: 800, fontSize: 27, color: "#fff", padding: "9px 18px", border: `2px solid ${scene.accent}`, borderRadius: 30, background: "rgba(10,5,13,.64)" }}>uniqueapp.fun</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 108, transform: `translateY(${interpolate(entrance, [0, 1], [70, 0])}px)` }}>
        <div style={{ fontFamily: body, fontWeight: 800, fontSize: 30, color: "#161018", display: "inline-block", padding: "9px 18px", borderRadius: 8, backgroundColor: scene.accent }}>{scene.kicker}</div>
        <div style={{ width: `${divider * 100}%`, maxWidth: 360, height: 6, backgroundColor: scene.accent, marginTop: 22 }} />
        <div style={{ marginTop: 18, fontFamily: display, fontSize: 105, lineHeight: .92, color: "#fff", textShadow: "0 10px 40px rgba(0,0,0,.85)" }}>{scene.title}</div>
        <div style={{ marginTop: 24, fontFamily: body, fontWeight: 600, fontSize: 35, lineHeight: 1.25, color: "rgba(255,255,255,.94)", maxWidth: 925, textShadow: "0 6px 24px rgba(0,0,0,.95)", opacity: interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" }) }}>{scene.line}</div>
        <div style={{ marginTop: 25, fontFamily: body, fontWeight: 800, fontSize: 29, color: scene.accent, letterSpacing: 0 }}>{scene.proof}</div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ closing: string; line: string }> = ({ closing, line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 16, stiffness: 105 } });
  const shine = interpolate(frame, [0, OUTRO], [-500, 1100]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg,#100612,#3d103d 58%,#130714)", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 66, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", border: "2px solid rgba(244,200,90,.32)", transform: `scale(${1 + Math.sin(frame / 20) * .04})` }} />
      <div style={{ position: "absolute", left: shine, top: -200, width: 180, height: 2400, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)", transform: "rotate(18deg)" }} />
      <div style={{ zIndex: 2, opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [.75, 1])})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Brand />
        <div style={{ marginTop: 54, fontFamily: display, fontSize: 124, lineHeight: .94, color: "#fff" }}>{closing}</div>
        <div style={{ marginTop: 28, fontFamily: body, fontWeight: 600, fontSize: 38, color: "rgba(255,255,255,.9)" }}>{line}</div>
        <div style={{ marginTop: 42, fontFamily: body, fontWeight: 800, fontSize: 50, color: "#151017", background: "linear-gradient(90deg,#FF6FAE,#F4C85A)", padding: "16px 38px", borderRadius: 50 }}>uniqueapp.fun</div>
      </div>
    </AbsoluteFill>
  );
};

export const EarningOpportunitiesVideo: React.FC<{ lang?: EarningLang }> = ({ lang = "en" }) => {
  const copy = EARNING_COPY[lang];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0710" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.09} loop />
      <Audio src={staticFile(copy.voice)} volume={1} />
      <Sequence from={0} durationInFrames={INTRO}><Intro headline={copy.headline} subhead={copy.subhead} /></Sequence>
      {copy.scenes.map((scene, index) => <Sequence key={scene.kicker} from={INTRO + index * SCENE} durationInFrames={SCENE}><FeatureScene scene={scene} index={index} /></Sequence>)}
      <Sequence from={INTRO + copy.scenes.length * SCENE} durationInFrames={OUTRO}><Outro closing={copy.closing} line={copy.closingLine} /></Sequence>
    </AbsoluteFill>
  );
};