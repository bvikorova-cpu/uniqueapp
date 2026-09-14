import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Manrope";
import { INTRO_TEXT, OUTRO_TEXT, STORY_TEXT, type Lang } from "./wallCinematicText";
import skTimings from "../public/wall-cine-voice/sk/timings.json";
import huTimings from "../public/wall-cine-voice/hu/timings.json";

const display = loadDisplay("normal", { weights: ["700"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;
const FPS = 30;
const PAD = 10;

const ACCENTS = [
  "#e83ad3",
  "#ff8a2a",
  "#8b5cf6",
  "#f0b90b",
  "#12bfc4",
  "#ec3f8f",
  "#e83ad3",
  "#f09b20",
  "#f2c037",
  "#ff8a1f",
  "#a95cf4",
  "#ec3fb4",
  "#ff8a2a",
  "#8b5cf6",
  "#20c47a",
  "#f1bd2d",
];

// English scene lengths (existing hand-tuned voiceover in social-wall-promo/*.mp3)
const EN_SECONDS = [6.5, 7.5, 6.0, 6.5, 6.5, 6.5, 6.0, 6.8, 7.5, 6.0, 8.8, 6.5, 6.0, 6.8, 6.5, 6.5];

const VOICE_SECONDS: Record<Lang, number[]> = {
  en: EN_SECONDS,
  sk: (skTimings as number[]).map((d) => d + 1.0),
  hu: (huTimings as number[]).map((d) => d + 1.0),
};

const VOICE_DIR: Record<Lang, string> = {
  en: "social-wall-promo",
  sk: "wall-cine-voice/sk",
  hu: "wall-cine-voice/hu",
};

type Scene = {
  kind: "intro" | "story" | "outro";
  seconds: number;
  voice?: number;
  image?: string;
  kicker?: string;
  title?: string;
  copy?: string;
  details?: string[];
  facts?: string[];
  accent: string;
};

const buildScenes = (lang: Lang) => {
  const stories = STORY_TEXT[lang];
  const raw: Scene[] = [
    { kind: "intro", seconds: 3.2, accent: "#e83ad3", ...INTRO_TEXT[lang] },
    ...stories.map((text, i) => ({
      kind: "story" as const,
      seconds: VOICE_SECONDS[lang][i],
      voice: i,
      image: `${String(i + 1).padStart(2, "0")}.jpg`,
      accent: ACCENTS[i],
      kicker: text.kicker,
      title: text.title,
      copy: text.copy,
      details: text.details,
      facts: text.facts,
    })),
    { kind: "outro", seconds: 4.4, accent: "#e83ad3", ...OUTRO_TEXT[lang] },
  ];
  return raw.map((scene, index) => ({ ...scene, index, frames: Math.ceil(scene.seconds * FPS) + PAD }));
};

type BuiltScene = ReturnType<typeof buildScenes>[number];

export const wallCinematicDuration = (lang: Lang) =>
  buildScenes(lang).reduce((sum, scene) => sum + scene.frames, 0);

export const WALL_CINEMATIC_DURATION = wallCinematicDuration("en");

const Grain: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 30) * 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + shift / 12}% 8%, ${accent}44 0%, transparent 55%)` }} />
  );
};

const BrandBar: React.FC<{ accent: string }> = ({ accent }) => (
  <div style={{ position: "absolute", top: 56, left: 60, right: 60, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("home/logo.png")} style={{ width: 104, height: 104, borderRadius: 28, boxShadow: `0 16px 50px ${accent}bb` }} />
      <span style={{ fontFamily: display, fontSize: 82, color: "white", textShadow: "0 8px 34px rgba(0,0,0,.6)" }}>Unique</span>
    </div>
    <div style={{ padding: "14px 30px", borderRadius: 50, background: "rgba(0,0,0,.45)", border: `2px solid ${accent}`, backdropFilter: "none" }}>
      <span style={{ fontFamily: body, fontWeight: 800, fontSize: 36, color: "white" }}>uniqueapp.fun</span>
    </div>
  </div>
);

const LogoScene: React.FC<{ scene: BuiltScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const glow = 0.6 + Math.sin(frame / 12) * 0.35;
  const fade = interpolate(frame, [scene.frames - 14, scene.frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade, background: "linear-gradient(160deg,#0b0313,#2a0a3c 55%,#0b0313)" }}>
      <Grain accent={scene.accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: 999, background: `radial-gradient(circle,${scene.accent}55,transparent 62%)`, opacity: glow }} />
        <Img
          src={staticFile("home/logo.png")}
          style={{ width: 460, height: 460, borderRadius: 118, transform: `scale(${interpolate(pop, [0, 1], [0.55, 1])})`, boxShadow: `0 50px 150px ${scene.accent}cc` }}
        />
        <div style={{ marginTop: 56, fontFamily: display, fontSize: 130, color: "white", transform: `translateY(${interpolate(pop, [0, 1], [50, 0])}px)`, textShadow: `0 14px 70px ${scene.accent}aa` }}>Unique</div>
        <div style={{ marginTop: 18, padding: "18px 46px", borderRadius: 60, background: `linear-gradient(90deg,${scene.accent},#f4c43c)`, opacity: interpolate(frame, [12, 34], [0, 1], { extrapolateRight: "clamp" }) }}>
          <span style={{ fontFamily: body, fontWeight: 800, fontSize: 56, color: "white", letterSpacing: 1 }}>{scene.title}</span>
        </div>
        <div style={{ marginTop: 30, fontFamily: body, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,.86)", textAlign: "center", maxWidth: 900 }}>{scene.copy}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StoryScene: React.FC<{ scene: BuiltScene; lang: Lang }> = ({ scene, lang }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 20, stiffness: 110 } });
  const fade = interpolate(frame, [scene.frames - 14, scene.frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, scene.frames], [1.04, 1.15], { extrapolateRight: "clamp" });
  const drift = interpolate(frame, [0, scene.frames], [-18, 18], { extrapolateRight: "clamp" });
  const title = (scene.title ?? "").split("\n");
  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: "#07030d" }}>
      <AbsoluteFill>
        <Img
          src={staticFile(`social-wall-cine/${scene.image}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateX(${drift}px)` }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(6,2,12,.86) 0%,rgba(6,2,12,.25) 34%,rgba(6,2,12,.55) 62%,rgba(6,2,12,.95) 100%)" }} />
      <Grain accent={scene.accent} />
      <BrandBar accent={scene.accent} />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 238, zIndex: 8 }}>
        <div style={{ opacity: interpolate(frame, [2, 18], [0, 1], { extrapolateRight: "clamp" }), display: "inline-block", padding: "10px 24px", borderRadius: 40, background: `${scene.accent}33`, border: `2px solid ${scene.accent}`, fontFamily: body, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "white" }}>
          {scene.kicker}
        </div>
        <div style={{ marginTop: 18, transform: `translateY(${interpolate(enter, [0, 1], [56, 0])}px)`, fontFamily: body, fontWeight: 800, fontSize: title.length > 1 ? 84 : 96, lineHeight: 0.96, color: "white", textShadow: `0 14px 60px rgba(0,0,0,.8), 0 0 70px ${scene.accent}66` }}>
          {title.map((line) => <div key={line}>{line}</div>)}
        </div>
        <div style={{ marginTop: 18, fontFamily: body, fontWeight: 700, fontSize: 34, color: "white" }}>{scene.copy}</div>
        {scene.details && (
          <div style={{ marginTop: 20, display: "grid", gap: 10, maxWidth: 920 }}>
            {scene.details.map((detail, i) => (
              <div
                key={detail}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  fontFamily: body,
                  fontWeight: 600,
                  fontSize: 27,
                  lineHeight: 1.28,
                  color: "rgba(255,255,255,.92)",
                  opacity: interpolate(frame, [12 + i * 8, 28 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ color: scene.accent, fontWeight: 800 }}>•</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}
        {scene.facts && (
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {scene.facts.map((fact, i) => (
              <div
                key={fact}
                style={{
                  padding: "10px 22px",
                  borderRadius: 44,
                  background: "rgba(255,255,255,.14)",
                  border: "2px solid rgba(255,255,255,.32)",
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 26,
                  color: "white",
                  opacity: interpolate(frame, [16 + i * 7, 32 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  transform: `translateY(${interpolate(frame, [16 + i * 7, 32 + i * 7], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                }}
              >
                {fact}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 108, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 14, padding: "16px 40px", borderRadius: 60, background: `linear-gradient(90deg,${scene.accent},#f4c43c)`, boxShadow: `0 18px 60px ${scene.accent}99`, zIndex: 9 }}>
        <Img src={staticFile("home/logo.png")} style={{ width: 50, height: 50, borderRadius: 14 }} />
        <span style={{ fontFamily: body, fontWeight: 800, fontSize: 38, color: "white", letterSpacing: 1 }}>uniqueapp.fun</span>
      </div>
      <div style={{ position: "absolute", bottom: 58, left: 80, right: 80, height: 8, borderRadius: 8, background: "rgba(255,255,255,.16)", overflow: "hidden" }}>
        <div style={{ width: `${interpolate(frame, [0, scene.frames], [0, 100], { extrapolateRight: "clamp" })}%`, height: "100%", background: `linear-gradient(90deg,${scene.accent},#f4c43c)` }} />
      </div>
      {scene.voice !== undefined && (
        <Audio src={staticFile(`${VOICE_DIR[lang]}/${String(scene.voice).padStart(2, "0")}.mp3`)} volume={1} />
      )}
    </AbsoluteFill>
  );
};

export const WallCinematic: React.FC<{ lang?: Lang }> = ({ lang = "en" }) => {
  const scenes = buildScenes(lang);
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.07} loop />
      {scenes.map((scene) => {
        const start = from;
        from += scene.frames;
        return (
          <Sequence key={scene.index} from={start} durationInFrames={scene.frames}>
            {scene.kind === "story" ? <StoryScene scene={scene} lang={lang} /> : <LogoScene scene={scene} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
