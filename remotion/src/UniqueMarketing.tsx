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
  image: string;
  tint: string;
};

const SCENES: Scene[] = [
  { from: 0, duration: 27, caption: "This is Unique", image: "01-intro.jpg", tint: "rgba(20,0,40,0.35)" },
  { from: 27, duration: 58, caption: "One app.\nEndless possibilities.", image: "02-world.jpg", tint: "rgba(0,0,20,0.4)" },
  { from: 85, duration: 55, caption: "Share your voice\non the Wall", image: "03-wall.jpg", tint: "rgba(30,0,40,0.45)" },
  { from: 140, duration: 47, caption: "Find real love\nin Dating", image: "04-dating.jpg", tint: "rgba(40,0,20,0.35)" },
  { from: 187, duration: 52, caption: "Let your kids\nlearn, safely", image: "05-kids.jpg", tint: "rgba(20,10,40,0.4)" },
  { from: 239, duration: 89, caption: "Show your talent.\nWin real prizes\nin Megatalent.", image: "06-megatalent.jpg", tint: "rgba(20,10,0,0.35)" },
  { from: 328, duration: 47, caption: "Create with AI\nin seconds", image: "07-ai.jpg", tint: "rgba(0,10,30,0.4)" },
  { from: 375, duration: 76, caption: "Sell your skills.\nBuy from your\nneighbors.", image: "08-market.jpg", tint: "rgba(10,20,10,0.45)" },
  { from: 451, duration: 63, caption: "Stream music.\nEarn from\nevery play.", image: "09-music.jpg", tint: "rgba(30,0,0,0.4)" },
  { from: 514, duration: 56, caption: "Heal your mind.\nMove your body.", image: "10-health.jpg", tint: "rgba(0,20,20,0.4)" },
  { from: 570, duration: 61, caption: "No ads chasing you.\nNo data games.", image: "11-privacy.jpg", tint: "rgba(10,0,30,0.5)" },
  { from: 631, duration: 58, caption: "Just people.\nCreators.\nDreamers.", image: "12-people.jpg", tint: "rgba(30,10,40,0.45)" },
  { from: 689, duration: 54, caption: "Made for the world.\nMade for you.", image: "13-worldwide.jpg", tint: "rgba(10,0,30,0.45)" },
  { from: 743, duration: 157, caption: "Welcome to Unique", image: "14-outro.jpg", tint: "rgba(20,0,40,0.5)" },
];

const KenBurnsImage: React.FC<{ src: string; duration: number }> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.08, 1.22], { extrapolateRight: "clamp" });
  const tx = interpolate(frame, [0, duration], [-10, 10], { extrapolateRight: "clamp" });
  const ty = interpolate(frame, [0, duration], [-8, 8], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(`images/marketing/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneCard: React.FC<Scene> = ({ duration, caption, image, tint }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  const exit = interpolate(frame, [duration - 12, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * (1 - exit);
  const y = interpolate(enter, [0, 1], [40, 0]);

  const lines = caption.split("\n");

  return (
    <AbsoluteFill>
      <KenBurnsImage src={image} duration={duration} />
      {/* dark tint for contrast */}
      <AbsoluteFill style={{ backgroundColor: tint }} />
      {/* bottom gradient for legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 80,
          paddingBottom: 220,
        }}
      >
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
            textShadow: "0 6px 40px rgba(0,0,0,0.7)",
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

const Outro: React.FC<{ image: string; duration: number }> = ({ image, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <KenBurnsImage src={image} duration={duration} />
      <AbsoluteFill style={{ backgroundColor: "rgba(10,0,30,0.55)" }} />
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
    </AbsoluteFill>
  );
};

export const UniqueMarketing: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0014" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          {i === SCENES.length - 1 ? (
            <Outro image={s.image} duration={s.duration} />
          ) : (
            <SceneCard {...s} />
          )}
        </Sequence>
      ))}
      <Audio src={staticFile("audio/voiceover.mp3")} />
    </AbsoluteFill>
  );
};
