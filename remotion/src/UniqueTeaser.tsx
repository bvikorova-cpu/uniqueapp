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

type Card = { image: string; title: string; items: string[]; accent: string; frames: number };

const CARDS: Card[] = [
  {
    image: "01.jpg",
    title: "Social Wall",
    items: ["Posts, stories & reels", "AI viral predictor"],
    accent: "#e83ad3",
    frames: 60,
  },
  {
    image: "03.jpg",
    title: "AI Studio",
    items: ["Photo, video & content tools", "Smart assistants"],
    accent: "#8b5cf6",
    frames: 60,
  },
  {
    image: "11.jpg",
    title: "Learn, Play & Meet",
    items: ["Courses, kids hub, games", "Dating & friends"],
    accent: "#12bfc4",
    frames: 60,
  },
  {
    image: "04.jpg",
    title: "Earn Real Euros",
    items: ["Gifts • 50% payout", "Marketplace, skills, courses"],
    accent: "#f0b90b",
    frames: 66,
  },
];

const INTRO_FRAMES = 54;
const OUTRO_FRAMES = 42;

export const UNIQUE_TEASER_DURATION =
  INTRO_FRAMES + CARDS.reduce((s, c) => s + c.frames, 0) + OUTRO_FRAMES;

const Glow: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + Math.sin(frame / 9) * 0.28;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 14%, ${accent}55 0%, transparent 58%)`,
        opacity: pulse,
      }}
    />
  );
};

const BrandBadge: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 62,
      right: 62,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Img
        src={staticFile("home/logo.png")}
        style={{ width: 100, height: 100, borderRadius: 28, boxShadow: `0 16px 48px ${accent}bb` }}
      />
      <span style={{ fontFamily: display, fontSize: 78, color: "white", textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
        Unique
      </span>
    </div>
    <div style={{ padding: "12px 28px", borderRadius: 50, background: "rgba(0,0,0,.5)", border: `2px solid ${accent}` }}>
      <span style={{ fontFamily: body, fontWeight: 800, fontSize: 34, color: "white" }}>uniqueapp.fun</span>
    </div>
  </div>
);

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 13, stiffness: 130 } });
  const fade = interpolate(frame, [INTRO_FRAMES - 12, INTRO_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: fade, background: "linear-gradient(160deg,#0b0313,#2c0a3f 55%,#0b0313)" }}>
      <Glow accent="#e83ad3" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 430,
            height: 430,
            borderRadius: 112,
            transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
            boxShadow: "0 50px 150px #e83ad3cc",
          }}
        />
        <div
          style={{
            marginTop: 46,
            fontFamily: display,
            fontSize: 128,
            color: "white",
            transform: `translateY(${interpolate(pop, [0, 1], [46, 0])}px)`,
            textShadow: "0 14px 66px #e83ad3aa",
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 22,
            padding: "16px 44px",
            borderRadius: 60,
            background: "linear-gradient(90deg,#e83ad3,#f4c43c)",
            opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <span style={{ fontFamily: body, fontWeight: 800, fontSize: 52, color: "white" }}>uniqueapp.fun</span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: body,
            fontWeight: 700,
            fontSize: 42,
            color: "rgba(255,255,255,.9)",
            opacity: interpolate(frame, [16, 34], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Welcome — one app, endless ways to earn
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CardScene: React.FC<{ card: Card }> = ({ card }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 140 } });
  const fade = interpolate(frame, [card.frames - 10, card.frames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [0, card.frames], [1.05, 1.16], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: "#07030d" }}>
      <Img
        src={staticFile(`social-wall-cine/${card.image}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(6,2,12,.85) 0%,rgba(6,2,12,.2) 32%,rgba(6,2,12,.55) 62%,rgba(6,2,12,.95) 100%)",
        }}
      />
      <Glow accent={card.accent} />
      <BrandBadge accent={card.accent} />
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 300, zIndex: 8 }}>
        <div
          style={{
            transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px)`,
            fontFamily: body,
            fontWeight: 800,
            fontSize: 100,
            lineHeight: 1,
            color: "white",
            textShadow: `0 14px 56px rgba(0,0,0,.85), 0 0 70px ${card.accent}66`,
          }}
        >
          {card.title}
        </div>
        <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
          {card.items.map((item, i) => (
            <div
              key={item}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                fontFamily: body,
                fontWeight: 700,
                fontSize: 38,
                color: "white",
                opacity: interpolate(frame, [6 + i * 7, 20 + i * 7], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateX(${interpolate(frame, [6 + i * 7, 20 + i * 7], [-30, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}px)`,
              }}
            >
              <span style={{ color: card.accent, fontWeight: 800 }}>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 40px",
          borderRadius: 60,
          background: `linear-gradient(90deg,${card.accent},#f4c43c)`,
          boxShadow: `0 18px 56px ${card.accent}99`,
          zIndex: 9,
        }}
      >
        <Img src={staticFile("home/logo.png")} style={{ width: 48, height: 48, borderRadius: 14 }} />
        <span style={{ fontFamily: body, fontWeight: 800, fontSize: 38, color: "white" }}>uniqueapp.fun</span>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 130 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg,#0b0313,#3b0b46 55%,#0b0313)" }}>
      <Glow accent="#f0b90b" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 320,
            height: 320,
            borderRadius: 86,
            transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])})`,
            boxShadow: "0 40px 130px #e83ad3cc",
          }}
        />
        <div style={{ marginTop: 34, fontFamily: display, fontSize: 108, color: "white" }}>Unique</div>
        <div
          style={{
            marginTop: 20,
            padding: "18px 48px",
            borderRadius: 60,
            background: "linear-gradient(90deg,#e83ad3,#f4c43c)",
            opacity: interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <span style={{ fontFamily: body, fontWeight: 800, fontSize: 56, color: "white" }}>uniqueapp.fun</span>
        </div>
        <div style={{ marginTop: 26, fontFamily: body, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,.9)" }}>
          Join today and start earning
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const UniqueTeaser: React.FC = () => {
  let from = INTRO_FRAMES;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.12} loop />
      <Audio src={staticFile("teaser-voice/en.mp3")} volume={1} />
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <IntroScene />
      </Sequence>
      {CARDS.map((card) => {
        const start = from;
        from += card.frames;
        return (
          <Sequence key={card.title} from={start} durationInFrames={card.frames}>
            <CardScene card={card} />
          </Sequence>
        );
      })}
      <Sequence from={from} durationInFrames={OUTRO_FRAMES}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
