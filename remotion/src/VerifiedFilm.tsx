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
const body = loadBody("normal", { weights: ["500", "600", "700", "900"] });

const FPS = 30;

const BRAND = { white: "#ffffff",
  bgDeep: "#07040f",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gold: "#fbbf24",
  sky: "#38bdf8" };

const CheckIcon: React.FC<{ size: number; color: string; glow: string }> = ({ size, color, glow }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    style={{ filter: `drop-shadow(0 0 30px ${glow})` }}
  >
    <path d="M12 2c-.7 0-1.3.3-1.7.7L8.4 4.7c-.3.3-.7.5-1.1.5H4.5c-.9 0-1.7.8-1.7 1.7v2.8c0 .4-.2.8-.5 1.1L.3 12.7C-.1 13.4-.1 14.4.3 15.1l2 2c.3.3.5.7.5 1.1v2.8c0 .9.8 1.7 1.7 1.7h2.8c.4 0 .8.2 1.1.5l1.9 2c.7.5 1.7.5 2.4 0l1.9-2c.3-.3.7-.5 1.1-.5h2.8c.9 0 1.7-.8 1.7-1.7v-2.8c0-.4.2-.8.5-1.1l2-2c.5-.7.5-1.7 0-2.4l-2-2c-.3-.3-.5-.7-.5-1.1V6.9c0-.9-.8-1.7-1.7-1.7h-2.8c-.4 0-.8-.2-1.1-.5l-1.9-2C13.3 2.3 12.7 2 12 2z" />
    <path
      d="M10.4 16.2 6.8 12.6l1.4-1.4 2.2 2.2 5.4-5.4 1.4 1.4z"
      fill="white"
    />
  </svg>
);

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
  const pulse = Math.sin(frame / 6) * 0.05 + 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img
          src={staticFile("verified/00-hero.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(4,2,14,0.72)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - exit }}
      >
        <div
          style={{
            transform: `scale(${logoScale * pulse}) rotate(${logoRot}deg)`,
            filter: "drop-shadow(0 20px 80px rgba(139,92,246,0.75))" }}
        >
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
            textShadow: "0 0 80px rgba(236,72,153,0.55)",
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
            fontWeight: 900,
            fontSize: 56,
            color: BRAND.gold,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 4px 30px rgba(251,191,36,0.6)" }}
        >
          Verified
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Tier = {
  badge: string;
  title: string;
  price: string;
  subtitle: string;
  perks: string[];
  image: string;
  color: string;
  color2: string;
  ringColor: string;
};

const TierScene: React.FC<{ duration: number; tier: Tier }> = ({ duration, tier }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  const shellOp = enter * (1 - exit);
  const kbScale = interpolate(frame, [0, duration], [1.1, 1.28], { extrapolateRight: "clamp" });
  const kbX = interpolate(frame, [0, duration], [-20, 20]);
  const kbY = interpolate(frame, [0, duration], [-14, 14]);

  const badgeScale = spring({ frame: frame - 6, fps: FPS, config: { damping: 8, stiffness: 120 } });
  const badgeRot = interpolate(badgeScale, [0, 1], [-180, 0]);
  const pulse = Math.sin(frame / 8) * 0.04 + 1;

  const titleOp = interpolate(frame, [20, 42], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [20, 42], [60, 0], { extrapolateRight: "clamp" });
  const priceScale = spring({ frame: frame - 34, fps: FPS, config: { damping: 10, stiffness: 140 } });
  const subOp = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [40, 60], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shellOp }}>
      <AbsoluteFill>
        <Img
          src={staticFile(tier.image)}
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
          background: `linear-gradient(160deg, ${tier.color}55 0%, transparent 40%, ${tier.color2}66 100%)`,
          mixBlendMode: "screen" }}
      />
      <AbsoluteFill
        style={ {
          background:
            "linear-gradient(180deg, rgba(7,4,15,0.85) 0%, rgba(7,4,15,0.2) 22%, rgba(7,4,15,0) 45%, rgba(7,4,15,0.45) 62%, rgba(7,4,15,0.96) 100%)" }}
      />
      <AbsoluteFill
        style={ {
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          padding: 80,
          paddingTop: 120,
          paddingBottom: 160 }}
      >
        {/* Big animated badge check */}
        <div
          style={{
            transform: `scale(${badgeScale * pulse}) rotate(${badgeRot}deg)` }}
        >
          <CheckIcon size={280} color={tier.color} glow={tier.ringColor} />
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
              background: `linear-gradient(180deg, ${BRAND.white} 0%, ${tier.color} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.035em",
              textShadow: "0 8px 40px rgba(0,0,0,0.75)",
              textAlign: "center" }}
          >
            {tier.title}
          </div>
          <div
            style={{
              marginTop: 14,
              transform: `scale(${priceScale})`,
              opacity: priceScale,
              padding: "16px 44px",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${tier.color}, ${tier.color2})`,
              fontFamily: body.fontFamily,
              fontWeight: 900,
              fontSize: 62,
              color: BRAND.white,
              letterSpacing: "-0.02em",
              boxShadow: `0 20px 60px -15px ${tier.color}cc`,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          >
            {tier.price}
          </div>
          <div
            style={{
              marginTop: 26,
              opacity: subOp,
              transform: `translateY(${subY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 600,
              fontSize: 40,
              color: "rgba(255,255,255,0.94)",
              textAlign: "center",
              maxWidth: 1100,
              lineHeight: 1.25,
              textShadow: "0 4px 20px rgba(0,0,0,0.85)" }}
          >
            {tier.subtitle}
          </div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14, width: "88%" }}>
            {tier.perks.map((p, i) => {
              const delay = 54 + i * 10;
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
                    padding: "16px 26px",
                    borderRadius: 22,
                    background: "rgba(7,4,15,0.6)",
                    border: `1px solid ${tier.color}66`,
                    boxShadow: `0 10px 40px -20px ${tier.color}aa` }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${tier.color}, ${tier.color2})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0 }}
                  >
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div
                    style={ {
                      fontFamily: body.fontFamily,
                      fontWeight: 700,
                      fontSize: 32,
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

      {/* Tier badge chip top-left */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          padding: "16px 38px",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${tier.color}, ${tier.color2})`,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 30,
          color: BRAND.white,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          boxShadow: `0 15px 50px -15px ${tier.color}cc`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * -30}px)` }}
      >
        {tier.badge}
      </div>
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

  // Three floating checkmarks
  const badges = [
    { color: BRAND.sky, delay: 6 },
    { color: BRAND.pink, delay: 12 },
    { color: BRAND.gold, delay: 18 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={ {
          background:
            "radial-gradient(circle at 50% 45%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.4), transparent 60%)" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 60, marginBottom: 50 }}>
          {badges.map((b, i) => {
            const s = spring({ frame: frame - b.delay, fps: FPS, config: { damping: 10, stiffness: 130 } });
            const float = Math.sin((frame + i * 20) / 10) * 8;
            return (
              <div key={i} style={{ transform: `scale(${s}) translateY(${float}px)` }}>
                <CheckIcon size={140} color={b.color} glow={b.color} />
              </div>
            );
          })}
        </div>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 220,
            height: 220,
            borderRadius: 60,
            transform: `scale(${logoS})`,
            filter: "drop-shadow(0 15px 50px rgba(139,92,246,0.75))" }}
        />
        <div
          style={{
            marginTop: 24,
            fontFamily: display.fontFamily,
            fontSize: 200,
            lineHeight: 1,
            opacity: wordS,
            transform: `translateY(${(1 - wordS) * 30}px)`,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(236,72,153,0.55)" }}
        >
          Unique
        </div>
        <div
          style={ {
            marginTop: 32,
            opacity: urlOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 60,
            color: BRAND.white,
            letterSpacing: "0.05em" }}
        >
          uniqueapp.fun/verified
        </div>
        <div
          style={ {
            marginTop: 22,
            opacity: tagOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 38,
            color: BRAND.gold,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 1100 }}
        >
          Get Verified · Stand out · Reign
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TIERS: Tier[] = [
  { badge: "Verified",
    title: "Verified.",
    price: "€15 / mo",
    subtitle: "Prove you're real. Get the gold check next to your name across the whole app.",
    perks: ["Golden check badge", "Feed priority", "Higher search visibility"],
    image: "verified/01-verified.jpg",
    color: "#fbbf24",
    color2: "#f59e0b",
    ringColor: "rgba(251,191,36,0.9)" },
  { badge: "Verified Plus",
    title: "Plus.",
    price: "€40 / mo · +100 credits",
    subtitle: "Everything in Verified — plus 100 AI credits every month and a hot-pink ring around your avatar.",
    perks: ["Hot-pink avatar ring", "100 bonus AI credits", "Priority support"],
    image: "verified/02-plus.jpg",
    color: "#ec4899",
    color2: "#db2777",
    ringColor: "rgba(236,72,153,0.9)" },
  { badge: "Verified Pro",
    title: "Pro.",
    price: "€150 / mo · +150 credits",
    subtitle: "Top tier. Purple crown badge, glowing ring, 150 AI credits and official-partner status across Unique.",
    perks: ["Royal purple partner badge", "150 bonus AI credits", "Official partner status", "Max feed priority"],
    image: "verified/03-pro.jpg",
    color: "#a855f7",
    color2: "#7e22ce",
    ringColor: "rgba(168,85,247,0.9)" },

];

const INTRO = 130;
const TIER_DUR = 150;
const OUTRO = 150;

export const VERIFIED_DURATION = INTRO + TIERS.length * TIER_DUR + OUTRO;

export const VerifiedFilm: React.FC = () => {
  let cursor = 0;
  const sequences: React.ReactNode[] = [];
  sequences.push(
    <Sequence key="intro" from={cursor} durationInFrames={INTRO}>
      <SceneIntro duration={INTRO} />
    </Sequence>
  );
  cursor += INTRO;
  TIERS.forEach((tier, i) => {
    sequences.push(
      <Sequence key={`t${i}`} from={cursor} durationInFrames={TIER_DUR}>
        <TierScene duration={TIER_DUR} tier={tier} />
      </Sequence>
    );
    cursor += TIER_DUR;
  });
  sequences.push(
    <Sequence key="outro" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );
  return <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>{sequences}</AbsoluteFill>;
};
