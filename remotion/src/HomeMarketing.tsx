import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700"] });
const body = loadBody("normal", { weights: ["500", "700", "900"] });

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const FPS = 30;
export const HOME_DURATION = 600; // 20s

const BRAND = {
  purple: "#8b5cf6",
  pink: "#ec4899",
  amber: "#fbbf24",
  bgDeep: "#0a0014",
  white: "#ffffff",
};

/* -------------------------------------------------------------------------- */
/*  Persistent atmospheric background                                          */
/* -------------------------------------------------------------------------- */

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, HOME_DURATION], [1.05, 1.18]);
  const tx = interpolate(frame, [0, HOME_DURATION], [-15, 15]);
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Img
        src={staticFile("home/backdrop.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${tx}px)`,
          filter: "saturate(1.15) brightness(0.95)",
        }}
      />
      {/* radial vignette + brand tint */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,0,20,0) 0%, rgba(10,0,20,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* Drifting glow orbs */
const Orbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 12, y: 20, r: 320, c: BRAND.purple, s: 0.7 },
    { x: 82, y: 30, r: 260, c: BRAND.pink, s: 1.1 },
    { x: 25, y: 78, r: 380, c: BRAND.pink, s: 0.9 },
    { x: 72, y: 82, r: 300, c: BRAND.purple, s: 1.3 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {orbs.map((o, i) => {
        const dy = Math.sin((frame / 60) * o.s + i) * 30;
        const dx = Math.cos((frame / 80) * o.s + i * 1.3) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.r,
              height: o.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}aa 0%, transparent 65%)`,
              transform: `translate(${dx}px, ${dy}px)`,
              filter: "blur(20px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Reusable helpers                                                          */
/* -------------------------------------------------------------------------- */

const useEnterExit = (duration: number, exitLen = 18) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const exit = interpolate(frame, [duration - exitLen, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { enter, exit, opacity: enter * (1 - exit), frame };
};

/* -------------------------------------------------------------------------- */
/*  Scene 1 — Intro: logo + wordmark                                          */
/* -------------------------------------------------------------------------- */

const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 110 } });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);

  const wordOp = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [18, 42], [40, 0], { extrapolateRight: "clamp" });

  const tagOp = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [50, 75], [20, 0], { extrapolateRight: "clamp" });

  const exit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const groupOp = 1 - exit;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: groupOp,
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
          filter: "drop-shadow(0 20px 60px rgba(236,72,153,0.55))",
        }}
      >
        <Img
          src={staticFile("home/logo.png")}
          style={{ width: 260, height: 260, borderRadius: 64 }}
        />
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: wordOp,
          transform: `translateY(${wordY}px)`,
          fontFamily: display.fontFamily,
          fontSize: 220,
          lineHeight: 1,
          background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 80px rgba(236,72,153,0.5)",
          letterSpacing: "-0.02em",
        }}
      >
        Unique
      </div>

      <div
        style={{
          marginTop: 20,
          opacity: tagOp,
          transform: `translateY(${tagY}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 38,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        Welcome Home
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 2 — Tagline reveal                                                  */
/* -------------------------------------------------------------------------- */

const SceneTagline: React.FC<{ duration: number }> = ({ duration }) => {
  const { opacity, frame } = useEnterExit(duration);
  const line1Op = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const line1Y = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });
  const line2Op = interpolate(frame, [14, 30], [0, 1], { extrapolateRight: "clamp" });
  const line2Y = interpolate(frame, [14, 30], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        fontFamily: body.fontFamily,
        color: BRAND.white,
        textAlign: "center",
      }}
    >
      <div
        style={{
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
          fontWeight: 500,
          fontSize: 60,
          letterSpacing: "0.02em",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        One home for
      </div>
      <div
        style={{
          opacity: line2Op,
          transform: `translateY(${line2Y}px)`,
          fontWeight: 900,
          fontSize: 160,
          lineHeight: 1.05,
          marginTop: 20,
          letterSpacing: "-0.03em",
          background: `linear-gradient(90deg, ${BRAND.amber} 0%, #fde68a 50%, ${BRAND.pink} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 60px rgba(251,191,36,0.35)",
        }}
      >
        everything you love.
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 3 — Module grid                                                      */
/* -------------------------------------------------------------------------- */

type ModuleDef = { label: string; color: string; icon: React.ReactNode };
const I = (d: string) => (
  <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const MODULES: ModuleDef[] = [
  { label: "Wall", color: "#8b5cf6", icon: I("M4 5h16v14H4zM4 9h16M8 5v14") },
  { label: "Dating", color: "#ec4899", icon: I("M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z".replace(/^M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z/, "M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z")) },
  { label: "Kids", color: "#f59e0b", icon: I("M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 22c0-4 4-6 8-6s8 2 8 6") },
  { label: "Megatalent", color: "#fbbf24", icon: I("M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0zM4 6h2v2a2 2 0 0 1-2-2zM20 6h-2v2a2 2 0 0 0 2-2z") },
  { label: "AI Studio", color: "#a855f7", icon: I("M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z") },
  { label: "Marketplace", color: "#10b981", icon: I("M3 7h18l-2 12H5zM8 7V5a4 4 0 0 1 8 0v2") },
  { label: "Music", color: "#3b82f6", icon: I("M9 18V5l12-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM21 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z") },
  { label: "Health", color: "#ef4444", icon: I("M22 12h-4l-3 8-6-16-3 8H2") },
];


const SceneModules: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const groupExit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 18], [-25, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: 1 - groupExit,
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 80,
          color: BRAND.white,
          letterSpacing: "-0.02em",
          marginBottom: 50,
          textShadow: "0 6px 40px rgba(0,0,0,0.6)",
        }}
      >
        Explore your Home
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 32,
          width: "82%",
        }}
      >
        {MODULES.map((m, i) => {
          const delay = 14 + i * 5;
          const s = spring({
            frame: frame - delay,
            fps: FPS,
            config: { damping: 14, stiffness: 140 },
          });
          const y = interpolate(s, [0, 1], [80, 0]);
          return (
            <div
              key={m.label}
              style={{
                opacity: s,
                transform: `translateY(${y}px) scale(${0.85 + s * 0.15})`,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 32,
                padding: "36px 28px",
                textAlign: "center",
                backdropFilter: "none",
                boxShadow: `0 20px 60px -20px ${m.color}66`,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  margin: "0 auto 20px",
                  borderRadius: 28,
                  background: `linear-gradient(135deg, ${m.color} 0%, ${BRAND.pink} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 60,
                  boxShadow: `0 15px 40px -10px ${m.color}aa`,
                }}
              >
                {m.emoji}
              </div>
              <div
                style={{
                  fontFamily: body.fontFamily,
                  fontWeight: 800,
                  fontSize: 30,
                  color: BRAND.white,
                  letterSpacing: "-0.01em",
                }}
              >
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 4 — Stats                                                            */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "40+", label: "Modules" },
  { value: "25+", label: "AI Tools" },
  { value: "€10k", label: "Quarterly Prizes" },
  { value: "12", label: "Languages" },
];

const SceneStats: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { opacity } = useEnterExit(duration);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 100,
          alignItems: "flex-end",
        }}
      >
        {STATS.map((s, i) => {
          const delay = i * 6;
          const sp = spring({
            frame: frame - delay,
            fps: FPS,
            config: { damping: 12, stiffness: 120 },
          });
          const y = interpolate(sp, [0, 1], [60, 0]);
          return (
            <div key={s.label} style={{ opacity: sp, transform: `translateY(${y}px)`, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: body.fontFamily,
                  fontWeight: 900,
                  fontSize: 180,
                  lineHeight: 1,
                  background: `linear-gradient(180deg, ${BRAND.white} 0%, ${BRAND.amber} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.04em",
                  textShadow: "0 0 60px rgba(251,191,36,0.3)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: body.fontFamily,
                  fontWeight: 600,
                  fontSize: 32,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Scene 5 — Outro                                                            */
/* -------------------------------------------------------------------------- */

const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const wordS = spring({ frame: frame - 12, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 180,
            height: 180,
            borderRadius: 44,
            transform: `scale(${logoS})`,
            filter: "drop-shadow(0 15px 50px rgba(236,72,153,0.55))",
          }}
        />
        <div
          style={{
            fontFamily: display.fontFamily,
            fontSize: 220,
            lineHeight: 1,
            opacity: wordS,
            transform: `translateX(${(1 - wordS) * -30}px)`,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(236,72,153,0.45)",
          }}
        >
          Unique
        </div>
      </div>
      <div
        style={{
          marginTop: 40,
          opacity: urlOp,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 60,
          color: BRAND.white,
          letterSpacing: "0.05em",
        }}
      >
        uniqueapp.fun
      </div>
      <div
        style={{
          marginTop: 18,
          opacity: tagOp,
          fontFamily: body.fontFamily,
          fontWeight: 500,
          fontSize: 30,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        Install the PWA · Age 16+
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  Root composition                                                          */
/* -------------------------------------------------------------------------- */

type SceneDef = { from: number; duration: number; component: React.FC<{ duration: number }> };

const SCENES: SceneDef[] = [
  { from: 0, duration: 120, component: SceneIntro },
  { from: 120, duration: 90, component: SceneTagline },
  { from: 210, duration: 180, component: SceneModules },
  { from: 390, duration: 90, component: SceneStats },
  { from: 480, duration: 120, component: SceneOutro },
];

export const HomeMarketing: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Backdrop />
      <Orbs />
      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          <s.component duration={s.duration} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
