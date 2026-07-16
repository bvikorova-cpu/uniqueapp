import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Lobster";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay();
const body = loadBody("normal", { weights: ["500", "700", "900"] });

type Scene = {
  from: number;
  duration: number;
  caption: string;
  emoji: string;
  gradient: [string, string, string];
  accent: string;
};

const SCENES: Scene[] = [
  { from: 0, duration: 27, caption: "This is Unique", emoji: "✨", gradient: ["#1a0033", "#4c1d95", "#831843"], accent: "#f9a8d4" },
  { from: 27, duration: 58, caption: "One app.\nEndless possibilities.", emoji: "🌍", gradient: ["#0f172a", "#7e22ce", "#db2777"], accent: "#fbcfe8" },
  { from: 85, duration: 55, caption: "Share your voice\non the Wall", emoji: "💬", gradient: ["#312e81", "#9333ea", "#ec4899"], accent: "#f5d0fe" },
  { from: 140, duration: 47, caption: "Find real love\nin Dating", emoji: "💖", gradient: ["#500724", "#be185d", "#f472b6"], accent: "#fce7f3" },
  { from: 187, duration: 52, caption: "Let your kids\nlearn, safely", emoji: "🧸", gradient: ["#1e3a8a", "#7c3aed", "#f59e0b"], accent: "#fef3c7" },
  { from: 239, duration: 89, caption: "Show your talent.\nWin real prizes\nin Megatalent.", emoji: "🏆", gradient: ["#422006", "#a16207", "#facc15"], accent: "#fef9c3" },
  { from: 328, duration: 47, caption: "Create with AI\nin seconds", emoji: "🎨", gradient: ["#083344", "#0e7490", "#a855f7"], accent: "#e9d5ff" },
  { from: 375, duration: 76, caption: "Sell your skills.\nBuy from your\nneighbors.", emoji: "🛍️", gradient: ["#064e3b", "#059669", "#84cc16"], accent: "#d9f99d" },
  { from: 451, duration: 63, caption: "Stream music.\nEarn from\nevery play.", emoji: "🎧", gradient: ["#450a0a", "#b91c1c", "#f97316"], accent: "#fed7aa" },
  { from: 514, duration: 56, caption: "Heal your mind.\nMove your body.", emoji: "🧘", gradient: ["#022c22", "#047857", "#a3e635"], accent: "#ecfccb" },
  { from: 570, duration: 61, caption: "No ads chasing you.\nNo data games.", emoji: "🛡️", gradient: ["#020617", "#334155", "#7c3aed"], accent: "#c4b5fd" },
  { from: 631, duration: 58, caption: "Just people.\nCreators.\nDreamers.", emoji: "🫶", gradient: ["#3b0764", "#9333ea", "#f472b6"], accent: "#fbcfe8" },
  { from: 689, duration: 54, caption: "Built in Europe.\nMade for you.", emoji: "🇪🇺", gradient: ["#0c4a6e", "#1d4ed8", "#facc15"], accent: "#fef3c7" },
  { from: 743, duration: 157, caption: "Welcome to Unique", emoji: "✨", gradient: ["#1a0033", "#7e22ce", "#ec4899"], accent: "#fbcfe8" },
];

const AnimatedBg: React.FC<{ colors: [string, string, string] }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 40) * 15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${30 + shift}%, ${colors[2]} 0%, ${colors[1]} 40%, ${colors[0]} 100%)`,
      }}
    />
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.08, mixBlendMode: "overlay",
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
  }} />
);

const FloatingOrbs: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 0.15, y: 0.2, size: 220, speed: 1 },
    { x: 0.8, y: 0.15, size: 160, speed: 1.4 },
    { x: 0.75, y: 0.85, size: 260, speed: 0.7 },
    { x: 0.2, y: 0.75, size: 180, speed: 1.2 },
  ];
  return (
    <AbsoluteFill>
      {orbs.map((o, i) => {
        const dx = Math.sin(frame / (30 * o.speed) + i) * 40;
        const dy = Math.cos(frame / (35 * o.speed) + i) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x * 100}%`,
              top: `${o.y * 100}%`,
              width: o.size,
              height: o.size,
              transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px)`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}55 0%, ${color}00 70%)`,
              filter: "blur(20px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SceneCard: React.FC<Scene> = ({ duration, caption, emoji, gradient, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  const exit = interpolate(frame, [duration - 12, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = enter * (1 - exit);
  const y = interpolate(enter, [0, 1], [40, 0]);
  const emojiScale = spring({ frame: frame - 4, fps, config: { damping: 8, stiffness: 140 } });
  const emojiFloat = Math.sin(frame / 20) * 12;

  const lines = caption.split("\n");

  return (
    <AbsoluteFill>
      <AnimatedBg colors={gradient} />
      <FloatingOrbs color={accent} />
      <Grain />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
        <div
          style={{
            fontSize: 340,
            transform: `scale(${emojiScale}) translateY(${emojiFloat}px)`,
            filter: `drop-shadow(0 20px 60px ${accent}88)`,
            marginBottom: 40,
          }}
        >
          {emoji}
        </div>

        <div
          style={{
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: "center",
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 1.1,
            color: "white",
            letterSpacing: "-0.03em",
            textShadow: `0 6px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {lines.map((l, i) => {
            const lineDelay = i * 4;
            const lineOp = interpolate(frame - lineDelay, [0, 14], [0, 1], { extrapolateRight: "clamp" });
            const lineY = interpolate(frame - lineDelay, [0, 14], [30, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity: lineOp, transform: `translateY(${lineY}px)` }}>
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: display.fontFamily,
          fontSize: 380,
          transform: `scale(${scale})`,
          background: "linear-gradient(180deg, #fff 0%, #fbcfe8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 80px rgba(236,72,153,0.6)",
          lineHeight: 1,
        }}
      >
        Unique
      </div>
      <div
        style={{
          marginTop: 30,
          opacity: urlOp,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 72,
          color: "white",
          letterSpacing: "0.05em",
        }}
      >
        uniqueapp.fun
      </div>
    </AbsoluteFill>
  );
};

export const UniqueMarketing: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0014" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          {i === SCENES.length - 1 ? (
            <AbsoluteFill>
              <AnimatedBg colors={s.gradient} />
              <FloatingOrbs color={s.accent} />
              <Grain />
              <Outro />
            </AbsoluteFill>
          ) : (
            <SceneCard {...s} />
          )}
        </Sequence>
      ))}
      <Audio src={staticFile("audio/voiceover.mp3")} />
    </AbsoluteFill>
  );
};
