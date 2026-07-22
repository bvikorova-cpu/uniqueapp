import React from "react";
import { AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700"] });
const body = loadBody("normal", { weights: ["500", "600", "700", "900"] });

const FPS = 30;

const BRAND = { white: "#ffffff",
  bgDeep: "#07030f",
  purple: "#8b5cf6",
  pink: "#ec4899",
  amber: "#fbbf24" };

const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 110 } });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);
  const wordOp = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [18, 42], [40, 0], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [50, 78], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [50, 78], [20, 0], { extrapolateRight: "clamp" });
  const kb = interpolate(frame, [0, duration], [1.08, 1.2], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 20, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img
          src={staticFile("fundraising/01-hub.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(5,0,20,0.62)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={ {
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: 1 - exit }}
      >
        <div style={{ transform: `scale(${logoScale}) rotate(${logoRot}deg)`, filter: "drop-shadow(0 20px 60px rgba(236,72,153,0.55))" }}>
          <Img src={staticFile("home/logo.png")} style={{ width: 340, height: 340, borderRadius: 84 }} />
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
            fontSize: 44,
            color: "rgba(255,255,255,0.94)",
            letterSpacing: "0.28em",
            textTransform: "uppercase" }}
        >
          Fundraising
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ScenePromise: React.FC<{ duration: number }> = ({ duration }) => { const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 20, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  const l1o = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const l1y = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: "clamp" });
  const l2o = interpolate(frame, [16, 34], [0, 1], { extrapolateRight: "clamp" });
  const l2y = interpolate(frame, [16, 34], [40, 0], { extrapolateRight: "clamp" });
  const l3o = interpolate(frame, [34, 54], [0, 1], { extrapolateRight: "clamp" });
  const l3y = interpolate(frame, [34, 54], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <AbsoluteFill
        style={ {
          background:
            "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.4), transparent 55%), radial-gradient(circle at 70% 70%, rgba(251,191,36,0.35), transparent 55%)" }}
      />
      <AbsoluteFill
        style={ {
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 80,
          textAlign: "center",
          opacity }}
      >
        <div
          style={{
            opacity: l1o,
            transform: `translateY(${l1y}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 500,
            fontSize: 72,
            color: "rgba(255,255,255,0.82)" }}
        >
          Small gifts.
        </div>
        <div
          style={{
            opacity: l2o,
            transform: `translateY(${l2y}px)`,
            marginTop: 30,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            background: `linear-gradient(90deg, ${BRAND.amber} 0%, ${BRAND.pink} 50%, ${BRAND.purple} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent" }}
        >
          Big change.
        </div>
        <div
          style={{
            opacity: l3o,
            transform: `translateY(${l3y}px)`,
            marginTop: 40,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 48,
            color: "rgba(255,255,255,0.9)",
            maxWidth: 900 }}
        >
          Every donation. Every dream. Every life changed.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Module = {
  badge: string;
  title: string;
  subtitle: string;
  perks: string[];
  image: string;
  accent: string;
  accent2: string;
};

const ModuleScene: React.FC<{ duration: number; mod: Module }> = ({ duration, mod }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  const shellOp = enter * (1 - exit);
  const kbScale = interpolate(frame, [0, duration], [1.1, 1.28], { extrapolateRight: "clamp" });
  const kbX = interpolate(frame, [0, duration], [-20, 20]);
  const kbY = interpolate(frame, [0, duration], [-14, 14]);
  const badgeOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const badgeY = interpolate(frame, [4, 22], [-40, 0], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [14, 36], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [14, 36], [60, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [28, 50], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [28, 50], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shellOp }}>
      <AbsoluteFill>
        <Img
          src={staticFile(mod.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
            filter: "saturate(1.15) contrast(1.05)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${mod.accent}33 0%, transparent 40%, ${mod.accent2}55 100%)`,
          mixBlendMode: "screen" }}
      />
      <AbsoluteFill
        style={ {
          background:
            "linear-gradient(180deg, rgba(7,3,15,0.75) 0%, rgba(7,3,15,0.15) 22%, rgba(7,3,15,0) 45%, rgba(7,3,15,0.35) 62%, rgba(7,3,15,0.92) 100%)" }}
      />
      <AbsoluteFill
        style={ {
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          padding: 80,
          paddingTop: 160,
          paddingBottom: 180 }}
      >
        <div
          style={{
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
            padding: "18px 44px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${mod.accent}, ${mod.accent2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 34,
            color: BRAND.white,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            boxShadow: `0 20px 60px -15px ${mod.accent}cc` }}
        >
          {mod.badge}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 900,
              fontSize: 150,
              lineHeight: 1,
              color: BRAND.white,
              letterSpacing: "-0.035em",
              textShadow: "0 8px 40px rgba(0,0,0,0.75)",
              textAlign: "center" }}
          >
            {mod.title}
          </div>
          <div
            style={{
              marginTop: 28,
              opacity: subOp,
              transform: `translateY(${subY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 600,
              fontSize: 42,
              color: "rgba(255,255,255,0.94)",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.25,
              textShadow: "0 4px 20px rgba(0,0,0,0.85)" }}
          >
            {mod.subtitle}
          </div>
          <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 16, width: "88%" }}>
            {mod.perks.map((p, i) => {
              const delay = 44 + i * 10;
              const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 15, stiffness: 130 } });
              const x = interpolate(s, [0, 1], [-60, 0]);
              return (
                <div
                  key={p}
                  style={{
                    opacity: s,
                    transform: `translateX(${x}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "18px 26px",
                    borderRadius: 22,
                    background: "rgba(7,3,15,0.55)",
                    border: `1px solid ${mod.accent}66`,
                    boxShadow: `0 10px 40px -20px ${mod.accent}aa` }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${mod.accent}, ${mod.accent2})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0 }}
                  >
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                  <div
                    style={ {
                      fontFamily: body.fontFamily,
                      fontWeight: 700,
                      fontSize: 36,
                      color: BRAND.white,
                      letterSpacing: "-0.01em" }}
                  >
                    {p}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const wordS = spring({ frame: frame - 12, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 15, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={ {
          background:
            "radial-gradient(circle at 50% 45%, rgba(251,191,36,0.5), transparent 60%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.4), transparent 60%)" }}
      />
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
            fontSize: 240,
            lineHeight: 1,
            opacity: wordS,
            transform: `translateY(${(1 - wordS) * 30}px)`,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fde68a 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(251,191,36,0.45)" }}
        >
          Unique
        </div>
        <div
          style={ {
            marginTop: 40,
            opacity: urlOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 68,
            color: BRAND.white,
            letterSpacing: "0.05em" }}
        >
          uniqueapp.fun
        </div>
        <div
          style={ {
            marginTop: 26,
            opacity: tagOp,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 40,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900 }}
        >
          Give · Help · Change lives
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MODULES: Module[] = [
  { badge: "Fundraising Hub",
    title: "One place. Every cause.",
    subtitle: "Browse and back real people, families and dreams — all in one hub.",
    perks: ["Verified campaigns only", "Instant secure donations", "Track every euro raised"],
    image: "fundraising/01-hub.jpg",
    accent: "#ec4899",
    accent2: "#fbbf24" },
  { badge: "Medical Fundraising",
    title: "Give life a chance.",
    subtitle: "Help families cover treatments, surgeries and recovery.",
    perks: ["Doctor-verified stories", "Transparent goal tracking", "Only 6% platform fee"],
    image: "fundraising/02-medical.jpg",
    accent: "#22d3ee",
    accent2: "#8b5cf6" },
  { badge: "Dream Maker",
    title: "Make a dream real.",
    subtitle: "Turn wild wishes into reality — trips, gear, once-in-a-lifetime moments.",
    perks: ["Personal dream pages", "Community shout-outs", "Only 7% platform fee"],
    image: "fundraising/03-dream.jpg",
    accent: "#a855f7",
    accent2: "#fbbf24" },
  { badge: "Community Hero",
    title: "Lift your neighborhood.",
    subtitle: "Fund local heroes, initiatives and grassroots projects.",
    perks: ["Local impact stories", "Volunteer & donate", "Only 5% platform fee"],
    image: "fundraising/04-community.jpg",
    accent: "#22c55e",
    accent2: "#fbbf24" },
  { badge: "Pet Rescue",
    title: "Save a furry life.",
    subtitle: "Support shelters, vet bills and adoptions for animals in need.",
    perks: ["Shelter-verified cases", "Before & after updates", "Only 6% platform fee"],
    image: "fundraising/05-pets.jpg",
    accent: "#f97316",
    accent2: "#ec4899" },
  { badge: "Student Support",
    title: "Fuel bright futures.",
    subtitle: "Scholarships, tuition and study gear for hard-working students.",
    perks: ["School-verified profiles", "Progress reports to donors", "Only 5% platform fee"],
    image: "fundraising/06-student.jpg",
    accent: "#3b82f6",
    accent2: "#fbbf24" },
  { badge: "Crisis Relief",
    title: "Act when it matters.",
    subtitle: "Rapid response funds for disasters, emergencies and war zones.",
    perks: ["Real-time relief updates", "Vetted partner NGOs", "Only 8% platform fee"],
    image: "fundraising/07-crisis.jpg",
    accent: "#ef4444",
    accent2: "#fbbf24" },
  { badge: "Talent Sponsorship",
    title: "Back the next star.",
    subtitle: "Sponsor athletes, artists and creators chasing their dream.",
    perks: ["Talent portfolios & videos", "Sponsor perks & shout-outs", "Only 10% platform fee"],
    image: "fundraising/08-talent.jpg",
    accent: "#fbbf24",
    accent2: "#ec4899" },
];


const INTRO = 130;
const PROMISE = 90;
const MODULE_DUR = 110;
const OUTRO = 130;

export const FUNDRAISING_DURATION = INTRO + PROMISE + MODULES.length * MODULE_DUR + OUTRO;

export const FundraisingFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const total = FUNDRAISING_DURATION;
  const musicVolume = (f: number) => {
    const fadeIn = interpolate(f, [0, 20], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 40, total - 5], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.min(fadeIn, fadeOut);
  };

  let cursor = 0;
  const sequences: React.ReactNode[] = [];
  sequences.push(
    <Sequence key="intro" from={cursor} durationInFrames={INTRO}>
      <SceneIntro duration={INTRO} />
    </Sequence>
  );
  cursor += INTRO;
  sequences.push(
    <Sequence key="promise" from={cursor} durationInFrames={PROMISE}>
      <ScenePromise duration={PROMISE} />
    </Sequence>
  );
  cursor += PROMISE;
  MODULES.forEach((mod, i) => {
    sequences.push(
      <Sequence key={`m${i}`} from={cursor} durationInFrames={MODULE_DUR}>
        <ModuleScene duration={MODULE_DUR} mod={mod} />
      </Sequence>
    );
    cursor += MODULE_DUR;
  });
  sequences.push(
    <Sequence key="outro" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Audio src={staticFile("challenges/audio/bg.mp3")} volume={(f) => musicVolume(f)} />
      {sequences}
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};
