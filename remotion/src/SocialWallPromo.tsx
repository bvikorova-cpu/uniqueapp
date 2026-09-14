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

type SceneDef = {
  seconds: number;
  image?: string;
  photo?: boolean;
  logo?: boolean;
  kicker: string;
  title: string;
  copy: string;
  accent: string;
};

const rawScenes: SceneDef[] = [
  { seconds: 5.976, image: "img_1_1789373257749.jpg", kicker: "WELCOME TO", title: "SOCIAL WALL", copy: "Where creation meets AI & real cash", accent: "#e83ad3" },
  { seconds: 7.032, image: "creator-filming.jpg", photo: true, kicker: "CREATE • GROW • EARN", title: "YOUR CONTENT.\nYOUR MOMENT.", copy: "The ultimate social hub for creators", accent: "#ff8a2a" },
  { seconds: 2.256, image: "img_7_1789373309924.jpg", kicker: "BUILT IN", title: "SMART AI TOOLS", copy: "Create with an unfair advantage", accent: "#8b5cf6" },
  { seconds: 4.92, image: "img_13_1789373354707.jpg", kicker: "PREDICT BEFORE YOU POST", title: "AI VIRAL\nPREDICTOR", copy: "Score your viral potential", accent: "#f0b90b" },
  { seconds: 4.92, image: "img_10_1789373338368.jpg", kicker: "PERFECT TIMING", title: "CONTENT\nCALENDAR", copy: "Reach people when it matters", accent: "#12bfc4" },
  { seconds: 5.112, image: "creator-growth.jpg", photo: true, kicker: "MORE IMPACT", title: "ENHANCE &\nGO VIRAL", copy: "Smarter posts. Better hashtags.", accent: "#ec3f8f" },
  { seconds: 3.0, image: "img_4_1789373292195.jpg", kicker: "REAL VALUE", title: "UNIQUE GIFTS", copy: "Turn appreciation into income", accent: "#e83ad3" },
  { seconds: 6.192, image: "img_3_1789373279224.jpg", kicker: "EXPRESS EVERYTHING", title: "360+ GIFTS", copy: "Animated gifts and collectibles", accent: "#f09b20" },
  { seconds: 6.96, image: "img_2_1789373268159.jpg", kicker: "EARN REAL EUROS", title: "50% CASH\nPAYOUTS", copy: "Easy cashout starting at €20", accent: "#f2c037" },
  { seconds: 2.544, image: "img_5_1789373298955.jpg", kicker: "PLAY. CREATE. GROW.", title: "LEVEL UP", copy: "Growth that feels rewarding", accent: "#ff8a1f" },
  { seconds: 8.376, image: "img_6_1789373304417.jpg", kicker: "EVERY ACTION COUNTS", title: "XP • STREAKS\n150+ BADGES", copy: "Unlock creator milestones", accent: "#a95cf4" },
  { seconds: 5.304, image: "img_11_1789373344355.jpg", kicker: "ANYTIME", title: "WATCH & EARN", copy: "Collect extra XP from short videos", accent: "#ec3fb4" },
  { seconds: 2.4, image: "img_8_1789373315537.jpg", kicker: "MAKE IT YOURS", title: "YOUR SPACE.\nYOUR STYLE.", copy: "A wall as unique as you", accent: "#ff8a2a" },
  { seconds: 6.192, image: "img_12_1789373349602.jpg", kicker: "NEON • OCEAN • PURPLE & PINK", title: "CUSTOM THEMES", copy: "Personalize every detail", accent: "#8b5cf6" },
  { seconds: 5.04, image: "img_9_1789373321076.jpg", kicker: "CONTROL & PEACE OF MIND", title: "SAFE COMMUNITY", copy: "Built-in tools put you in control", accent: "#20c47a" },
  { seconds: 5.04, image: "creator-earnings.jpg", photo: true, kicker: "JOIN TODAY", title: "CREATE. GROW.\nSTART EARNING.", copy: "uniqueapp.fun", accent: "#f1bd2d" },
  { seconds: 3.6, logo: true, kicker: "JOIN TODAY", title: "uniqueapp.fun", copy: "Your feed. Your rules. Your income.", accent: "#e83ad3" },
].map((scene, index) => ({ ...scene, index, frames: Math.ceil(scene.seconds * FPS) + PAD }));

