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

const display = loadDisplay("normal", { weights: ["700"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;
const FPS = 30;
const PAD = 10;

type Scene = {
  kind: "intro" | "story" | "outro";
  seconds: number;
  voice?: number;
  image?: string;
  kicker?: string;
  title?: string;
  copy?: string;
  facts?: string[];
  accent: string;
};

const rawScenes: Scene[] = [
  { kind: "intro", seconds: 3.2, accent: "#e83ad3", title: "uniqueapp.fun", copy: "The social wall for creators" },
  { kind: "story", seconds: 5.976, voice: 0, image: "01.jpg", kicker: "WELCOME TO", title: "SOCIAL WALL", copy: "Where creation meets AI & real cash", facts: ["Post", "Connect", "Earn"], accent: "#e83ad3" },
  { kind: "story", seconds: 7.032, voice: 1, image: "02.jpg", kicker: "CREATE • GROW • EARN", title: "YOUR CONTENT.\nYOUR MOMENT.", copy: "The ultimate social hub for creators", facts: ["Photos & video", "Stories", "24h notes"], accent: "#ff8a2a" },
  { kind: "story", seconds: 2.256, voice: 2, image: "03.jpg", kicker: "BUILT IN", title: "SMART AI TOOLS", copy: "5 AI tools inside your wall", accent: "#8b5cf6" },
  { kind: "story", seconds: 4.92, voice: 3, image: "04.jpg", kicker: "BEFORE YOU POST", title: "AI VIRAL\nPREDICTOR", copy: "Score your viral potential", facts: ["Viral score", "Instant tips"], accent: "#f0b90b" },
  { kind: "story", seconds: 4.92, voice: 4, image: "05.jpg", kicker: "PERFECT TIMING", title: "AI CONTENT\nCALENDAR", copy: "Optimal posting schedule for peak reach", facts: ["Best hours", "Weekly plan"], accent: "#12bfc4" },
  { kind: "story", seconds: 5.112, voice: 5, image: "06.jpg", kicker: "MORE IMPACT", title: "ENHANCE &\nGO VIRAL", copy: "AI post enhancer + hashtag generator", facts: ["Audience insights", "Smart hashtags"], accent: "#ec3f8f" },
  { kind: "story", seconds: 3.0, voice: 6, image: "07.jpg", kicker: "REAL VALUE", title: "UNIQUE GIFTS", copy: "Turn appreciation into income", accent: "#e83ad3" },
  { kind: "story", seconds: 6.192, voice: 7, image: "08.jpg", kicker: "EXPRESS EVERYTHING", title: "360+ GIFTS", copy: "Animated gifts & collectibles", facts: ["Hearts", "Diamonds", "Adventures"], accent: "#f09b20" },
  { kind: "story", seconds: 6.96, voice: 8, image: "09.jpg", kicker: "EARN REAL EUROS", title: "50% CASH\nPAYOUTS", copy: "Cashout from €20", facts: ["50% of gift value", "Paid in EUR"], accent: "#f2c037" },
  { kind: "story", seconds: 2.544, voice: 9, image: "10.jpg", kicker: "PLAY. CREATE. GROW.", title: "LEVEL UP", copy: "Growth that feels rewarding", accent: "#ff8a1f" },
  { kind: "story", seconds: 8.376, voice: 10, image: "11.jpg", kicker: "EVERY ACTION COUNTS", title: "XP • STREAKS\n150+ BADGES", copy: "Unlock creator milestones", facts: ["XP for posts", "Daily streaks", "150+ badges"], accent: "#a95cf4" },
  { kind: "story", seconds: 5.304, voice: 11, image: "12.jpg", kicker: "ANYTIME", title: "WATCH & EARN", copy: "Extra XP from short videos", facts: ["15s videos", "Unlimited"], accent: "#ec3fb4" },
  { kind: "story", seconds: 2.4, voice: 12, image: "13.jpg", kicker: "MAKE IT YOURS", title: "YOUR SPACE.\nYOUR STYLE.", copy: "A wall as unique as you", accent: "#ff8a2a" },
  { kind: "story", seconds: 6.192, voice: 13, image: "14.jpg", kicker: "PERSONALIZE", title: "CUSTOM THEMES", copy: "Neon • Ocean • Purple & Pink", facts: ["Themes", "Colors", "Your vibe"], accent: "#8b5cf6" },
  { kind: "story", seconds: 5.04, voice: 14, image: "15.jpg", kicker: "PEACE OF MIND", title: "SAFE COMMUNITY", copy: "Built-in tools put you in control", facts: ["Muted words", "Muted users", "Full control"], accent: "#20c47a" },
  { kind: "story", seconds: 5.04, voice: 15, image: "16.jpg", kicker: "JOIN TODAY", title: "CREATE. GROW.\nSTART EARNING.", copy: "uniqueapp.fun", accent: "#f1bd2d" },
  { kind: "outro", seconds: 4.4, accent: "#e83ad3", title: "uniqueapp.fun", copy: "Your feed. Your rules. Your income." },
];

const scenes = rawScenes.map((scene, index) => ({ ...scene, index, frames: Math.ceil(scene.seconds * FPS) + PAD }));

export const WALL_CINEMATIC_DURATION = scenes.reduce((sum, scene) => sum + scene.frames, 0);

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

const LogoScene: React.FC<{ scene: (typeof scenes)[number] }> = ({ scene }) => {
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

const StoryScene: React.FC<{ scene: (typeof scenes)[number] }> = ({ scene }) => {
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
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 250, zIndex: 8 }}>
        <div style={{ opacity: interpolate(frame, [2, 18], [0, 1], { extrapolateRight: "clamp" }), display: "inline-block", padding: "10px 24px", borderRadius: 40, background: `${scene.accent}33`, border: `2px solid ${scene.accent}`, fontFamily: body, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "white" }}>
          {scene.kicker}
        </div>
        <div style={{ marginTop: 22, transform: `translateY(${interpolate(enter, [0, 1], [56, 0])}px)`, fontFamily: body, fontWeight: 800, fontSize: title.length > 1 ? 100 : 112, lineHeight: 0.94, color: "white", textShadow: `0 14px 60px rgba(0,0,0,.8), 0 0 70px ${scene.accent}66` }}>
          {title.map((line) => <div key={line}>{line}</div>)}
        </div>
        <div style={{ marginTop: 22, fontFamily: body, fontWeight: 600, fontSize: 38, color: "rgba(255,255,255,.9)" }}>{scene.copy}</div>
        {scene.facts && (
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 16 }}>
            {scene.facts.map((fact, i) => (
              <div
                key={fact}
                style={{
                  padding: "14px 28px",
                  borderRadius: 44,
                  background: "rgba(255,255,255,.14)",
                  border: "2px solid rgba(255,255,255,.32)",
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 30,
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
      {scene.voice !== undefined && <Audio src={staticFile(`social-wall-promo/${String(scene.voice).padStart(2, "0")}.mp3`)} volume={1} />}
    </AbsoluteFill>
  );
};

export const WallCinematic: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.07} loop />
      {scenes.map((scene) => {
        const start = from;
        from += scene.frames;
        return (
          <Sequence key={scene.index} from={start} durationInFrames={scene.frames}>
            {scene.kind === "story" ? <StoryScene scene={scene} /> : <LogoScene scene={scene} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
