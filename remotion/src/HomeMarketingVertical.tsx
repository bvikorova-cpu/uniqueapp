import React from "react";
import { AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700"] });
const body = loadBody("normal", { weights: ["500", "700", "900"] });

const FPS = 30;
export const HOME_V_DURATION = 600; // 20s

const BRAND = { purple: "#8b5cf6",
  pink: "#ec4899",
  amber: "#fbbf24",
  bgDeep: "#0a0014",
  white: "#ffffff" };

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, HOME_V_DURATION], [1.1, 1.25]);
  const ty = interpolate(frame, [0, HOME_V_DURATION], [-20, 20]);
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Img
        src={staticFile("home/backdrop.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: "saturate(1.15) brightness(0.9)" }}
      />
      <AbsoluteFill
        style={ {
          background:
            "radial-gradient(ellipse at center, rgba(10,0,20,0) 0%, rgba(10,0,20,0.6) 100%)" }}
      />
    </AbsoluteFill>
  );
};

const Orbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 10, y: 15, r: 360, c: BRAND.purple, s: 0.7 },
    { x: 78, y: 25, r: 320, c: BRAND.pink, s: 1.1 },
    { x: 15, y: 65, r: 400, c: BRAND.pink, s: 0.9 },
    { x: 72, y: 82, r: 340, c: BRAND.purple, s: 1.3 },
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
              mixBlendMode: "screen" }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const useEnterExit = (duration: number, exitLen = 18) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const exit = interpolate(frame, [duration - exitLen, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  return { enter, exit, opacity: enter * (1 - exit), frame };
};

/* Scene 1: Intro */
const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 110 } });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);
  const wordOp = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [18, 42], [40, 0], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [50, 75], [20, 0], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={ {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: 1 - exit }}
    >
      <div
        style={{
          transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
          filter: "drop-shadow(0 20px 60px rgba(236,72,153,0.55))" }}
      >
        <Img
          src={staticFile("home/logo.png")}
          style={{ width: 340, height: 340, borderRadius: 84 }}
        />
      </div>
      <div
        style={{
          marginTop: 50,
          opacity: wordOp,
          transform: `translateY(${wordY}px)`,
          fontFamily: display.fontFamily,
          fontSize: 260,
          lineHeight: 1,
          background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 80px rgba(236,72,153,0.5)",
          letterSpacing: "-0.02em" }}
      >
        Unique
      </div>
      <div
        style={{
          marginTop: 24,
          opacity: tagOp,
          transform: `translateY(${tagY}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 46,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.28em",
          textTransform: "uppercase" }}
      >
        Welcome Home
      </div>
    </AbsoluteFill>
  );
};

/* Scene 2: Tagline */
const SceneTagline: React.FC<{ duration: number }> = ({ duration }) => {
  const { opacity, frame } = useEnterExit(duration);
  const l1o = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const l1y = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });
  const l2o = interpolate(frame, [14, 30], [0, 1], { extrapolateRight: "clamp" });
  const l2y = interpolate(frame, [14, 30], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={ {
        alignItems: "center",
        justifyContent: "center",
        opacity,
        color: BRAND.white,
        textAlign: "center",
        padding: 60,
        flexDirection: "column" }}
    >
      <div
        style={{
          opacity: l1o,
          transform: `translateY(${l1y}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 500,
          fontSize: 78,
          color: "rgba(255,255,255,0.85)" }}
      >
        One home for
      </div>
      <div
        style={{
          opacity: l2o,
          transform: `translateY(${l2y}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1.02,
          marginTop: 30,
          letterSpacing: "-0.03em",
          background: `linear-gradient(90deg, ${BRAND.amber} 0%, #fde68a 50%, ${BRAND.pink} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 60px rgba(251,191,36,0.35)" }}
      >
        everything you love.
      </div>
    </AbsoluteFill>
  );
};

/* Scene 3: Modules 2-col */
type ModuleDef = { label: string; color: string; icon: React.ReactNode };
const I = (d: string) => (
  <svg viewBox="0 0 24 24" width="90" height="90" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const MODULES: ModuleDef[] = [
  { label: "Wall", color: "#8b5cf6", icon: I("M4 5h16v14H4zM4 9h16M8 5v14") },
  { label: "Dating", color: "#ec4899", icon: I("M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z") },
  { label: "Kids", color: "#f59e0b", icon: I("M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 22c0-4 4-6 8-6s8 2 8 6") },
  { label: "Megatalent", color: "#fbbf24", icon: I("M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0z") },
  { label: "AI Studio", color: "#a855f7", icon: I("M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z") },
  { label: "Marketplace", color: "#10b981", icon: I("M3 7h18l-2 12H5zM8 7V5a4 4 0 0 1 8 0v2") },
  { label: "Music", color: "#3b82f6", icon: I("M9 18V5l12-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM21 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z") },
  { label: "Health", color: "#ef4444", icon: I("M22 12h-4l-3 8-6-16-3 8H2") },
];

const SceneModules: React.FC<{ duration: number }> = ({ duration }) => { const frame = useCurrentFrame();
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 18], [-25, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={ {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: 1 - exit,
        padding: 60 }}
    >
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 100,
          color: BRAND.white,
          letterSpacing: "-0.02em",
          marginBottom: 60,
          textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}
      >
        Explore your Home
      </div>
      <div
        style={ {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 36,
          width: "92%" }}
      >
        {MODULES.map((m, i) => {
          const delay = 12 + i * 5;
          const s = spring({
            frame: frame - delay,
            fps: FPS,
            config: { damping: 14, stiffness: 140 } });
          const y = interpolate(s, [0, 1], [80, 0]);
          return (
            <div
              key={m.label}
              style={{
                opacity: s,
                transform: `translateY(${y}px) scale(${0.85 + s * 0.15})`,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 40,
                padding: "44px 28px",
                textAlign: "center",
                boxShadow: `0 20px 60px -20px ${m.color}66` }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  margin: "0 auto 24px",
                  borderRadius: 40,
                  background: `linear-gradient(135deg, ${m.color} 0%, ${BRAND.pink} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 15px 40px -10px ${m.color}aa` }}
              >
                {m.icon}
              </div>
              <div
                style={ {
                  fontFamily: body.fontFamily,
                  fontWeight: 800,
                  fontSize: 46,
                  color: BRAND.white,
                  letterSpacing: "-0.01em" }}
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

/* Scene 4: Stats 2x2 */
const STATS = [
  { value: "40+", label: "Modules" },
  { value: "25+", label: "AI Tools" },
  { value: "€10k", label: "Prizes" },
  { value: "12", label: "Languages" },
];

const SceneStats: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { opacity } = useEnterExit(duration);
  return (
    <AbsoluteFill
      style={ {
        alignItems: "center",
        justifyContent: "center",
        opacity }}
    >
      <div
        style={ {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 80,
          width: "88%" }}
      >
        {STATS.map((s, i) => {
          const delay = i * 6;
          const sp = spring({
            frame: frame - delay,
            fps: FPS,
            config: { damping: 12, stiffness: 120 } });
          const y = interpolate(sp, [0, 1], [60, 0]);
          return (
            <div key={s.label} style={{ opacity: sp, transform: `translateY(${y}px)`, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: body.fontFamily,
                  fontWeight: 900,
                  fontSize: 220,
                  lineHeight: 1,
                  background: `linear-gradient(180deg, ${BRAND.white} 0%, ${BRAND.amber} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.04em",
                  textShadow: "0 0 60px rgba(251,191,36,0.3)" }}
              >
                {s.value}
              </div>
              <div
                style={ {
                  marginTop: 12,
                  fontFamily: body.fontFamily,
                  fontWeight: 600,
                  fontSize: 42,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" }}
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

/* Scene 5: Outro */
const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const wordS = spring({ frame: frame - 12, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Img
        src={staticFile("home/logo.png")}
        style={{
          width: 280,
          height: 280,
          borderRadius: 72,
          transform: `scale(${logoS})`,
          filter: "drop-shadow(0 15px 50px rgba(236,72,153,0.55))" }}
      />
      <div
        style={{
          marginTop: 30,
          fontFamily: display.fontFamily,
          fontSize: 260,
          lineHeight: 1,
          opacity: wordS,
          transform: `translateY(${(1 - wordS) * 30}px)`,
          background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 60px rgba(236,72,153,0.45)" }}
      >
        Unique
      </div>
      <div
        style={ {
          marginTop: 40,
          opacity: urlOp,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 78,
          color: BRAND.white,
          letterSpacing: "0.05em" }}
      >
        uniqueapp.fun
      </div>
      <div
        style={ {
          marginTop: 24,
          opacity: tagOp,
          fontFamily: body.fontFamily,
          fontWeight: 500,
          fontSize: 40,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          textAlign: "center" }}
      >
        Install PWA · 16+
      </div>
    </AbsoluteFill>
  );
};

type SceneDef = { from: number; duration: number; component: React.FC<{ duration: number }> };
const SCENES: SceneDef[] = [
  { from: 0, duration: 120, component: SceneIntro },
  { from: 120, duration: 90, component: SceneTagline },
  { from: 210, duration: 180, component: SceneModules },
  { from: 390, duration: 90, component: SceneStats },
  { from: 480, duration: 120, component: SceneOutro },
];

export const HomeMarketingVertical: React.FC = () => {
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