export const SOCIAL_WALL_PROMO_DURATION = scenes.reduce((sum, scene) => sum + scene.frames, 0);

const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 28) * 90;
  return (
    <AbsoluteFill style={{ backgroundColor: "#090411", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${25 + shift / 20}% 18%, ${accent}aa 0%, transparent 43%), radial-gradient(circle at 82% 78%, #8b5cf688 0%, transparent 46%), linear-gradient(150deg, #08030f, #1d0928 54%, #08030f)` }} />
      <AbsoluteFill style={{ opacity: 0.12, backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)", backgroundSize: "72px 72px", transform: `translate(${shift / 5}px,${shift / 8}px)` }} />
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => (
  <div style={{ position: "absolute", top: 58, left: 58, right: 58, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("home/logo.png")} style={{ width: 64, height: 64, borderRadius: 17, boxShadow: "0 12px 35px #e83ad388" }} />
      <span style={{ fontFamily: display, fontSize: 52, color: "white" }}>Unique</span>
    </div>
    <span style={{ fontFamily: body, fontWeight: 800, fontSize: 24, color: "rgba(255,255,255,.8)" }}>uniqueapp.fun</span>
  </div>
);

const Scene: React.FC<{ scene: (typeof scenes)[number] }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 120 } });
  const exit = interpolate(frame, [scene.frames - 13, scene.frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phoneY = interpolate(enter, [0, 1], [150, 0]);
  const phoneRotate = interpolate(enter, [0, 1], [5, -1.5]);
  const zoom = interpolate(frame, [0, scene.frames], [1.01, 1.09], { extrapolateRight: "clamp" });
  const title = scene.title.split("\n");
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <Background accent={scene.accent} />
      <Brand />
      <div style={{ position: "absolute", top: 170, left: 70, right: 70, textAlign: "center", zIndex: 4 }}>
        <div style={{ opacity: interpolate(frame, [2, 17], [0, 1], { extrapolateRight: "clamp" }), fontFamily: body, fontWeight: 800, fontSize: 25, color: scene.accent, letterSpacing: 3.5 }}>{scene.kicker}</div>
        <div style={{ marginTop: 15, transform: `translateY(${interpolate(enter, [0, 1], [42, 0])}px)`, fontFamily: body, fontWeight: 800, fontSize: title.length > 1 ? 86 : 98, lineHeight: 0.94, color: "white", textShadow: `0 10px 50px ${scene.accent}99` }}>
          {title.map((line) => <div key={line}>{line}</div>)}
        </div>
        <div style={{ marginTop: 19, fontFamily: body, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,.82)" }}>{scene.copy}</div>
      </div>
      <div style={{ position: "absolute", left: scene.photo ? 70 : 110, right: scene.photo ? 70 : 110, top: scene.photo ? 520 : 560, height: scene.photo ? 1250 : 1170, borderRadius: scene.photo ? 44 : 70, overflow: "hidden", border: `5px solid ${scene.accent}`, background: "white", boxShadow: `0 45px 110px #000b, 0 0 80px ${scene.accent}77`, transform: `translateY(${phoneY}px) rotate(${phoneRotate}deg)` }}>
        <Img src={staticFile(`social-wall-promo/${scene.image}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", transform: `scale(${zoom})` }} />
        {!scene.photo && <div style={{ position: "absolute", left: "50%", top: 15, width: 180, height: 24, transform: "translateX(-50%)", borderRadius: 20, background: "#101010" }} />}
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 80, right: 80, height: 8, borderRadius: 8, background: "rgba(255,255,255,.15)", overflow: "hidden" }}>
        <div style={{ width: `${interpolate(frame, [0, scene.frames], [0, 100], { extrapolateRight: "clamp" })}%`, height: "100%", background: `linear-gradient(90deg,${scene.accent},#f4c43c)` }} />
      </div>
      <Audio src={staticFile(`social-wall-promo/${String(scene.index).padStart(2, "0")}.mp3`)} volume={1} />
    </AbsoluteFill>
  );
};

export const SocialWallPromo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.07} loop />
      {scenes.map((scene) => {
        const start = from;
        from += scene.frames;
        return <Sequence key={scene.index} from={start} durationInFrames={scene.frames}><Scene scene={scene} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};